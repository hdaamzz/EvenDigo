import { Request, Response } from 'express';

export interface IAdminSubscriptionController {
  getAllSubscriptions(req: Request, res: Response): Promise<void>;
  getSubscriptionStats(req: Request, res: Response): Promise<void>;
  getSubscriptionById(req: Request, res: Response): Promise<void>;
  getUserSubscriptions(req: Request, res: Response): Promise<void>;
  updateSubscriptionStatus(req: Request, res: Response): Promise<void>;
  deleteSubscription(req: Request, res: Response): Promise<void>;
  getFilterOptions(req: Request, res: Response): Promise<void>;
}