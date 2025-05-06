import { Response } from 'express';
import { AuthenticatedRequest } from '../../../../models/interfaces/profile.interface';


export interface IDashboardController {
  createEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
  getUserEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
  getEventById(req: AuthenticatedRequest, res: Response): Promise<void>;
  updateEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
  deleteEvent(req: AuthenticatedRequest, res: Response): Promise<void>;
}