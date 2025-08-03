export interface GetTransactionsDTO {
  page: number;
  limit: number;
  search?: string;
}

export interface GetTransactionsByDateRangeDTO {
  startDate: Date;
  endDate: Date;
  page: number;
  limit: number;
  search?: string;
}

export interface GetTransactionsByUserDTO {
  userId: string;
  page: number;
  limit: number;
}

export interface GetRefundsByDateRangeDTO {
  startDate: Date;
  endDate: Date;
  page: number;
  limit: number;
  search?: string;
}
