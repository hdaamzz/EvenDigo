import { Schema } from 'mongoose';
import { IBooking } from '../../../../models/interfaces/booking.interface';
import { ProfileServiceResponse } from '../../../../models/interfaces/profile.interface';

export interface IProfileBookingService {
  getUserBookings(userId: Schema.Types.ObjectId | string): Promise<IBooking[]>;
  cancelTicket(
    userId: Schema.Types.ObjectId | string,
    bookingId: string,
    ticketUniqueId: string
  ): Promise<ProfileServiceResponse<IBooking>>;
}