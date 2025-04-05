import { Model, Schema } from 'mongoose';
import { IBooking } from '../models/interfaces/booking.interface';
import { IBookingRepository } from './interfaces/IBooking.repository';
import { inject, injectable } from 'tsyringe';

@injectable()
 class BookingRepository implements IBookingRepository {
  constructor(
    @inject("BookingModel") private bookingModel: Model<IBooking>
  ) {}

  async create(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const booking = new this.bookingModel(bookingData);
      return await booking.save();
    } catch (error) {
      throw new Error(`Failed to create booking: ${(error as Error).message}`);
    }
  }

  async findById(bookingId: Schema.Types.ObjectId | string): Promise<IBooking | null> {
    try {
      return await this.bookingModel.findOne({ bookingId }).exec();
    } catch (error) {
      throw new Error(`Failed to find booking: ${(error as Error).message}`);
    }
  }

  async update(bookingId: Schema.Types.ObjectId | string, updateData: Partial<IBooking>): Promise<IBooking | null> {
    try {
      return await this.bookingModel.findOneAndUpdate(
        { bookingId },
        updateData,
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update booking: ${(error as Error).message}`);
    }
  }
  async findByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]> {
    try {
      console.log('Fetching bookings for user:', userId);

      const bookings = await this.bookingModel
        .find({ userId })
        .populate('userId')
        .populate('eventId')
        .populate('eventId.user_id')
        .exec();


      return bookings;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw new Error(`Failed to find bookings for user: ${(error as Error).message}`);
    }
  }
  async updateBookingStatus(bookingId: Schema.Types.ObjectId | string, status: string): Promise<any> {
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).exec();
  }
}

export { IBookingRepository, BookingRepository };