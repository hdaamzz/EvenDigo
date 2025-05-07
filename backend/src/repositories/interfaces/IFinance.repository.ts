export interface IFinanceRepository {
    findRevenueTransactions(page: number, limit: number, search?: string): Promise<any>;
    findTotalRevenue(): Promise<number>;
    findTotalRevenueForPreviousMonth(): Promise<number>;
    findTodayRevenue(): Promise<number>;
    findYesterdayRevenue(): Promise<number>;
    findCurrentMonthRevenue(): Promise<number>;
    findPreviousMonthRevenue(): Promise<number>;
    findTransactionsByDateRange(startDate: Date, endDate: Date, page: number, limit: number, search?: string ): Promise<any> 
    findRefundTransactions(page: number, limit: number, search?: string): Promise<any>;
    findRefundByTransactionId(transactionId: string): Promise<any>;
    findRefundsByDateRange(startDate: Date, endDate: Date, page: number, limit: number, search?: string): Promise<any>;
    findTransactionsByUser(userId: string, page: number, limit: number): Promise<any>;
  }