import { Request, Response } from 'express';
import { EventDocument } from '../../../../../src/models/interfaces/event.interface';
import { IProfileService } from '../../../../../src/services/interfaces/IProfile.service';
import StatusCode from '../../../../../src/types/statuscode';
import { uploadToCloudinary } from '../../../../../src/utils/helpers';

import { inject, injectable } from 'tsyringe';
import { IProfileEventsController } from '../../../../../src/controllers/interfaces/User/Profile/IProfileEvents.controller';



@injectable()
export class ProfileEventsController implements IProfileEventsController{
  constructor(
    @inject("ProfileService")   private profileService: IProfileService,
    
  ) {}

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