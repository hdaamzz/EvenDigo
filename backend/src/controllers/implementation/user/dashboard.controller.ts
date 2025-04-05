import { Request, Response } from 'express';
import { uploadToCloudinary } from '../../../utils/helpers';
import { inject, injectable } from 'tsyringe';
import { IDashboardController } from '../../../../src/controllers/interfaces/IDashboard.controller';
import { IDashboardService } from '../../../../src/services/interfaces/IDashboard.service';

@injectable()
export class DashboardController implements IDashboardController{
  constructor(
    @inject("DashboardService") private dashboardService: IDashboardService,
  ) {}

  createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id; 
      console.log('Request body:', req.body);
      console.log('Request files:', req.files);
      // Handle file uploads if present
      let mainBannerUrl = null;
      let promotionalImageUrl = null;
      
      if (req.files) {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] };
        
        if (files.mainBanner && files.mainBanner[0]) {
          const mainBannerResult = await uploadToCloudinary(files.mainBanner[0].path);
          mainBannerUrl = mainBannerResult.secure_url;
        }
        
        if (files.promotionalImage && files.promotionalImage[0]) {
          const promoImageResult = await uploadToCloudinary(files.promotionalImage[0].path);
          promotionalImageUrl = promoImageResult.secure_url;
        }
      }

      
      
      // Process form data
      const eventData = {
        ...req.body,
        user_id: userId,
        mainBanner: mainBannerUrl,
        promotionalImage: promotionalImageUrl,
        // Convert string 'Yes'/'No' to boolean
        ageRestriction: req.body.ageRestriction === 'Yes',
        // Parse tickets from JSON string if needed
        tickets: typeof req.body.tickets === 'string' ? JSON.parse(req.body.tickets) : req.body.tickets,
        // Combine date and time fields
        startDate: new Date(req.body.startDate),
        endingDate: new Date(req.body.endingDate)
      };


      const event = await this.dashboardService.createEvent(eventData);
      res.status(201).json({ success: true, data: event });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(500).json({ success: false, error: 'Failed to create event' });
    }
  };

  getUserEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user.id;
      const events = await this.dashboardService.getEventsByUserId(userId);
      res.status(200).json({ success: true, data: events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch events' });
    }
  };

  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = req.params.id;
      const userId = req.user._id;
      console.log(eventId,'-----',userId);
      
      const event = await this.dashboardService.getEventById(eventId);
      
      // Check if event belongs to user
      if (!event) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      console.log(event.user_id.toString() , userId.toString());
      
      // if (event.user_id.toString() !== userId.toString()) {
      //   res.status(403).json({ success: false, error: 'Not authorized to access this event' });
      //   return;
      // }
      
      res.status(200).json({ success: true, data: event });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch event' });
    }
  };

  updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;
      
      // First check if event exists and belongs to user
      const existingEvent = await this.dashboardService.getEventById(eventId);
      
      if (!existingEvent) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      
      if (existingEvent.user_id.toString() !== userId) {
        res.status(403).json({ success: false, error: 'Not authorized to update this event' });
        return;
      }
      
      // Handle file uploads if present
      let updateData = { ...req.body };
      
      if (req.files) {
        const files = req.files as any;
        
        if (files.mainBanner) {
          const mainBannerResult = await uploadToCloudinary(files.mainBanner.tempFilePath);
          updateData.mainBanner = mainBannerResult.secure_url;
        }
        
        if (files.promotionalImage) {
          const promoImageResult = await uploadToCloudinary(files.promotionalImage.tempFilePath);
          updateData.promotionalImage = promoImageResult.secure_url;
        }
      }
      
      // Process other form data
      if (updateData.ageRestriction) {
        updateData.ageRestriction = updateData.ageRestriction === 'Yes';
      }
      
      if (updateData.tickets && typeof updateData.tickets === 'string') {
        updateData.tickets = JSON.parse(updateData.tickets);
      }
      
      if (updateData.startDate) {
        updateData.startDate = new Date(updateData.startDate);
      }
      
      if (updateData.endingDate) {
        updateData.endingDate = new Date(updateData.endingDate);
      }
      
      const updatedEvent = await this.dashboardService.updateEvent(eventId, updateData);
      res.status(200).json({ success: true, data: updatedEvent });
    } catch (error) {
      console.error('Update event error:', error);
      res.status(500).json({ success: false, error: 'Failed to update event' });
    }
  };

  deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;
      
      // First check if event exists and belongs to user
      const existingEvent = await this.dashboardService.getEventById(eventId);
      
      if (!existingEvent) {
        res.status(404).json({ success: false, error: 'Event not found' });
        return;
      }
      
      if (existingEvent.user_id.toString() !== userId) {
        res.status(403).json({ success: false, error: 'Not authorized to delete this event' });
        return;
      }
      
      await this.dashboardService.deleteEvent(eventId);
      res.status(200).json({ success: true, message: 'Event deleted successfully' });
    } catch (error) {
      console.error('Delete event error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete event' });
    }
  };
}