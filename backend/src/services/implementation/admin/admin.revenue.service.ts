import { inject, injectable } from 'tsyringe';
import { ServiceResponse } from '../../../models/interfaces/auth.interface';
import { IFinanceService, RevenueStats, RevenueTransactions } from '../../../services/interfaces/IRevenue.service';
import { IFinanceRepository } from '../../../repositories/interfaces/IFinance.repository';
import { 
  GetTransactionsDTO, 
  GetTransactionsByDateRangeDTO, 
  GetTransactionsByUserDTO,
  GetRefundsByDateRangeDTO 
} from '../../../dto/admin/finance/finance.input.dto';
import { FinanceDTOValidator } from '../../../dto/admin/finance/finance.validator';

@injectable()
export class FinanceService implements IFinanceService {
  constructor(
    @inject("FinanceRepository") private financeRepository: IFinanceRepository
  ) { }

  async getRevenueTransactions(dto: GetTransactionsDTO): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      // Validate DTO
      FinanceDTOValidator.validateGetTransactionsDTO(dto);

      const result = await this.financeRepository.findRevenueTransactions(
        dto.page, 
        dto.limit, 
        dto.search
      );

      return {
        success: true,
        message: "Revenue transactions fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue transactions: ${(error as Error).message}`
      };
    }
  }

  async getRevenueStats(): Promise<ServiceResponse<RevenueStats>> {
    try {
      const [
        totalRevenue,
        previousMonthTotalRevenue,
        todayRevenue,
        yesterdayRevenue,
        currentMonthRevenue,
        previousMonthRevenue
      ] = await Promise.all([
        this.financeRepository.findTotalRevenue(),
        this.financeRepository.findTotalRevenueForPreviousMonth(),
        this.financeRepository.findTodayRevenue(),
        this.financeRepository.findYesterdayRevenue(),
        this.financeRepository.findCurrentMonthRevenue(),
        this.financeRepository.findPreviousMonthRevenue()
      ]);

      const stats: RevenueStats = {
        totalRevenue: totalRevenue.toFixed(2),
        totalRevenueChange: this._calculatePercentageChange(totalRevenue, previousMonthTotalRevenue),
        todayRevenue: todayRevenue.toFixed(2),
        todayRevenueChange: this._calculatePercentageChange(todayRevenue, yesterdayRevenue),
        monthlyRevenue: currentMonthRevenue.toFixed(2),
        monthlyRevenueChange: this._calculatePercentageChange(currentMonthRevenue, previousMonthRevenue)
      };

      return {
        success: true,
        message: "Revenue statistics fetched successfully",
        data: stats
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue statistics: ${(error as Error).message}`
      };
    }
  }

  async getTransactionsByDateRange(dto: GetTransactionsByDateRangeDTO): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      // Validate DTO
      FinanceDTOValidator.validateGetTransactionsByDateRangeDTO(dto);

      const result = await this.financeRepository.findTransactionsByDateRange(
        dto.startDate,
        dto.endDate,
        dto.page,
        dto.limit,
        dto.search
      );

      return {
        success: true,
        message: "Revenue transactions by date range fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue transactions by date range: ${(error as Error).message}`
      };
    }
  }

  async getRefundTransactions(dto: GetTransactionsDTO): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      // Validate DTO
      FinanceDTOValidator.validateGetTransactionsDTO(dto);

      const result = await this.financeRepository.findRefundTransactions(
        dto.page, 
        dto.limit, 
        dto.search
      );
      
      return {
        success: true,
        message: "Refund transactions fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch refund transactions: ${(error as Error).message}`
      };
    }
  }
  
  async getRefundsByDateRange(dto: GetRefundsByDateRangeDTO): Promise<ServiceResponse<any>> {
    try {
      // Validate DTO
      FinanceDTOValidator.validateGetRefundsByDateRangeDTO(dto);

      const result = await this.financeRepository.findRefundsByDateRange(
        dto.startDate,
        dto.endDate,
        dto.page,
        dto.limit,
        dto.search
      );
  
      return {
        success: true,
        message: "Refunds by date range fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch refunds by date range: ${(error as Error).message}`
      };
    }
  }

  async getTransactionsByUser(dto: GetTransactionsByUserDTO): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      FinanceDTOValidator.validateGetTransactionsByUserDTO(dto);

      const result = await this.financeRepository.findTransactionsByUser(
        dto.userId,
        dto.page,
        dto.limit
      );
  
      return {
        success: true,
        message: "User transactions fetched successfully",
        data: result
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch user transactions: ${(error as Error).message}`
      };
    }
  }

  private _calculatePercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Number(((current - previous) / previous * 100).toFixed(1));
  }
}
