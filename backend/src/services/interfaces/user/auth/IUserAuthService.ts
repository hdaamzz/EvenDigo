import { Schema } from 'mongoose';
import { IAuthResponse, ILogin, IUser, ServiceResponse } from '../../../../models/interfaces/auth.interface';

export interface IUserAuthService {
  registerUser(userData: IUser, hashedPassword: string): Promise<IUser>;
  login(credentials: ILogin): Promise<IAuthResponse>;
  findUserByEmail(email: string): Promise<IUser | null>;
  findUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null>;
  updateUser(userId: Schema.Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser>;
  sendForgotPasswordEmail(email: string): Promise<ServiceResponse<null>>;
}