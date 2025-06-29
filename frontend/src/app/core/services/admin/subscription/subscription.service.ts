import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { 
  ApiResponse, 
  PaginationInfo, 
  Subscription, 
  SubscriptionFilter, 
  SubscriptionFilterOptions, 
  SubscriptionStats, 
  SubscriptionStatusUpdate 
} from '../../../models/admin/subscription.interface';


@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly _apiUrl = `${environment.apiUrl}admin/subscriptions`;

  


  constructor(private readonly _http: HttpClient) {}

  getSubscriptions(
    page = 1, 
    limit = 10, 
    filters?: SubscriptionFilter
  ): Observable<ApiResponse<{ subscriptions: Subscription[], pagination: PaginationInfo }>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (filters) {
      params = this._buildFilterParams(params, filters);
    }

    return this._http.get<ApiResponse<{ subscriptions: Subscription[], pagination: PaginationInfo }>>(
      `${this._apiUrl}`,
      { params, withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  getSubscriptionById(id: string): Observable<ApiResponse<Subscription>> {
    return this._http.get<ApiResponse<Subscription>>(
      `${this._apiUrl}/${id}`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }

  getActiveSubscriptions(
  page = 1, 
  limit = 10, 
  filters?: SubscriptionFilter
): Observable<ApiResponse<{ subscriptions: Subscription[], pagination: PaginationInfo }>> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString())
    .set('activeOnly', 'true');
  
  if (filters) {
    params = this._buildFilterParams(params, filters);
  }

  return this._http.get<ApiResponse<{ subscriptions: Subscription[], pagination: PaginationInfo }>>(
    `${this._apiUrl}`,
    { params, withCredentials: true }
  ).pipe(
    catchError(this._handleError)
  );
}


  getSubscriptionStats(): Observable<ApiResponse<SubscriptionStats>> {
    return this._http.get<ApiResponse<SubscriptionStats>>(
      `${this._apiUrl}/stats`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }

  updateSubscriptionStatus(update: SubscriptionStatusUpdate): Observable<ApiResponse<Subscription>> {
    return this._http.patch<ApiResponse<Subscription>>(
      `${this._apiUrl}/status`,
      update,
      
    ).pipe(
      catchError(this._handleError)
    );
  }

  deleteSubscription(id: string): Observable<ApiResponse<any>> {
    return this._http.delete<ApiResponse<any>>(
      `${this._apiUrl}/${id}`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }

  getFilterOptions(): Observable<ApiResponse<SubscriptionFilterOptions>> {
    return this._http.get<ApiResponse<SubscriptionFilterOptions>>(
      `${this._apiUrl}/filter-options`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }

  getUserSubscriptions(userId: string): Observable<ApiResponse<Subscription[]>> {
    return this._http.get<ApiResponse<Subscription[]>>(
      `${this._apiUrl}/user/${userId}`,
      
    ).pipe(
      catchError(this._handleError)
    );
  }


  private _buildFilterParams(params: HttpParams, filters: SubscriptionFilter): HttpParams {
    let updatedParams = params;
    
    if (filters.status && filters.status !== 'all') {
      updatedParams = updatedParams.set('status', filters.status);
    }
    
    if (filters.planType && filters.planType !== 'all') {
      updatedParams = updatedParams.set('planType', filters.planType);
    }
    
    if (filters.searchTerm) {
      updatedParams = updatedParams.set('search', filters.searchTerm);
    }
    
    if (filters.startDate) {
      updatedParams = updatedParams.set('startDate', filters.startDate.toISOString());
    }
    
    if (filters.endDate) {
      updatedParams = updatedParams.set('endDate', filters.endDate.toISOString());
    }
    
    return updatedParams;
  }


  private _handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.status) {
        errorMessage = this._getErrorMessageByStatus(error.status);
      }
    }
    
    console.error('API Error:', error);
    
    return throwError(() => new Error(errorMessage));
  }

  private _getErrorMessageByStatus(status: number): string {
    switch (status) {
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'You do not have permission to perform this action.';
      case 404:
        return 'Requested resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return `Server error: ${status}`;
    }
  }
}