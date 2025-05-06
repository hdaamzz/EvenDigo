import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import { IAuthService } from 'src/services/interfaces/IAuth.service';
import { IUserAuthService } from 'src/services/interfaces/user/auth/IUserAuthService';
import { IOTPService } from 'src/services/interfaces/user/auth/IOTPService';
import { IPasswordService } from 'src/services/interfaces/user/auth/IPasswordService';
import { IEmailService } from 'src/services/interfaces/user/auth/IEmailService';
import { IFirebaseAuthService } from 'src/services/interfaces/user/auth/IFirebaseAuthService';
import { IAuthResponse, ILogin, IUser, OTPVerificationData, ServiceResponse } from 'src/models/interfaces/auth.interface';


@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject("UserAuthService") private userAuthService: IUserAuthService,
    @inject("OTPService") private otpService: IOTPService,
    @inject("PasswordService") private passwordService: IPasswordService,
    @inject("EmailService") private emailService: IEmailService,
    @inject("FirebaseAuthService") private firebaseAuthService: IFirebaseAuthService
  ) {}

  async sendOTP(userData: IUser): Promise<{ success: boolean; message: string }> {
    try {
      const existingUser = await this.userAuthService.findUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      const otp = this.otpService.generateOTP();
      await this.otpService.storeOTP(userData.email, otp, userData);
      await this.emailService.sendOTPEmail(userData.email, userData.name, otp);

      return {
        success: true,
        message: 'OTP sent successfully'
      };
    } catch (error) {
      console.error('Send OTP error:', error);
      throw new Error('Failed to send OTP');
    }
  }

  async verifyOTP(email: string, otp: string): Promise<ServiceResponse<OTPVerificationData>> {
    try {
      const verificationResult = await this.otpService.verifyOTP(email, otp);
      
      if (!verificationResult.success) {
        return verificationResult;
      }
      
      if (!verificationResult.data?.userData?.password) {
        throw new Error('OTP user data is incomplete');
      }
      
      const hashedPassword = await this.passwordService.hashPassword(verificationResult.data.userData.password);
      
      const user = await this.userAuthService.registerUser(verificationResult.data.userData, hashedPassword);
      
      await this.otpService.deleteOTPData(email);
      
      return {
        success: true,
        message: 'Registration successful',
        data: {
          userId: user?._id?.toString() || '',
          email: user.email,
          name: user.name,
          userData: verificationResult.data.userData
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

  async login(credentials: ILogin): Promise<IAuthResponse> {
    return this.userAuthService.login(credentials);
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userAuthService.findUserByEmail(email);
  }

  async createUser(userData: IUser): Promise<IUser> {
    if (!userData.password) {
      throw new Error('Password is required');
    }
    
    const hashedPassword = await this.passwordService.hashPassword(userData.password);
    return this.userAuthService.registerUser(userData, hashedPassword);
  }

  async updateUser(userId: Schema.Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser> {
    return this.userAuthService.updateUser(userId, updateData);
  }

  async sendForgotPasswordEmail(email: string): Promise<ServiceResponse<null>> {
    return this.userAuthService.sendForgotPasswordEmail(email);
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<ServiceResponse<null>> {
    return this.passwordService.resetPassword(email, token, newPassword);
  }

  async verifyFirebaseToken(idToken: string, name: string, profileImg?: string): Promise<{
    success: boolean;
    message: string;
    user?: IUser;
    token?: string;
  }> {
    return this.firebaseAuthService.authenticateWithFirebase(idToken, name, profileImg);
  }
}