import { Schema } from 'mongoose';
import { IUser } from '../../models/interfaces/auth.interface';

export interface IUserRepository {
  findUserByIdWithoutPassword(id: Schema.Types.ObjectId | string): Promise<IUser | null>;
  createUser(userData: IUser): Promise<IUser>;
  findUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null>;
  findUserByEmail(email: string): Promise<IUser | null>;
  updateUserLastLogin(userId: Schema.Types.ObjectId | string): Promise<void>;
  updateUser(userId: Schema.Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser | null>;
  findAllUsers(): Promise<IUser[]>;
  blockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null>;
  unblockUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null>;
  approveUserStatusChange(userId: Schema.Types.ObjectId | string): Promise<void>;
}