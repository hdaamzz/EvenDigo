import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../../../models/interfaces/profile.interface';



export interface IProfileBookingController {
  getUserBookings(req: AuthenticatedRequest, res: Response): Promise<void>;
  cancelTicket(req: Request, res: Response): Promise<void>;
}