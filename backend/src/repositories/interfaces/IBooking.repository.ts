import { Schema } from 'mongoose';
import { IBooking } from '../../models/interfaces/booking.interface';

export interface IBookingRepository {
  create(bookingData: Partial<IBooking>): Promise<IBooking>;
  findById(bookingId: Schema.Types.ObjectId | string): Promise<IBooking | null>;
  update(bookingId: Schema.Types.ObjectId | string, updateData: Partial<IBooking>): Promise<IBooking | null>;
  findByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]>;
}