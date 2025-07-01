import { Schema } from 'mongoose';
import { IVerification } from '../../../src/models/interfaces/profile.interface';

export interface IVerificationRepository {
  findAllVerificationUsers(): Promise<IVerification[]>;
  approveUser(userId: Schema.Types.ObjectId | string): Promise<IVerification | null>;
  rejectUser(userId: Schema.Types.ObjectId | string): Promise<IVerification | null>;
  createVerificationRequest(data: {}): Promise<IVerification | null>;
  getVerificationRequest(userId: Schema.Types.ObjectId | string): Promise<IVerification | null>;
  searchVerificationUsers(searchTerm: string): Promise<IVerification[]>
}
