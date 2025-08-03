import { GetRefundsByDateRangeDTO, GetTransactionsByDateRangeDTO, GetTransactionsByUserDTO, GetTransactionsDTO } from "../../dto/admin/finance/finance.input.dto";
import { ServiceResponse } from "../../models/interfaces/auth.interface";

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

export interface RefundData {
  bookingId: string;
  ticketType: string;
  quantity: number;
  amount: number;
  reason: string;
  notes?: string;
}

export interface IFinanceService {
  getRevenueTransactions(dto: GetTransactionsDTO): Promise<ServiceResponse<RevenueTransactions>>;
  getRevenueStats(): Promise<ServiceResponse<RevenueStats>>;
  getTransactionsByDateRange(dto: GetTransactionsByDateRangeDTO): Promise<ServiceResponse<RevenueTransactions>>;
  getRefundTransactions(dto: GetTransactionsDTO): Promise<ServiceResponse<RevenueTransactions>>;
  getRefundsByDateRange(dto: GetRefundsByDateRangeDTO): Promise<ServiceResponse<any>>;
  getTransactionsByUser(dto: GetTransactionsByUserDTO): Promise<ServiceResponse<RevenueTransactions>>;
}