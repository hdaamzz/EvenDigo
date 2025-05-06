import { Schema } from 'mongoose';
import { IBooking } from '../../../../../src/models/interfaces/booking.interface';
import { ProfileServiceResponse } from '../../../../../src/models/interfaces/profile.interface';

export interface IProfileBookingService {
  getUserBookings(userId: Schema.Types.ObjectId | string): Promise<IBooking[]>;
  cancelTicket(
    userId: Schema.Types.ObjectId | string,
    bookingId: string,
    ticketUniqueId: string
  ): Promise<ProfileServiceResponse<IBooking>>;
}