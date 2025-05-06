import { Request, Response } from 'express';
import { FileRequest } from '../../../../models/interfaces/profile.interface';
import { IUserAchievementService } from '../../../../services/interfaces/IAchievement';
import { inject, injectable } from 'tsyringe';
import { IProfileUserController } from '../../../../controllers/interfaces/User/Profile/IProfileUser.controller';
import { ResponseHandler } from '../../../../utils/response-handler';
import { uploadToCloudinary } from '../../../../utils/helpers';
import { IProfileUserService } from '../../../../../src/services/interfaces/user/profile/IProfileUser.service';

@injectable()
export class ProfileUserController implements IProfileUserController {
  constructor(
    @inject("ProfileUserService") private profileUserService: IProfileUserService,
    @inject("UserAchievementService") private achievementService: IUserAchievementService,
  ) {}

  async fetchUserById(req: Request, res: Response): Promise<void> {
    try {
      const { userId } = req.body;

      if (!userId) {
        return ResponseHandler.error(res, null, "User ID is required", 400);
      }

      const response = await this.profileUserService.fetchUserById(userId);
      await this.achievementService.checkUserAchievements(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 404);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to fetch user");
    }
  }

  async updateUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const { userId, name, phone, dateOfBirth, location, bio, gender } = req.body;
      
      if (!userId) {
        return ResponseHandler.error(res, null, "User ID is required", 400);
      }
      
      const data = { name, phone, dateOfBirth, location, bio, gender };
      const response = await this.profileUserService.updateUserDetails(userId, data);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to update user details");
    }
  }

  async sendVerificationRequest(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.body;
      
      if (!id) {
        return ResponseHandler.error(res, null, "User ID is required", 400);
      }
      
      const response = await this.profileUserService.verificationRequest(id);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to send verification request");
    }
  }
  
  async verificationRequestDetails(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      
      if (!userId) {
        return ResponseHandler.error(res, null, "User ID is required", 400);
      }
      
      const response = await this.profileUserService.verificationRequestDetails(userId);
      
      if (response.success) {
        ResponseHandler.success(res, response.data, response.message);
      } else {
        ResponseHandler.error(res, null, response.message, 404);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to get verification request details");
    }
  }

  async uploadProfileImage(req: FileRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        return ResponseHandler.error(res, null, "No file uploaded", 400);
      }
      
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }
  
      const result = await uploadToCloudinary(req.file.path);
      
      await this.profileUserService.updateUserDetails(req.user._id, {
        profileImg: result.secure_url,
        profileImgPublicId: result.public_id
      });
  
      ResponseHandler.success(res, {
        imageUrl: result.secure_url,
        publicId: result.public_id
      }, "Image uploaded successfully");
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to upload profile image");
    }
  }
}