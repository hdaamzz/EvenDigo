import { 
  GetTransactionsDTO, 
  GetTransactionsByDateRangeDTO, 
  GetTransactionsByUserDTO,
  GetRefundsByDateRangeDTO 
} from './finance.input.dto';

export class ServiceFinanceMapper {
  

  static toGetTransactionsDTO(page: number, limit: number, search?: string): GetTransactionsDTO {
    return {
      page: this._validatePage(page),
      limit: this._validateLimit(limit),
      search: search?.trim() || undefined
    };
  }


  static toGetTransactionsByDateRangeDTO(
    startDate: Date, 
    endDate: Date, 
    page: number, 
    limit: number, 
    search?: string
  ): GetTransactionsByDateRangeDTO {
    return {
      startDate: this._validateStartDate(startDate),
      endDate: this._validateAndAdjustEndDate(endDate),
      page: this._validatePage(page),
      limit: this._validateLimit(limit),
      search: search?.trim() || undefined
    };
  }


  static toGetTransactionsByUserDTO(
    userId: string, 
    page: number, 
    limit: number
  ): GetTransactionsByUserDTO {
    return {
      userId: this._validateUserId(userId),
      page: this._validatePage(page),
      limit: this._validateLimit(limit)
    };
  }


  static toGetRefundsByDateRangeDTO(
    startDate: Date, 
    endDate: Date, 
    page: number, 
    limit: number, 
    search?: string
  ): GetRefundsByDateRangeDTO {
    return {
      startDate: this._validateStartDate(startDate),
      endDate: this._validateAndAdjustEndDate(endDate),
      page: this._validatePage(page),
      limit: this._validateLimit(limit),
      search: search?.trim() || undefined
    };
  }

  private static _validatePage(page: number): number {
    const validatedPage = Math.max(1, Math.floor(page) || 1);
    return validatedPage;
  }

  private static _validateLimit(limit: number): number {
    const validatedLimit = Math.max(1, Math.min(100, Math.floor(limit) || 10));
    return validatedLimit;
  }

  private static _validateStartDate(startDate: Date): Date {
    if (isNaN(startDate.getTime())) {
      throw new Error('Invalid start date format');
    }
    return startDate;
  }

  private static _validateAndAdjustEndDate(endDate: Date): Date {
    if (isNaN(endDate.getTime())) {
      throw new Error('Invalid end date format');
    }
    endDate.setHours(23, 59, 59, 999);
    return endDate;
  }

  private static _validateUserId(userId: string): string {
    if (!userId || userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
    return userId.trim();
  }
}
