import { Request, Response } from 'express';
import { IUser, ServiceResponse } from '../../../models/interfaces/auth.interface';
import { FileRequest } from '../../../models/interfaces/profile.interface';
import { uploadToCloudinary } from '../../../utils/helpers';
import { inject, injectable } from 'tsyringe';
import { IProfileService } from '../../../../src/services/interfaces/IProfile.service';
import StatusCode from '../../../../src/types/statuscode';
import { EventDocument } from 'src/models/interfaces/event.interface';


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
  

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.body.eventId;
      
      if (!eventId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }
  
      const event = await this.profileService.getEvent(eventId);
      
      if (!event) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }
      
      const updateData:Partial<EventDocument> = {};
      
      for (const key in req.body) {
        if (key !== 'eventId') {
          updateData[key as keyof EventDocument] = req.body[key];
        }
      }
      console.log(updateData)
      
      if (req.files) {
        const files = req.files as Record<string, Express.Multer.File[]>;
        
        if (files.mainBanner && files.mainBanner[0]) {
          const mainBannerResult = await uploadToCloudinary(files.mainBanner[0].path);
          updateData.mainBanner = mainBannerResult.secure_url;
        }
        
        if (files.promotionalImage && files.promotionalImage[0]) {
          const promoResult = await uploadToCloudinary(files.promotionalImage[0].path);
          updateData.promotionalImage = promoResult.secure_url;
        }
      }
  
      if (updateData.tickets && typeof updateData.tickets === 'string') {
        updateData.tickets = JSON.parse(updateData.tickets);
      }
  
      const result = await this.profileService.updateEvent(eventId, updateData);
      
      if (result) {
        res.status(StatusCode.OK).json({
          success: true,
          message: 'Event updated successfully',
          data: result
        });
      } else {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Failed to update event'
        });
      }
    } catch (error) {
      console.error('Event update error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to update event',
        error: (error as Error).message
      });
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
  
      if (!eventId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Event ID is required'
        });
        return;
      }
  
      const event = await this.profileService.getEvent(eventId);
      
      if (!event) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Event not found'
        });
        return;
      }

      const result = await this.profileService.deleteEvent(eventId);
      
      if (result) {
        res.status(StatusCode.OK).json({
          success: true,
          message: 'Event deleted successfully'
        });
      } else {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: 'Failed to delete event'
        });
      }
    } catch (error) {
      console.error('Event deletion error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to delete event',
        error: (error as Error).message
      });
    }
  }

}