import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

/**
 * Transaction model representing booking/payment transaction data
 */
export interface Transaction {
  bookingId?: string;
  eventName: string;
  organizer: string;
  date: string;
  participant?: string;
  ticketDetails?: string;
  ticketType?: string;
  paymentType?: string;
  amount: string;
  status: string;
  statusClass?: string;
  rawData?: any;
}

/**
 * Revenue statistics model for dashboard metrics
 */
export interface RevenueStats {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;
}

/**
 * Detailed booking information model
 */
export interface BookingDetail {
  bookingId: string;
  eventName: string;
  eventId: string;
  organizer: string;
  participant: string;
  ticketDetails: Array<{
    type: string;
    price: number;
    quantity: number;
    usedTickets: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  discount: number;
  couponCode?: string;
  paymentStatus: string;
  paymentType: string;
  paymentDate: string;
  stripeSessionId?: string;
}

/**
 * API response structure for finance data
 */
export interface FinanceApiResponse<T> {
  success: boolean;
  data: T;
  totalItems?: number;
  message?: string;
}

/**
 * Service for managing financial operations including revenue tracking,
 * transaction history, and refund management
 */
@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private readonly _baseUrl: string = environment.baseUrl;
  private readonly _httpOptions = { withCredentials: true };

  constructor(private _http: HttpClient) { }

  // EVENT DISTRIBUTION METHODS

  /**
   * Fetch distributed revenue history with pagination
   */
  getDistributedRevenue(page: number = 1, limit: number = 10): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit)
      .set('is_distributed', 'true');

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/dist/recent`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get revenue distribution statistics
   */
  getRevenueStats(): Observable<FinanceApiResponse<any>> {
    return this._http.get<FinanceApiResponse<any>>(
      `${this._baseUrl}admin/dist/stats`,
      this._httpOptions
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get events by array of IDs
   */
  getEventsByIds(eventIds: string[]): Observable<any[]> {
    const params = new HttpParams().set('ids', eventIds.join(','));

    return this._http.get<any[]>(
      `${this._baseUrl}admin/dist/batch`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get distributed revenue within a specific date range
   */
  getRevenueByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10
  ): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit)
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('is_distributed', 'true');

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/dist/date-range`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  // REFUND HISTORY METHODS

  /**
   * Get refund transactions with pagination
   */
  getRefundTransactions(page: number = 1, limit: number = 5): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/finance/refunds`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get refunds within a specific date range with optional search term
   */
  getRefundsByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 5,
    search: string = ''
  ): Observable<FinanceApiResponse<any[]>> {
    let params = this._buildPaginationParams(page, limit)
      .set('startDate', startDate)
      .set('endDate', endDate);

    if (search) {
      params = params.set('search', search);
    }

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/finance/refunds/range`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  // BOOKING HISTORY METHODS

  /**
   * Fetch revenue transactions with pagination
   */
  fetchRevenue(page: number = 1, limit: number = 10): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/finance/revenue`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Fetch revenue statistics for dashboard display
   */
  fetchRevenueStats(): Observable<RevenueStats> {
    return this._http.get<RevenueStats>(
      `${this._baseUrl}admin/finance/stats`,
      this._httpOptions
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get transactions within a specific date range
   */
  getTransactionByDateRange(startDate: string, endDate: string): Observable<FinanceApiResponse<any[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/finance/revenue/range`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get transactions for a specific user
   */
  getTransactionsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit)
      .set('userId', userId);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._baseUrl}admin/finance/revenue/user`,
      { params, ...this._httpOptions }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Build pagination params for API requests
   * @private
   */
  private _buildPaginationParams(page: number, limit: number): HttpParams {
    return new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
  }

  /**
   * Handle HTTP errors consistently
   * @private
   */
  private _handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = error.error?.message ||
        `Server Error: ${error.status} - ${error.statusText}`;
    }

    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}