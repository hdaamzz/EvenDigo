import { inject, injectable } from 'tsyringe';
import { ServiceResponse } from '../../../models/interfaces/auth.interface';
import { IFinanceService, RevenueStats, RevenueTransactions } from '../../../../src/services/interfaces/IRevenue.service';
import { IFinanceRepository } from '../../../../src/repositories/interfaces/IFinance.repository';

@injectable()
export class FinanceService implements IFinanceService {
  constructor(
    @inject("FinanceRepository") private financeRepository: IFinanceRepository
  ) {}

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
      // Get total revenue data
      const totalRevenue = await this.financeRepository.findTotalRevenue();
      const previousMonthTotalRevenue = await this.financeRepository.findTotalRevenueForPreviousMonth();
      
      // Get today's revenue data
      const todayRevenue = await this.financeRepository.findTodayRevenue();
      const yesterdayRevenue = await this.financeRepository.findYesterdayRevenue();
      
      // Get current month revenue data
      const currentMonthRevenue = await this.financeRepository.findCurrentMonthRevenue();
      const previousMonthRevenue = await this.financeRepository.findPreviousMonthRevenue();
      
      // Calculate percentage changes
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

  async getRevenueByDateRange(startDate: Date, endDate: Date): Promise<ServiceResponse<any>> {
    try {
      // Pass the additional parameters to the repository
      const revenueData = await this.financeRepository.findRevenueByDateRange(
        startDate, 
        endDate
      );

      console.log(revenueData);
      
      
      // Calculate total revenue for the period
      const totalRevenue = revenueData.reduce((sum: number, day: { amount: number }) => sum + day.amount, 0);
      
      // Calculate average daily revenue
      const daysDiff = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
      const averageDailyRevenue = totalRevenue / daysDiff;
      
      return {
        success: true,
        message: "Revenue data by date range fetched successfully",
        data: {
          dateRange: {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          },
          summary: {
            totalRevenue: totalRevenue.toFixed(2),
            averageDailyRevenue: averageDailyRevenue.toFixed(2),
            totalDays: daysDiff,
            dataPoints: revenueData.length
          },
          revenues: revenueData
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to fetch revenue by date range: ${(error as Error).message}`
      };
    }
  }

 
}