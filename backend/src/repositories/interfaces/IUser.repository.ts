import { Schema } from 'mongoose';
import { IUser } from '../../models/interfaces/auth.interface';
import { IBaseRepository } from '../IBase.repository';

export interface IUserRepository extends IBaseRepository<IUser> {
  findUserByIdWithoutPassword(id: Schema.Types.ObjectId | string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  updateUserLastLogin(userId: Schema.Types.ObjectId | string): Promise<void>;
  blockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null>;
  unblockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null>;
  approveUserStatusChange(userId: Schema.Types.ObjectId | string): Promise<void>;
}