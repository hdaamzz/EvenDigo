import { Schema } from 'mongoose';
import { IBooking } from '../../models/interfaces/booking.interface';

export interface IBookingRepository {
  createBooking(bookingData: Partial<IBooking>): Promise<IBooking>;
  findBookingById(bookingId: Schema.Types.ObjectId | string): Promise<IBooking | null>;
  updateBookingDetails(bookingId: Schema.Types.ObjectId | string, updateData: Partial<IBooking>): Promise<IBooking | null>;
  findBookingEventByUserId(userId: Schema.Types.ObjectId | string): Promise<any[]>
  findBookingByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]>;
  findUpcomingEventBookingByUserId(
    userId: Schema.Types.ObjectId | string,
    skip: number,
    limit: number
  ): Promise<IBooking[]>;
  findByStripeSessionId(sessionId: string): Promise<IBooking | null>;
  updateTicketStatus(bookingId: string, ticketUniqueId: string, status: string): Promise<IBooking | null>;
  updateBookingStatus(bookingId: Schema.Types.ObjectId | string, status: string): Promise<IBooking | null>;
  findBookingsByEventId(eventId: Schema.Types.ObjectId | string, filters: Record<string, any>): Promise<IBooking[]>
  countUpcomingEventBookingByUserId(userId: Schema.Types.ObjectId | string): Promise<number>
}