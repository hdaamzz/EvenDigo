import { Request, Response } from 'express';

export interface IHomeController {
  getDashboardStats(req: Request, res: Response): Promise<void>;
  getRevenueChart(req: Request, res: Response): Promise<void>;
  getRecentTransactions(req: Request, res: Response): Promise<void>;
  getSubscriptionPlans(req: Request, res: Response): Promise<void>;
  getRecentActivities(req: Request, res: Response): Promise<void>;
  getUpcomingEvents(req: Request, res: Response): Promise<void>;
  getUserRegistrationStats(req: Request, res: Response): Promise<void>;
}