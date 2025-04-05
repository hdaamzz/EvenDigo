
import { Schema } from 'mongoose';
import { IUser, ServiceResponse } from '../../models/interfaces/auth.interface';
import { CloudinaryUploadResult } from '../../models/interfaces/profile.interface';
import { IWallet } from '../../models/interfaces/wallet.interface';

export interface IProfileService {
  fetchUserById(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IUser>>;
  updateUserDetails(userId: Schema.Types.ObjectId | string, data: Partial<IUser>): Promise<ServiceResponse<IUser>>;
  
  verificationRequest(userId: Schema.Types.ObjectId | string): Promise<any>;
  verificationRequestDetails(userId: Schema.Types.ObjectId | string): Promise<any>;

  uploadImage(buffer: Buffer, folder?: string): Promise<CloudinaryUploadResult>;
  deleteImage(publicId: string): Promise<any>;

  getUserBookings(userId: Schema.Types.ObjectId | string): Promise<any[]>;

  addMoneyToWallet(userId: Schema.Types.ObjectId | string, amount: number, reference?: string): Promise<ServiceResponse<IWallet>>;
  withdrawMoneyFromWallet(userId: Schema.Types.ObjectId | string, amount: number): Promise<ServiceResponse<IWallet>>;
  getWalletDetails(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IWallet>>;
}
