import { Request, Response } from 'express';
import { IFinanceController } from '../../../../../src/controllers/interfaces/Admin/Finance/IFinance.controller';
import { IFinanceService } from '../../../../../src/services/interfaces/IRevenue.service';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, InternalServerErrorException } from '../../../../../src/error/error-handlers';

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
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch revenue transactions');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch revenue transactions');
    }
  }

  async getRevenueStats(_req: Request, res: Response): Promise<void> {
    try {
      const response = await this.financeService.getRevenueStats();

      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch revenue statistics');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch revenue statistics');
    }
  }

  async getTransactionByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
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
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch revenue by date range');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch revenue by date range', 
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRefundTransactions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      const response = await this.financeService.getRefundTransactions(page, limit, search);
      
      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch refund transactions');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch refund transactions');
    }
  }
  
  async getRefundsByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
  
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
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
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch refunds by date range');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch refunds by date range', 
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }
}