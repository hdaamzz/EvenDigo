import { generateOTP, hashPassword, reHash, sendEmail } from '../../../utils/helpers';
import { IAuthResponse, ILogin, IUser, OTPVerificationData, ServiceResponse } from '../../../models/interfaces/auth.interface';
import * as jwt from 'jsonwebtoken';
import { MongoError } from 'mongodb';
import { ConflictException, InternalServerErrorException, NotFoundException } from '../../../error/error-handlers';
import { Schema } from 'mongoose';
import { IAuthService } from '../../../../src/services/interfaces/IAuth.service';
import { inject, injectable } from 'tsyringe';
import { IAuthRepository } from '../../../../src/repositories/interfaces/IAuth.repository';
import { IUserRepository } from '../../../../src/repositories/interfaces/IUser.repository';

@injectable()
export class AuthService implements IAuthService {
  constructor(
    @inject("AuthRepository") private authRepository: IAuthRepository,
    @inject("UserRepository") private userRepository: IUserRepository
  ) {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
  }

  async sendOTP(userData: IUser): Promise<{ success: boolean; message: string }> {
    try {
      const otp = generateOTP();
      const existingUser = await this.userRepository.findUserByEmail(userData.email);
      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        };
      }

      await this.authRepository.storeOTPData(userData.email, otp, userData);

      await sendEmail({
        to: userData.email,
        subject: 'Registration OTP',
        text: `Hi ${userData.name} ,  Your OTP for registration is: ${otp}`
      });


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
        if (!otpData.userData.password) {
          throw new Error('Otp password is undefined'); 
        }

        const hashedPassword = await hashPassword(otpData.userData.password);

        try {
            const user = await this.userRepository.createUser({
                ...otpData.userData,
                password: hashedPassword,
                role: "user",
                status:'active',
                verified:false
            });

            await this.authRepository.deleteOTPData(email);

            return {
                success: true,
                message: 'Registration successful',
                data: {
                    userId: user._id,
                    email: user.email,
                    name: user.name
                }
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create user';
            return {
                success: false,
                message: errorMessage
            };
        }
    } catch (error) {
        console.error('Verify OTP error:', error);
        return {
            success: false,
            message: 'Failed to verify OTP'
        };
    }
}



  async login(credentials: ILogin): Promise<IAuthResponse> {
    const user = await this.userRepository.findUserByEmail(credentials.email);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password"
      }
    }
    if (!user.password) {
      throw new Error('Password is undefined'); 
    }

    const isPasswordMatch = await reHash(credentials.password, user.password)
    if (!isPasswordMatch) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }
    if (user.status=='blocked') {
      return {
        success: false,
        message: "EvenDigo blocked you!"
      };
    }
    if (!user._id) {
      throw new Error('User ID is undefined'); 
    }
    await this.userRepository.updateUserLastLogin(user._id);

    const token = jwt.sign({
      userId: user._id,
      email: user.email,
      name: user.name
    },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name
    };
    return {
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    };
  }

  async findUserByEmail(email: string): Promise<IUser | null> {
    return this.userRepository.findUserByEmail(email);
  }

  async createUser(userData: IUser): Promise<IUser> {
    try {
      return await this.userRepository.createUser(userData);
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async updateUser(userId: Schema.Types.ObjectId | string , updateData: Partial<IUser>): Promise<IUser> {
    try {
      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      const updatedUser = await this.userRepository.updateUser(userId, updateData);
      if (!updatedUser) {
        throw new InternalServerErrorException('Failed to update user'); 
      }
      return updatedUser;
    } catch (error) {
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  // async validateSession(token: string): Promise<IUser | null> {
  //   try {
  //     const payload = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string };
  //     return await this.userRepository.findUserById(payload.sub);
  //   } catch {
  //     return null;
  //   }
  // }

  async sendForgotPasswordEmail(email: string): Promise<ServiceResponse<null>> {
    try {
      // Check if user exists
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: "No account found with this email"
        };
      }
  
      // Generate a reset token
      const resetToken = generateOTP(); // Or use a specific function for reset tokens
      
      // Store the token in Redis
      await this.authRepository.storeResetToken(email, resetToken);
      
      // Send email with reset instructions
      await sendEmail({
        to: email,
        subject: 'Password Reset Request',
        text: `Hi ${user.name}, Your password reset link is: http://localhost:4200/reset-password?email=${user.email}&token=${resetToken}. This link will expire in 10 minutes.`
      });
      
      return {
        success: true,
        message: "Password reset instructions sent to your email"
      };
    } catch (error) {
      console.error("Forgot password error:", error);
      return {
        success: false,
        message: "Failed to process password reset request"
      };
    }
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<ServiceResponse<null>> {
    try {
      // Verify token
      const storedToken = await this.authRepository.getResetToken(email);
      if (!storedToken || storedToken !== token) {
        return {
          success: false,
          message: "Invalid or expired reset token"
        };
      }
      
      // Get user
      const user = await this.userRepository.findUserByEmail(email);
      if (!user || !user._id) {
        return {
          success: false,
          message: "User not found"
        };
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user password
      await this.userRepository.updateUser(user._id.toString(), { password: hashedPassword });
      
      // Delete the reset token
      await this.authRepository.deleteResetToken(email);
      
      return {
        success: true,
        message: "Password reset successful"
      };
    } catch (error) {
      console.error("Reset password error:", error);
      return {
        success: false,
        message: "Failed to reset password"
      };
    }
  }
}