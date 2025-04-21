
import { Schema } from 'mongoose';
import { IUser, ServiceResponse } from '../../models/interfaces/auth.interface';
import { CloudinaryUploadResult, ProfileServiceResponse } from '../../models/interfaces/profile.interface';
import { IWallet } from '../../models/interfaces/wallet.interface';
import { IBooking } from '../../../src/models/interfaces/booking.interface';
import { EventDocument } from '../../../src/models/interfaces/event.interface';

export interface IProfileService {
  fetchUserById(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IUser>>;
  updateUserDetails(userId: Schema.Types.ObjectId | string, data: Partial<IUser>): Promise<ServiceResponse<IUser>>;
  
  verificationRequest(userId: Schema.Types.ObjectId | string): Promise<any>;
  verificationRequestDetails(userId: Schema.Types.ObjectId | string): Promise<any>;

  uploadImage(buffer: Buffer, folder?: string): Promise<CloudinaryUploadResult>;
  deleteImage(publicId: string): Promise<any>;
  getUserEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEvent(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  getUserBookings(userId: Schema.Types.ObjectId | string): Promise<IBooking[]>;
  getWalletDetails(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>>;
  cancelTicket(userId: Schema.Types.ObjectId | string,bookingId: string,ticketUniqueId: string): Promise<ProfileServiceResponse<IBooking>> ;
  
}
