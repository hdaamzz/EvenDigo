import { Request, Response } from 'express';
import { IFinanceController } from '../../../../controllers/interfaces/Admin/Finance/IFinance.controller';
import { IFinanceService } from '../../../../services/interfaces/IRevenue.service';
import StatusCode from '../../../../types/statuscode';
import { inject, injectable } from 'tsyringe';
import { 
  RevenueStatsDto, 
  PaginatedRevenueTransactionsDto, 
  PaginatedRefundTransactionsDto 
} from '../../../../dto/admin/finance/Finance.dto';
import { ServiceFinanceMapper } from '../../../../dto/admin/finance/service.finance.mapper';

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

      // Map to DTO
      const dto = ServiceFinanceMapper.toGetTransactionsDTO(page, limit, search);
      
      const response = await this.financeService.getRevenueTransactions(dto);

      if (response.success) {
        const responseDto = new PaginatedRevenueTransactionsDto(response.data);
        res.status(StatusCode.OK).json(responseDto);
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
        const dto = new RevenueStatsDto(response.data);
        res.status(StatusCode.OK).json(dto);
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      // Map to DTO (this will handle validation)
      const dto = ServiceFinanceMapper.toGetTransactionsByDateRangeDTO(
        startDate, endDate, page, limit, search
      );

      const response = await this.financeService.getTransactionsByDateRange(dto);

      if (response.success) {
        const responseDto = new PaginatedRevenueTransactionsDto(response.data);
        res.status(StatusCode.OK).json(responseDto);
      } else {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || "Failed to fetch revenue by date range"
      });
    }
  }

  async getRefundTransactions(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      // Map to DTO
      const dto = ServiceFinanceMapper.toGetTransactionsDTO(page, limit, search);
      
      const response = await this.financeService.getRefundTransactions(dto);
      
      if (response.success) {
        const responseDto = new PaginatedRefundTransactionsDto(response.data);
        res.status(StatusCode.OK).json(responseDto);
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
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';

      // Map to DTO
      const dto = ServiceFinanceMapper.toGetRefundsByDateRangeDTO(
        startDate, endDate, page, limit, search
      );

      const response = await this.financeService.getRefundsByDateRange(dto);

      if (response.success) {
        const responseDto = new PaginatedRefundTransactionsDto(response.data);
        res.status(StatusCode.OK).json(responseDto);
      } else {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || "Failed to fetch refunds by date range"
      });
    }
  }

  async getTransactionsByUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      // Map to DTO (this will handle validation)
      const dto = ServiceFinanceMapper.toGetTransactionsByUserDTO(userId, page, limit);
      
      const response = await this.financeService.getTransactionsByUser(dto);

      if (response.success) {
        const responseDto = new PaginatedRevenueTransactionsDto(response.data);
        res.status(StatusCode.OK).json(responseDto);
      } else {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: (error as Error).message || "Failed to fetch user transactions"
      });
    }
  }
}
