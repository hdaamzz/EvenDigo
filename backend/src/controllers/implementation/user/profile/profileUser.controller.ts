import { Request, Response } from 'express';
import { IUser, ServiceResponse } from '../../../../../src/models/interfaces/auth.interface';
import { FileRequest } from '../../../../../src/models/interfaces/profile.interface';
import { IUserAchievementService } from '../../../../../src/services/interfaces/IAchievement';
import { IProfileService } from '../../../../../src/services/interfaces/IProfile.service';
import StatusCode from '../../../../../src/types/statuscode';
import { uploadToCloudinary } from '../../../../../src/utils/helpers';
import { inject, injectable } from 'tsyringe';
import { IProfileUserController } from '../../../../../src/controllers/interfaces/User/Profile/IProfileUser.controller';



@injectable()
export class ProfileUserController implements IProfileUserController{
  constructor(
    @inject("ProfileService")   private profileService: IProfileService,
    @inject("UserAchievementService") private acheivementService : IUserAchievementService,
    
  ) {}

  async fetchUserById(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;

    const response: ServiceResponse<IUser> = await this.profileService.fetchUserById(userId);
    await this.acheivementService.checkUserAchievements(userId);
    
    if (response.success) {
      res.status(StatusCode.OK).json(response.data);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async updateUserDetails(req: Request, res: Response): Promise<void> {
    const { userId, name, phone, dateOfBirth, location, bio, gender } = req.body
    const data = { name, phone, dateOfBirth, location, bio, gender }

    const response: ServiceResponse<IUser> = await this.profileService.updateUserDetails(userId, data);
    if (response.success) {
      res.status(StatusCode.OK).json(response.data);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }

  }

  async sendVerificationRequest(req: Request, res: Response): Promise<void> {
    const { id } = req.body;
    const response = await this.profileService.verificationRequest(id);
    if (response.success) {
      res.status(StatusCode.OK).json(response);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }
  async verificationRequestDetails(req: Request, res: Response): Promise<void> {
    const userId = req.params.userId
    const response = await this.profileService.verificationRequestDetails(userId);
    if (response.success) {
      res.status(StatusCode.OK).json(response);
    } else {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
    }
  }

  async uploadProfileImage(req: FileRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'No file uploaded'
        });
        return;
      }
  
     
      const result = await uploadToCloudinary(req.file.path);
      
      const publicId = result.public_id;
      if (req.user?._id) {        
        await this.profileService.updateUserDetails(req.user?._id, {
          profileImg: result.secure_url,
          profileImgPublicId: publicId
        });
      }
  
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Image uploaded successfully',
        imageUrl: result.secure_url,
        publicId: publicId
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to upload image'
      });
    }
  }

}