import { Schema, Document } from "mongoose";
import { IBooking } from "./booking.interface";

export interface IUser extends Document {
  _id: Schema.Types.ObjectId;
  userId?: Schema.Types.ObjectId | string;
  name: string;
  email: string;
  password?: string;
  profileImg?: string;
  firebaseUid?: string;
  phone?: string;
  location?: string;
  bio?: string;
  verified?: boolean;
  gender?: 'Male' | 'Female';
  role?: 'user' | 'admin';
  status?: 'active' | 'inactive' | 'blocked';
  provider?: 'local' | 'google';
  createdAt?: Date;
  updatedAt?: Date;
  profileImgPublicId?: string;
  lastLogin?: Date;
}

export interface IOtpData {
  email: string;
  otp: string;
  userData: IUser;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    userId: Schema.Types.ObjectId | string;
    email: string;
  };
}

export interface ServiceResponse<T> {
  success: boolean;
  message: string;
  data?: T;
}
export interface ServiceResponseWithMessage {
  success: boolean;
  message: string;
}

export interface ServiceResponseWithError {
  success: boolean;
  error?:string;
  data?:IBooking
}

export interface OTPVerificationData {
  userId: string | undefined;
  email: string;
  name: string;
  userData: IUser;
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  accessToken?: string;
  refreshToken?: string;
  user?: {
    id: string | Schema.Types.ObjectId;
    email: string;
    name: string;
    role?: string;
  };
}

export interface IJwtPayload {
  isAuthenticated: boolean,
  user: IUser,
  token: string,
  role: string
}