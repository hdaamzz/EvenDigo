import { inject, injectable } from 'tsyringe';
import { ServiceResponse } from '../../../models/interfaces/auth.interface';
import { IFinanceService, RevenueStats, RevenueTransactions } from '../../../../src/services/interfaces/IRevenue.service';
import { IFinanceRepository } from '../../../../src/repositories/interfaces/IFinance.repository';

@injectable()
export class FinanceService implements IFinanceService {
  constructor(
    @inject("FinanceRepository") private financeRepository: IFinanceRepository
  ) { }

  async getRevenueTransactions(page: number, limit: number, search?: string): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      const result = await this.financeRepository.findRevenueTransactions(page, limit, search);

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
      const totalRevenue = await this.financeRepository.findTotalRevenue();
      const previousMonthTotalRevenue = await this.financeRepository.findTotalRevenueForPreviousMonth();

      const todayRevenue = await this.financeRepository.findTodayRevenue();
      const yesterdayRevenue = await this.financeRepository.findYesterdayRevenue();

      const currentMonthRevenue = await this.financeRepository.findCurrentMonthRevenue();
      const previousMonthRevenue = await this.financeRepository.findPreviousMonthRevenue();

      const totalRevenueChange = previousMonthTotalRevenue > 0
        ? ((totalRevenue - previousMonthTotalRevenue) / previousMonthTotalRevenue) * 100
        : 0;

      const todayRevenueChange = yesterdayRevenue > 0
        ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100
        : 0;

      const monthlyRevenueChange = previousMonthRevenue > 0
        ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
        : 0;

      const stats: RevenueStats = {
        totalRevenue: totalRevenue.toFixed(2),
        totalRevenueChange: Number(totalRevenueChange.toFixed(1)),
        todayRevenue: todayRevenue.toFixed(2),
        todayRevenueChange: Number(todayRevenueChange.toFixed(1)),
        monthlyRevenue: currentMonthRevenue.toFixed(2),
        monthlyRevenueChange: Number(monthlyRevenueChange.toFixed(1))
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

  async getTransactionsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    search?: string 
  ): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      const result = await this.financeRepository.findTransactionsByDateRange(
        startDate,
        endDate,
        page,
        limit,
        search
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

  async getRefundTransactions(page: number, limit: number, search?: string): Promise<ServiceResponse<RevenueTransactions>> {
    try {
      const result = await this.financeRepository.findRefundTransactions(page, limit, search);
      
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
  
  async getRefundsByDateRange(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    search?: string 
  ): Promise<ServiceResponse<any>> {
    try {
      const result = await this.financeRepository.findRefundsByDateRange(
        startDate,
        endDate,
        page,
        limit,
        search
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

}