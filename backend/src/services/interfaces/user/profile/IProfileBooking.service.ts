import { Schema } from 'mongoose';
import { IBooking } from '../../../../models/interfaces/booking.interface';
import { ProfileServiceResponse } from '../../../../models/interfaces/profile.interface';

export interface IProfileBookingService {
  getUserBookings(
    userId: Schema.Types.ObjectId | string,
    page: number,
    limit: number
  ): Promise<{ bookings: IBooking[], totalCount: number, hasMore: boolean }>
  cancelTicket(
    userId: Schema.Types.ObjectId | string,
    bookingId: string,
    ticketUniqueId: string
  ): Promise<ProfileServiceResponse<IBooking>>;
}