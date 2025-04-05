import { Response } from 'express';
import { AuthenticatedRequest } from '../../models/interfaces/profile.interface';



export interface IExploreController {
  getAllEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
  checkout(req: AuthenticatedRequest, res: Response): Promise<void>;
}