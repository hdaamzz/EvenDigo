import { Request, Response } from 'express';
import { IUser, ServiceResponse } from '../../../models/interfaces/auth.interface';
import { FileRequest } from '../../../models/interfaces/profile.interface';
import { uploadToCloudinary } from '../../../utils/helpers';
import { inject, injectable } from 'tsyringe';
import { IProfileService } from '../../../../src/services/interfaces/IProfile.service';
import StatusCode from '../../../../src/types/statuscode';


@injectable()
export class ProfileController {
  constructor(
    @inject("ProfileService")   private profileService: IProfileService,
  ) {}

  async fetchUserById(req: Request, res: Response): Promise<void> {
    const { userId } = req.body;

    const response: ServiceResponse<IUser> = await this.profileService.fetchUserById(userId);
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
    const id = req.params.id
    const response = await this.profileService.verificationRequestDetails(id);
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

  async getUserEvents(req: Request, res: Response): Promise<void> {
    const userId = req.user._id.toString();
    try {
      const bookings = await this.profileService.getUserEvents(userId);
      res.status(StatusCode.OK).json({ success: true, data: bookings });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: (error as Error).message });
    }
  }


  async getEvent(req: Request, res: Response): Promise<void> {
    const eventId = req.params.eventId.toString();
    try {
      const event= await this.profileService.getEvent(eventId)
      res.status(StatusCode.OK).json({ success: true, data: event });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: (error as Error).message });
    }
  }

  async getUserBookings(req: Request, res: Response): Promise<void> {
    const userId = req.user._id.toString();
    try {
      const bookings = await this.profileService.getUserBookings(userId);
      res.status(StatusCode.OK).json({ success: true, data: bookings });
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, error: (error as Error).message });
    }
  }

  async getUserWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id.toString();
      const response = await this.profileService.getWalletDetails(userId);
      console.log(response);
      
      if (response.success) {
        res.status(StatusCode.OK).json(response);
      } else {
        res.status(StatusCode.BAD_REQUEST).json(response);
      }
    } catch (error) {
      console.error('Wallet fetch error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
        error: (error as Error).message
      });
    }
  }

  async cancelTicket(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user._id.toString();
      const { bookingId, ticketUniqueId } = req.body;
  
      if (!bookingId || !ticketUniqueId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Booking ID and ticket ID are required'
        });
        return;
      }
  
      const result = await this.profileService.cancelTicket(userId, bookingId, ticketUniqueId);
      
      if (result.success) {
        res.status(StatusCode.OK).json(result);
      } else {
        res.status(StatusCode.BAD_REQUEST).json(result);
      }
    } catch (error) {
      console.error('Ticket cancellation error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to cancel ticket',
        error: (error as Error).message
      });
    }
  }
 

}