import { Request, Response } from 'express';

export interface IRevenueDistributionController {
  triggerDistributionManually(req: Request, res: Response): Promise<void>;
  getEventDistribution(req: Request, res: Response): Promise<void>;
  getAllCompletedDistributions(req: Request, res: Response): Promise<void>;
  distributeSpecificEvent(req: Request, res: Response): Promise<void>;
}