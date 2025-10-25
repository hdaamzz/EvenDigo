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

  async findUpcomingEventBookingByUserId(
    userId: Schema.Types.ObjectId | string,
    skip: number = 0,
    limit: number = 10
  ): Promise<IBooking[]> {
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
            'event.endingDate': { $gt: new Date() },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]);

      return bookings;
    } catch (error) {
      console.error('Error in findUpcomingEventBookingByUserId:', error);
      throw new Error(`Failed to find bookings for user: ${(error as Error).message}`);
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
    filters: Record<string ,{}> = {}
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
  async countUpcomingEventBookingByUserId(userId: Schema.Types.ObjectId | string): Promise<number> {
    try {
      const count = await this.bookingModel.aggregate([
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
            'event.endingDate': { $gt: new Date() },
          },
        },
        {
          $count: 'total'
        }
      ]);

      return count[0]?.total || 0;
    } catch (error) {
      console.error('Error in countUpcomingEventBookingByUserId:', error);
      throw new Error(`Failed to count bookings for user: ${(error as Error).message}`);
    }
  }

  async findBookingEventByUserIdWithPagination(
    userId: Schema.Types.ObjectId | string,
    page: number = 1,
    limit: number = 10
  ): Promise<IBooking[]> {
    try {
      if (!isValidObjectId(userId)) throw new Error("Invalid userId");

      const skip = (page - 1) * limit;
      const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

      const bookings = await this.bookingModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            paymentStatus: "Completed"
          }
        },
        {
          $lookup: {
            from: 'events',
            localField: 'eventId',
            foreignField: '_id',
            as: 'event'
          }
        },
        {
          $unwind: '$event'
        },
        {
          $match: {
            'event.endingDate': { $lt: new Date() }
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'event.user_id',
            foreignField: '_id',
            as: 'event.user_id'
          }
        },
        {
          $unwind: '$event.user_id'
        },
        {
          $sort: { createdAt: -1 }
        },
        {
          $skip: skip
        },
        {
          $limit: limit
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: [
                '$event',
                { bookingId: '$bookingId' }
              ]
            }
          }
        }
      ]);
      console.log(bookings);
      

      return bookings;

    } catch (error) {
      console.error('Error in findBookingEventByUserIdWithPagination:', error);
      throw new Error(`Failed to find finished bookings for user: ${(error as Error).message}`);
    }
  }
}

export { IBookingRepository, BookingRepository };