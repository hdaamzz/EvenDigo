import { Schema } from "mongoose";

export interface IUser {
  _id?: Schema.Types.ObjectId | string;
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

export interface OTPVerificationData {
  userId: Schema.Types.ObjectId | string | undefined;
  email: string;
  name?: string
}

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: Partial<IUser>;
}

export interface IJwtPayload {
  isAuthenticated: boolean,
  user: IUser,
  token: string,
  role: string
}

