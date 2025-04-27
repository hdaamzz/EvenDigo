import { Request, Response } from 'express';

export interface IFinanceController {
  getRevenueTransactions(req: Request, res: Response): Promise<void>;
  getRevenueStats(req: Request, res: Response): Promise<void>;
  getRevenueByDateRange(req: Request, res: Response): Promise<void>;
}