import { Schema } from 'mongoose';

export interface IVerificationRepository {
  findAllVerificationUsers(): Promise<any>;
  approveUser(userId: Schema.Types.ObjectId | string): Promise<any>;
  rejectUser(userId: Schema.Types.ObjectId | string): Promise<any>;
  createVerificationRequest(data: {}): Promise<any>;
  getVerificationRequest(user_id: Schema.Types.ObjectId | string): Promise<any>;
}
