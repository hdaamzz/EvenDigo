import { IUser, IOtpData } from '../../models/interfaces/auth.interface';

export interface IAuthRepository {
  storeOTPData(email: string, otp: string, userData: IUser): Promise<void>;
  getOTPData(email: string): Promise<IOtpData | null>;
  deleteOTPData(email: string): Promise<void>;
  storeResetToken(email: string, token: string): Promise<void>;
  getResetToken(email: string): Promise<string | null>;
  deleteResetToken(email: string): Promise<void>;
}