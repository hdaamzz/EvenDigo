import { inject, injectable } from 'tsyringe';
import { Schema } from 'mongoose';
import { MongoError } from 'mongodb';
import { IUserAuthService } from '../../../../../src/services/interfaces/user/auth/IUserAuthService';
import { IUserRepository } from '../../../../../src/repositories/interfaces/IUser.repository';
import { IPasswordService } from '../../../../../src/services/interfaces/user/auth/IPasswordService';
import { ITokenService } from '../../../../../src/services/interfaces/user/auth/ITokenService';
import { IEmailService } from '../../../../../src/services/interfaces/user/auth/IEmailService';
import { IOTPService } from '../../../../../src/services/interfaces/user/auth/IOTPService';
import { IAuthResponse, ILogin, IUser, ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { ConflictException, InternalServerErrorException, NotFoundException } from '../../../../../src/error/error-handlers';

@injectable()
export class UserAuthService implements IUserAuthService {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("PasswordService") private passwordService: IPasswordService,
    @inject("TokenService") private tokenService: ITokenService,
    @inject("EmailService") private emailService: IEmailService,
    @inject("OTPService") private otpService: IOTPService
  ) {}

  async registerUser(userData: IUser, hashedPassword: string): Promise<IUser> {
    try {
      const user = await this.userRepository.createUser({
        ...userData,
        password: hashedPassword,
        role: "user",
        status: 'active',
        verified: false
      });

      return user;
    } catch (error) {
      if (error instanceof MongoError && error.code === 11000) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async login(credentials: ILogin): Promise<IAuthResponse> {
    const user = await this.userRepository.findUserByEmail(credentials.email);

    if (!user) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    if (!user.password) {
      throw new Error('Password is undefined');
    }

    const isPasswordMatch = await this.passwordService.verifyPassword(credentials.password, user.password);
    if (!isPasswordMatch) {
      return {
        success: false,
        message: "Invalid email or password"
      };
    }

    if (user.status == 'blocked') {
      return {
        success: false,
        message: "EvenDigo blocked you!"
      };
    }

    if (!user._id) {
      throw new Error('User ID is undefined');
    }

    await this.userRepository.updateUserLastLogin(user._id);

    const token = this.tokenService.generateToken(user);

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

  async findUserById(userId: Schema.Types.ObjectId | string): Promise<IUser | null> {
    return this.userRepository.findUserById(userId);
  }

  async updateUser(userId: Schema.Types.ObjectId | string, updateData: Partial<IUser>): Promise<IUser> {
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

  async sendForgotPasswordEmail(email: string): Promise<ServiceResponse<null>> {
    try {
      const user = await this.userRepository.findUserByEmail(email);
      if (!user) {
        return {
          success: false,
          message: "No account found with this email"
        };
      }
  
      const resetToken = this.otpService.generateOTP();
      
      await this.passwordService.storeResetToken(email, resetToken);
      
      await this.emailService.sendPasswordResetEmail(email, user.name, resetToken);
      
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
}
