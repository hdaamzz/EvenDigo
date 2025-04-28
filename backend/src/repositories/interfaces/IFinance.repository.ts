export interface IFinanceRepository {
    findRevenueTransactions(page: number, limit: number, search?: string): Promise<any>;
    findTotalRevenue(): Promise<number>;
    findTotalRevenueForPreviousMonth(): Promise<number>;
    findTodayRevenue(): Promise<number>;
    findYesterdayRevenue(): Promise<number>;
    findCurrentMonthRevenue(): Promise<number>;
    findPreviousMonthRevenue(): Promise<number>;
    findTransactionsByDateRange(startDate: Date, endDate: Date, page: number, limit: number, search?: string ): Promise<any> 
  }