import { Request,Response } from 'express';
import { AuthenticatedRequest } from '../../models/interfaces/profile.interface';



export interface IExploreController {
  getAllEvents(req: AuthenticatedRequest, res: Response): Promise<void>;
  checkout(req: AuthenticatedRequest, res: Response): Promise<void>;
  handleStripeWebhook(req: Request, res: Response): Promise<void>;
  getBookingDetails(req: Request, res: Response): Promise<void>;
  downloadTickets(req: Request, res: Response): Promise<void>;
  downloadInvoice(req: Request, res: Response): Promise<void>
}