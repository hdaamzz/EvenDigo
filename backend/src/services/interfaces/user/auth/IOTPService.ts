import { IUser, OTPVerificationData, ServiceResponse } from "../../../../models/interfaces/auth.interface";

export interface IOTPService {
  generateOTP(): string;
  storeOTP(email: string, otp: string, userData: IUser): Promise<void>;
  verifyOTP(email: string, otp: string): Promise<ServiceResponse<OTPVerificationData>>;
  deleteOTPData(email: string): Promise<void>;
}
