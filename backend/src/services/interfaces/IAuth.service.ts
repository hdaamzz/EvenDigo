import { Schema } from 'mongoose';
import {
  IAuthResponse,
  ILogin,
  IUser,
  OTPVerificationData,
  ServiceResponse,
} from 'src/models/interfaces/auth.interface';

export interface IAuthService {
  sendOTP(userData: IUser): Promise<{ success: boolean; message: string }>;

  verifyOTP(email: string, otp: string): Promise<ServiceResponse<OTPVerificationData>>;

  login(credentials: ILogin): Promise<IAuthResponse>;

  findUserByEmail(email: string): Promise<IUser | null>;

  createUser(userData: IUser): Promise<IUser>;

  updateUser(userId: Schema.Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser>;

  sendForgotPasswordEmail(email: string): Promise<ServiceResponse<null>>;

  resetPassword(email: string, token: string, newPassword: string): Promise<ServiceResponse<null>>;

  verifyFirebaseToken(
    idToken: string,
    name: string,
    profileImg?: string
  ): Promise<{
    success: boolean;
    message: string;
    user?: IUser;
    accessToken?: string;
    refreshToken?: string;
  }>;

  refreshToken(refreshToken: string): Promise<IAuthResponse>;
}
