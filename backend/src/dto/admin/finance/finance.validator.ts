import { 
  GetTransactionsDTO, 
  GetTransactionsByDateRangeDTO, 
  GetTransactionsByUserDTO,
  GetRefundsByDateRangeDTO 
} from './finance.input.dto';

export class FinanceDTOValidator {
  
  static validateGetTransactionsDTO(dto: GetTransactionsDTO): void {
    this._validatePagination(dto.page, dto.limit);
    
    if (dto.search !== undefined && dto.search.length > 0 && dto.search.length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }
  }

  static validateGetTransactionsByDateRangeDTO(dto: GetTransactionsByDateRangeDTO): void {
    this._validatePagination(dto.page, dto.limit);
    this._validateDateRange(dto.startDate, dto.endDate);
    
    if (dto.search !== undefined && dto.search.length > 0 && dto.search.length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }
  }

  static validateGetTransactionsByUserDTO(dto: GetTransactionsByUserDTO): void {
    this._validatePagination(dto.page, dto.limit);
    
    if (!dto.userId || dto.userId.trim().length === 0) {
      throw new Error('User ID is required');
    }
  }

  static validateGetRefundsByDateRangeDTO(dto: GetRefundsByDateRangeDTO): void {
    this._validatePagination(dto.page, dto.limit);
    this._validateDateRange(dto.startDate, dto.endDate);
    
    if (dto.search !== undefined && dto.search.length > 0 && dto.search.length < 2) {
      throw new Error('Search term must be at least 2 characters long');
    }
  }

  private static _validatePagination(page: number, limit: number): void {
    if (page < 1) {
      throw new Error('Page must be greater than 0');
    }
    
    if (limit < 1 || limit > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  private static _validateDateRange(startDate: Date, endDate: Date): void {
    const now = new Date();
    
    if (startDate > now) {
      throw new Error('Start date cannot be in the future');
    }
    
    if (endDate > now) {
      throw new Error('End date cannot be in the future');
    }
    
    if (startDate > endDate) {
      throw new Error('Start date cannot be after end date');
    }

    const oneYear = 365 * 24 * 60 * 60 * 1000;
    if (endDate.getTime() - startDate.getTime() > oneYear) {
      throw new Error('Date range cannot exceed 1 year');
    }
  }
}
