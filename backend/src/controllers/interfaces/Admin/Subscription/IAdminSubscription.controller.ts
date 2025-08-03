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


export interface ISubscriptionPlanController {
  getAll(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>
}

export interface SubscriptionFilters {
  activeOnly?: boolean;
  planType?: string;
  searchTerm?: string;
  startDate?: Date;
  endDate?: Date;
}