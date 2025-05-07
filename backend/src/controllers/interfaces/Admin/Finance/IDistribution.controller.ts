import { Request, Response } from 'express';

export interface IRevenueDistributionController {
  triggerDistributionManually(req: Request, res: Response): Promise<void>;
  getEventDistribution(req: Request, res: Response): Promise<void>;
  getAllCompletedDistributions(req: Request, res: Response): Promise<void>;
  distributeSpecificEvent(req: Request, res: Response): Promise<void>;
  getDistributedRevenue(req: Request, res: Response): Promise<void>;
  getRecentDistributedRevenue(req: Request, res: Response): Promise<void>;
  getRevenueByEvent(req: Request, res: Response): Promise<void>;
  getEventsByIds(req: Request, res: Response): Promise<void>;
  getRevenueStats(req: Request, res: Response): Promise<void>;
  getRevenueByDateRange(req: Request, res: Response): Promise<void> 
}