import { Request, Response } from 'express';

export interface IFinanceController {
  getRevenueTransactions(req: Request, res: Response): Promise<void>;
  getRevenueStats(req: Request, res: Response): Promise<void>;
  getRefundTransactions(req: Request, res: Response): Promise<void>;
  getRefundsByDateRange(req: Request, res: Response): Promise<void>;
  getTransactionsByUser(req: Request, res: Response): Promise<void>;
}