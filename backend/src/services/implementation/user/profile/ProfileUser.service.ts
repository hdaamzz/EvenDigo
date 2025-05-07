import { Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { Readable } from 'stream';
import { IProfileUserService } from '../../../../../src/services/interfaces/user/profile/IProfileUser.service';
import { IUserRepository } from '../../../../../src/repositories/interfaces/IUser.repository';
import { IVerificationRepository } from '../../../../../src/repositories/interfaces/IVerification.repository';
import { IUser, ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { BadRequestException, NotFoundException } from '../../../../../src/error/error-handlers';
import { CloudinaryUploadResult } from '../../../../../src/models/interfaces/profile.interface';
import cloudinary from '../../../../../src/configs/cloudinary';
import { IUserAchievementRepository } from '../../../../../src/repositories/interfaces/IBadge.repository';
import { hashPassword, reHash } from '../../../../../src/utils/helpers';


@injectable()
export class ProfileUserService implements IProfileUserService {
  constructor(
    @inject("UserRepository") private userRepository: IUserRepository,
    @inject("VerificationRepository") private verificationRepository: IVerificationRepository,
    @inject("UserAchievementRepository") private badgeRepository : IUserAchievementRepository,
  ) {}

  async fetchUserById(userId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.findUserById(userId);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return {
        success: true,
        message: "User fetched successfully",
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: "Failed to fetch user",
      };
    }
  }

  async updateUserDetails(userId: Schema.Types.ObjectId | string, data: Partial<IUser>): Promise<ServiceResponse<IUser>> {
    try {
      const user = await this.userRepository.updateUser(userId, data);

      if (!user) {
        throw new NotFoundException("User not found");
      }

      return {
        success: true,
        message: "User Updated successfully",
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: "Failed to update user",
      };
    }
  }

  async verificationRequest(userId: Schema.Types.ObjectId | string): Promise<any> {
    try {
      const data = {
        user_id: userId,
      };

      const record = await this.verificationRepository.createVerificationRequest(data);

      if (!record) {
        throw new BadRequestException("Request failed");
      }

      return {
        success: true,
        message: "Request successfully sent",
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Request failed",
      };
    }
  }

  async verificationRequestDetails(userId: Schema.Types.ObjectId | string): Promise<any> {
    try {
      const record = await this.verificationRepository.getVerificationRequest(userId);
      
      if (!record) {
        throw new NotFoundException("Verification request not found");
      }
      
      return {
        success: true,
        message: "Request details retrieved successfully",
        data: record
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to get verification request",
      };
    }
  }

  async uploadImage(buffer: Buffer, folder = 'profiles'): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result as CloudinaryUploadResult);
        }
      );
      
      const readableStream = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        }
      });
      
      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<any> {
    return cloudinary.uploader.destroy(publicId);
  }
  
  async getUserBadges(userId: Schema.Types.ObjectId | string): Promise<any> {
    try {
      const badges = await this.badgeRepository.getUserAchievements(userId);

      if (!badges) {
        throw new NotFoundException("Badges not found");
      }

      return {
        success: true,
        message: "Badges fetched successfully",
        data: badges,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          success: false,
          message: error.message,
        };
      }
      return {
        success: false,
        message: "Failed to fetch user",
      };
    }
  }

  async changePassword(
    userId: Schema.Types.ObjectId | string, 
    currentPassword: string, 
    newPassword: string
  ): Promise<ServiceResponse<null>> {
    try {
      const user = await this.userRepository.findUserById(userId);
      
      if (!user) {
        throw new NotFoundException("User not found");
      }
      
      
      if (!user.password) {
        throw new BadRequestException("User password is not set");
      }

      const isPasswordValid = await reHash(currentPassword, user.password);
      
      if (!isPasswordValid) {
        throw new BadRequestException("Current password is incorrect");
      }
      
      const hashedPassword = await hashPassword(newPassword);
      
      await this.userRepository.updateUser(userId, { password: hashedPassword });
      
      return {
        success: true,
        message: "Password changed successfully",
        data: null,
      };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        return {
          success: false,
          message: error.message,
          data: null,
        };
      }
      
      return {
        success: false,
        message: "Failed to change password",
        data: null,
      };
    }
  }
}
