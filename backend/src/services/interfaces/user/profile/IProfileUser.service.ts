import { Schema } from 'mongoose';
import { IUser, ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { CloudinaryUploadResult } from '../../../../../src/models/interfaces/profile.interface';

export interface IProfileUserService {
  fetchUserById(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IUser>>;
  updateUserDetails(userId: Schema.Types.ObjectId | string, data: Partial<IUser>): Promise<ServiceResponse<IUser>>;
  verificationRequest(userId: Schema.Types.ObjectId | string): Promise<any>;
  verificationRequestDetails(userId: Schema.Types.ObjectId | string): Promise<any>;
  uploadImage(buffer: Buffer, folder?: string): Promise<CloudinaryUploadResult>;
  deleteImage(publicId: string): Promise<any>;
}