import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import StatusCode from '../../../types/statuscode';
import { IFinanceController } from '../../../../src/controllers/interfaces/admin/IFinance.controller';
import { IFinanceService } from '../../../../src/services/interfaces/IRevenue.service';

@injectable()
export class FinanceController implements IFinanceController {
  constructor(
    @inject("FinanceService") private financeService: IFinanceService
  ) {}

  async getRevenueTransactions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      
      const response = await this.financeService.getRevenueTransactions(page, limit, search);
      
      if (response.success) {
        res.status(StatusCode.OK).json(response.data);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch revenue transactions"
      });
    }
  }

  async getRevenueStats(_req: Request, res: Response): Promise<void> {
    try {
      const response = await this.financeService.getRevenueStats();
      
      if (response.success) {
        res.status(StatusCode.OK).json(response.data);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch revenue statistics"
      });
    }
  }

  async getRevenueByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const paymentStatus = req.query.status as string | undefined;
      const paymentType = req.query.paymentType as string | undefined;
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD format."
        });
        return;
      }
      
      const response = await this.financeService.getRevenueByDateRange(
        startDate, 
        endDate, 
        paymentStatus, 
        paymentType
      );
      
      if (response.success) {
        res.status(StatusCode.OK).json(response.data);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch revenue by date range"
      });
    }
  }
}