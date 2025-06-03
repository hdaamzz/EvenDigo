import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

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


export interface RevenueStats {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;
}


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


export interface FinanceApiResponse<T> {
  success: boolean;
  data: T;
  totalItems?: number;
  message?: string;
}


@Injectable({
  providedIn: 'root'
})
export class FinanceService {
  private readonly _apiUrl: string = environment.apiUrl;
  constructor(private _http: HttpClient) { }

  // EVENT DISTRIBUTION METHODS

  getDistributedRevenue(page: number = 1, limit: number = 10): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit)
      .set('is_distributed', 'true');

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._apiUrl}admin/dist/recent`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }


  getRevenueStats(): Observable<FinanceApiResponse<any>> {
    return this._http.get<FinanceApiResponse<any>>(
      `${this._apiUrl}admin/dist/stats`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }


  getEventsByIds(eventIds: string[]): Observable<any[]> {
    const params = new HttpParams().set('ids', eventIds.join(','));

    return this._http.get<any[]>(
      `${this._apiUrl}admin/dist/batch`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }


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
      `${this._apiUrl}admin/dist/date-range`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }

  // REFUND HISTORY METHODS


  getRefundTransactions(page: number = 1, limit: number = 5): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._apiUrl}admin/finance/refunds`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }

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
      `${this._apiUrl}admin/finance/refunds/range`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }

  // BOOKING HISTORY METHODS


  fetchRevenue(page: number = 1, limit: number = 10): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._apiUrl}admin/finance/revenue`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }

  fetchRevenueStats(): Observable<RevenueStats> {
    return this._http.get<RevenueStats>(
      `${this._apiUrl}admin/finance/stats`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }


  getTransactionByDateRange(startDate: string, endDate: string): Observable<FinanceApiResponse<any[]>> {
    const params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._apiUrl}admin/finance/revenue/range`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }


  getTransactionsByUser(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Observable<FinanceApiResponse<any[]>> {
    const params = this._buildPaginationParams(page, limit)
      .set('userId', userId);

    return this._http.get<FinanceApiResponse<any[]>>(
      `${this._apiUrl}admin/finance/revenue/user`,
      { params }
    ).pipe(
      catchError(this._handleError)
    );
  }


  private _buildPaginationParams(page: number, limit: number): HttpParams {
    return new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
  }


  private _handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message ||
        `Server Error: ${error.status} - ${error.statusText}`;
    }

    console.error(errorMessage, error);
    return throwError(() => new Error(errorMessage));
  }
}