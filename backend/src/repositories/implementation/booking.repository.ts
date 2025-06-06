import mongoose, { isValidObjectId, Model, Schema } from 'mongoose';
import { IBooking } from '../../models/interfaces/booking.interface';
import { IBookingRepository } from '../interfaces/IBooking.repository';
import { inject, injectable } from 'tsyringe';

@injectable()
class BookingRepository implements IBookingRepository {
  constructor(
    @inject("BookingModel") private bookingModel: Model<IBooking>
  ) { }

  async createBooking(bookingData: Partial<IBooking>): Promise<IBooking> {
    try {
      const booking = new this.bookingModel(bookingData);
      return await booking.save();
    } catch (error) {
      throw new Error(`Failed to create booking: ${(error as Error).message}`);
    }
  }

  async findBookingById(bookingId: Schema.Types.ObjectId | string): Promise<IBooking | null> {
    try {
      return await this.bookingModel.findOne({ bookingId }).exec();
    } catch (error) {
      throw new Error(`Failed to find booking: ${(error as Error).message}`);
    }
  }

  async updateBookingDetails(bookingId: Schema.Types.ObjectId | string, updateData: Partial<IBooking>): Promise<IBooking | null> {
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
  async findBookingByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingModel
        .find({ userId, paymentStatus: "Completed" }).sort({ createdAt: -1 })
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

  async findUpcomingEventBookingByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]> {
    try {
      const bookings = await this.bookingModel.aggregate([
        {
          $match: {
            userId: typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId,
            paymentStatus: 'Completed',
          },
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event',
          },
        },
        { $unwind: '$event' },
        {
          $match: {
            'event.startDate': { $gt: new Date() },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ]);

      return bookings;
    } catch (error) {
      console.error('Error in findByUserId:', error);
      throw new Error(`Failed to find bookings for user: ${(error as Error).message}`);
    }
  }

  async findBookingEventByUserId(userId: Schema.Types.ObjectId | string): Promise<any[]> {
  try {
    if (!isValidObjectId(userId)) throw new Error("Invalid userId");

    const bookings = await this.bookingModel
      .find({ userId, paymentStatus: "Completed" })
      .sort({ createdAt: -1 })
      .populate({
        path: 'eventId',
        match: { endingDate: { $lt: new Date() } }, 
        populate: {
          path: 'user_id'
        }
      })
      .exec();

    return bookings
      .filter(booking => booking.eventId) 
      .map(booking => ({
        ...(booking.eventId as any)._doc,
        bookingId: booking.bookingId
      }));

  } catch (error) {
    console.error('Error in findBookingEventByUserId:', error);
    throw new Error(`Failed to find finished bookings for user: ${(error as Error).message}`);
  }
}


  async updateBookingStatus(bookingId: Schema.Types.ObjectId | string, status: string): Promise<IBooking | null> {
    return this.bookingModel.findByIdAndUpdate(
      bookingId,
      { status },
      { new: true }
    ).exec();
  }
  async findByStripeSessionId(sessionId: string): Promise<IBooking | null> {
    const booking = await this.bookingModel.findOne({ stripeSessionId: sessionId })
      .populate('userId')
      .populate('eventId')
      .populate('eventId.user_id')
      .exec();
    return booking;
  }

  async updateTicketStatus(
    bookingId: string,
    ticketUniqueId: string,
    status: string
  ): Promise<IBooking | null> {
    return this.bookingModel.findOneAndUpdate(
      {
        bookingId,
        'tickets.uniqueId': ticketUniqueId
      },
      {
        $set: { 'tickets.$.status': status }
      },
      { new: true }
    )
      .populate('eventId')
      .populate('userId')
      .exec();
  }

  async findBookingsByEventId(
    eventId: Schema.Types.ObjectId | string,
    filters: Record<string, any> = {}
  ): Promise<IBooking[]> {
    try {
      return await this.bookingModel.find({
        eventId,
        ...filters
      }).exec();
    } catch (error) {
      throw new Error(`Failed to find bookings by event ID: ${(error as Error).message}`);
    }
  }
}

export { IBookingRepository, BookingRepository };