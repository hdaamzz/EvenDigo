import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IProfileEventsController } from '../../../../controllers/interfaces/User/Profile/IProfileEvents.controller';
import { ResponseHandler } from '../../../../utils/response-handler';
import { uploadToCloudinary } from '../../../../utils/helpers';
import { EventDocument } from '../../../../models/interfaces/event.interface';
import { IProfileEventService } from '../../../../../src/services/interfaces/user/profile/IProfileEvent.service';

@injectable()
export class ProfileEventsController implements IProfileEventsController {
  constructor(
    @inject("ProfileEventService") private profileEventService: IProfileEventService,
  ) {}

  async getUserEvents(req: Request, res: Response): Promise<void> {
    try {
      if (!req.user?._id) {
        return ResponseHandler.error(res, null, "User not authenticated", 401);
      }
      
      const userId = req.user._id.toString();
      const events = await this.profileEventService.getUserEvents(userId);
      
      ResponseHandler.success(res, events, "User events retrieved successfully");
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to fetch user events");
    }
  }

  async getEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
      
      if (!eventId) {
        return ResponseHandler.error(res, null, "Event ID is required", 400);
      }
      
      const event = await this.profileEventService.getEvent(eventId);
      
      if (!event) {
        return ResponseHandler.error(res, null, "Event not found", 404);
      }
      
      ResponseHandler.success(res, event, "Event retrieved successfully");
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to fetch event");
    }
  }

  async updateEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.body.eventId;
      
      if (!eventId) {
        return ResponseHandler.error(res, null, "Event ID is required", 400);
      }
      
      // Check if event exists
      const event = await this.profileEventService.getEvent(eventId);
      
      if (!event) {
        return ResponseHandler.error(res, null, "Event not found", 404);
      }
      
      const updateData: Partial<EventDocument> = {};
      
      // Extract relevant fields from request body
      for (const key in req.body) {
        if (key !== 'eventId') {
          updateData[key as keyof EventDocument] = req.body[key];
        }
      }
      
      // Process uploaded files if any
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
      
      // Parse tickets if they exist as a string
      if (updateData.tickets && typeof updateData.tickets === 'string') {
        updateData.tickets = JSON.parse(updateData.tickets);
      }
      
      // Update the event
      const result = await this.profileEventService.updateEvent(eventId, updateData);
      
      if (result) {
        ResponseHandler.success(res, result, "Event updated successfully");
      } else {
        ResponseHandler.error(res, null, "Failed to update event", 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to update event");
    }
  }

  async deleteEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
      
      if (!eventId) {
        return ResponseHandler.error(res, null, "Event ID is required", 400);
      }
      
      // Check if event exists
      const event = await this.profileEventService.getEvent(eventId);
      
      if (!event) {
        return ResponseHandler.error(res, null, "Event not found", 404);
      }
      
      const result = await this.profileEventService.deleteEvent(eventId);
      
      if (result) {
        ResponseHandler.success(res, null, "Event deleted successfully");
      } else {
        ResponseHandler.error(res, null, "Failed to delete event", 400);
      }
    } catch (error) {
      ResponseHandler.error(res, error, "Failed to delete event");
    }
  }
}