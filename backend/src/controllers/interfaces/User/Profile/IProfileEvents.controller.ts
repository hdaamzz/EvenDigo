import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../models/interfaces/profile.interface';



export interface IProfileEventsController {
  getUserEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
  getEvent(req: Request, res: Response): Promise<void>
  updateEvent(req: Request, res: Response): Promise<void>
  deleteEvent(req: Request, res: Response): Promise<void>
}