export interface IFinanceRepository {
    findRevenueTransactions(page: number, limit: number, search?: string): Promise<any>;
    findTotalRevenue(): Promise<number>;
    findTotalRevenueForPreviousMonth(): Promise<number>;
    findTodayRevenue(): Promise<number>;
    findYesterdayRevenue(): Promise<number>;
    findCurrentMonthRevenue(): Promise<number>;
    findPreviousMonthRevenue(): Promise<number>;
    findRevenueByDateRange(startDate: Date, endDate: Date): Promise<any[]>;
  }