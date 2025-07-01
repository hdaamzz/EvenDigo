import { IUser, OTPVerificationData, ServiceResponse } from '../../../../models/interfaces/auth.interface';
import { IAuthRepository } from '../../../../repositories/interfaces/IAuth.repository';
import { IUserRepository } from '../../../../repositories/interfaces/IUser.repository';
import { IOTPService } from '../../../../services/interfaces/user/auth/IOTPService';
import { generateOTP } from '../../../../utils/helpers';
import { inject, injectable } from 'tsyringe';

@injectable()
export class OTPService implements IOTPService {
  constructor(
    @inject("AuthRepository") private authRepository: IAuthRepository,
    @inject("UserRepository") private userRepository: IUserRepository
  ) {}

  generateOTP(): string {
    return generateOTP();
  }

  async storeOTP(email: string, otp: string, userData: IUser): Promise<void> {
    await this.authRepository.storeOTPData(email, otp, userData);
  }

  async verifyOTP(email: string, otp: string): Promise<ServiceResponse<OTPVerificationData>> {
    try {
      const otpData = await this.authRepository.getOTPData(email);

      if (!otpData) {
        return {
          success: false,
          message: 'OTP expired or invalid'
        };
      }

      if (otpData.otp !== otp.toString()) {
        return {
          success: false,
          message: 'Invalid OTP'
        };
      }

      const existingUser = await this.userRepository.findUserByEmail(email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      return {
        success: true,
        message: 'OTP verified successfully',
        data: {
          userId: undefined,
          email: email,
          name: otpData.userData.name,
          userData: otpData.userData
        }
      };
    } catch (error) {
      console.error('Verify OTP error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP'
      };
    }
  }

  async deleteOTPData(email: string): Promise<void> {
    await this.authRepository.deleteOTPData(email);
  }
}