import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiResponse, PaginationInfo, Subscription, SubscriptionFilter, SubscriptionFilterOptions, SubscriptionStats, SubscriptionStatusUpdate } from '../../../models/admin/subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  getSubscriptions(
    page: number = 1, 
    limit: number = 10, 
    filters?: SubscriptionFilter
  ): Observable<ApiResponse<{ subscriptions: Subscription[], pagination: PaginationInfo }>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (filters) {
      if (filters.status && filters.status !== 'all') {
        params = params.set('status', filters.status);
      }
      if (filters.planType && filters.planType !== 'all') {
        params = params.set('planType', filters.planType);
      }
      if (filters.searchTerm) {
        params = params.set('search', filters.searchTerm);
      }
      if (filters.startDate) {
        params = params.set('startDate', filters.startDate.toISOString());
      }
      if (filters.endDate) {
        params = params.set('endDate', filters.endDate.toISOString());
      }
    }

    return this.http.get<ApiResponse<{ subscriptions: Subscription[], pagination: PaginationInfo }>>(
      `${this.baseUrl}admin/subscriptions`,
      { params, withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionById(id: string): Observable<ApiResponse<Subscription>> {
    return this.http.get<ApiResponse<Subscription>>(
      `${this.baseUrl}admin/subscriptions/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionStats(): Observable<ApiResponse<SubscriptionStats>> {
    return this.http.get<ApiResponse<SubscriptionStats>>(
      `${this.baseUrl}admin/subscriptions/stats`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  updateSubscriptionStatus(update: SubscriptionStatusUpdate): Observable<ApiResponse<Subscription>> {
    return this.http.patch<ApiResponse<Subscription>>(
      `${this.baseUrl}admin/subscriptions/status`,
      update,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  deleteSubscription(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.baseUrl}admin/subscriptions/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getFilterOptions(): Observable<ApiResponse<SubscriptionFilterOptions>> {
    return this.http.get<ApiResponse<SubscriptionFilterOptions>>(
      `${this.baseUrl}admin/subscriptions/filter-options`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getUserSubscriptions(userId: string): Observable<ApiResponse<Subscription[]>> {
    return this.http.get<ApiResponse<Subscription[]>>(
      `${this.baseUrl}admin/subscriptions/user/${userId}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Requested resource not found.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server error: ${error.status}`;
            break;
        }
      }
    }
    
    console.error('API Error:', error);
    
    return throwError(() => new Error(errorMessage));
  }
}