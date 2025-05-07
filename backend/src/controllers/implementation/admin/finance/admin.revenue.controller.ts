import { Request, Response } from 'express';
import { IFinanceController } from '../../../../../src/controllers/interfaces/Admin/Finance/IFinance.controller';
import { IFinanceService } from '../../../../../src/services/interfaces/IRevenue.service';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';


@injectable()
export class FinanceController implements IFinanceController {
  constructor(
    @inject("FinanceService") private financeService: IFinanceService
  ) { }

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
      console.log(response);

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

  async getTransactionByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD format."
        });
        return;
      }

      endDate.setHours(23, 59, 59, 999);

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      const response = await this.financeService.getTransactionsByDateRange(
        startDate,
        endDate,
        page,
        limit,
        search
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


  async getRefundTransactions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      const response = await this.financeService.getRefundTransactions(page, limit, search);
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
        message: "Failed to fetch refund transactions"
      });
    }
  }

  
  
  async getRefundsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Invalid date format. Use YYYY-MM-DD format."
        });
        return;
      }
  
      endDate.setHours(23, 59, 59, 999);
  
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
  
      const response = await this.financeService.getRefundsByDateRange(
        startDate,
        endDate,
        page,
        limit,
        search
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
        message: "Failed to fetch refunds by date range"
      });
    }
  }

  async getTransactionsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      
      if (!userId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "User ID is required"
        });
        return;
      }
      
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const response = await this.financeService.getTransactionsByUser(
        userId,
        page,
        limit
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
        message: "Failed to fetch user transactions"
      });
    }
  }
}