import { ServiceResponse } from "../../../src/models/interfaces/auth.interface";

export interface RevenueStats {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;
}

export interface RevenueTransactions {
  data: any[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export interface IFinanceService {
  getRevenueTransactions(page: number, limit: number, search?: string): Promise<ServiceResponse<RevenueTransactions>>;
  getRevenueStats(): Promise<ServiceResponse<RevenueStats>>;
  getTransactionsByDateRange(startDate: Date, endDate: Date, page: number, limit: number, search?: string): Promise<ServiceResponse<RevenueTransactions>>;
}