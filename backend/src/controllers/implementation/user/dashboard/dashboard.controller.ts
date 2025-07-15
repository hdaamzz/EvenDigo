import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IDashboardController } from '../../../interfaces/User/Dashboard/IDashboard.controller';
import { IUserAchievementService } from '../../../../services/interfaces/IAchievement';
import StatusCode from '../../../../types/statuscode';
import { EventMapper } from '../../../../services/implementation/user/dashboard/eventMapper.service';
import { IEventService } from '../../../../services/interfaces/user/dashboard/IEvent.service';
import { IFileService } from '../../../../services/interfaces/user/dashboard/IFile.service';
import { ForbiddenException, NotFoundException } from '../../../../error/error-handlers';
@injectable()
export class DashboardController implements IDashboardController {
  constructor(
    @inject("EventService") private eventService: IEventService,
    @inject("FileService") private fileService: IFileService,
    @inject("UserAchievementService") private achievementService: IUserAchievementService,
    @inject("EventMapper") private eventMapper: EventMapper
  ) {}

  createEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const fileData = await this.fileService.processEventFiles(files);
      
      const eventData = this.eventMapper.mapCreateRequestToEventData(req.body, userId, fileData);
      
      const event = await this.eventService.createEvent(eventData);
      await this.achievementService.checkUserAchievements(userId);
      
      res.status(StatusCode.CREATED).json({ success: true, data: event });
    } catch (error) {
      console.error('Create event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to create event' 
      });
    }
  };

  getUserEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const events = await this.eventService.getEventsByUserId(userId);
      res.status(StatusCode.OK).json({ success: true, data: events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to fetch events' 
      });
    }
  };

  getUserOrganizedEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const events = await this.eventService.getOrganizedEventsByUserId(userId, page, limit);
      res.status(StatusCode.OK).json({ success: true, data: events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to fetch events' 
      });
    }
  };

  getUserParticipatedEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const events = await this.eventService.getParticipatedEventsByUserId(userId, page, limit);
      res.status(StatusCode.OK).json({ success: true, data: events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to fetch events' 
      });
    }
  };

  getUserOngoingEvents = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const events = await this.eventService.getOngoingEventsByUserId(userId, page, limit);
      res.status(StatusCode.OK).json({ success: true, data: events });
    } catch (error) {
      console.error('Get user events error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to fetch events' 
      });
    }
  };
  getEventById = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = req.params.eventId;
      const event = await this.eventService.getEventById(eventId);
      
      if (!event) {
        res.status(StatusCode.NOT_FOUND).json({ 
          success: false, 
          error: 'Event not found' 
        });
        return;
      }
      
      res.status(StatusCode.OK).json({ success: true, data: event });
    } catch (error) {
      console.error('Get event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to fetch event' 
      });
    }
  };

  updateEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;
      
      await this.eventService.verifyEventOwnership(eventId, userId);
      
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      const fileData = await this.fileService.processEventFiles(files);
      
      const updateData = this.eventMapper.mapUpdateRequestToEventData(req.body, fileData);
      
      const updatedEvent = await this.eventService.updateEvent(eventId, updateData);
      res.status(StatusCode.OK).json({ success: true, data: updatedEvent });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, error: error.message });
        return;
      }
      
      if (error instanceof ForbiddenException) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, error: error.message });
        return;
      }
      
      console.error('Update event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to update event' 
      });
    }
  };

  deleteEvent = async (req: Request, res: Response): Promise<void> => {
    try {
      const eventId = req.params.id;
      const userId = req.user.id;
      
      await this.eventService.verifyEventOwnership(eventId, userId);
      
      await this.eventService.deleteEvent(eventId);
      res.status(StatusCode.OK).json({ 
        success: true, 
        message: 'Event deleted successfully' 
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(StatusCode.NOT_FOUND).json({ success: false, error: error.message });
        return;
      }
      
      if (error instanceof ForbiddenException) {
        res.status(StatusCode.FORBIDDEN).json({ success: false, error: error.message });
        return;
      }
      
      console.error('Delete event error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ 
        success: false, 
        error: 'Failed to delete event' 
      });
    }
  };
}