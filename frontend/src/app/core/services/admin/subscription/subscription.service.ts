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

/**
 * Service for handling subscription-related API operations
 */
@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  /** Base API URL from environment */
  private readonly _baseUrl = environment.baseUrl;

  /**
   * @param _http Angular HTTP client for API requests
   */
  constructor(private readonly _http: HttpClient) {}

  /**
   * Retrieves subscriptions with optional pagination and filtering
   * @param page Page number for pagination
   * @param limit Results per page
   * @param filters Optional filter parameters
   * @returns Observable with subscription data and pagination info
   */
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
      `${this._baseUrl}admin/subscriptions`,
      { params, withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get a specific subscription by ID
   * @param id Subscription ID
   * @returns Observable with subscription data
   */
  getSubscriptionById(id: string): Observable<ApiResponse<Subscription>> {
    return this._http.get<ApiResponse<Subscription>>(
      `${this._baseUrl}admin/subscriptions/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get subscription statistics
   * @returns Observable with subscription stats
   */
  getSubscriptionStats(): Observable<ApiResponse<SubscriptionStats>> {
    return this._http.get<ApiResponse<SubscriptionStats>>(
      `${this._baseUrl}admin/subscriptions/stats`,
      { withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Update a subscription's active status
   * @param update Status update parameters
   * @returns Observable with updated subscription
   */
  updateSubscriptionStatus(update: SubscriptionStatusUpdate): Observable<ApiResponse<Subscription>> {
    return this._http.patch<ApiResponse<Subscription>>(
      `${this._baseUrl}admin/subscriptions/status`,
      update,
      { withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Delete a subscription
   * @param id Subscription ID to delete
   * @returns Observable with response data
   */
  deleteSubscription(id: string): Observable<ApiResponse<any>> {
    return this._http.delete<ApiResponse<any>>(
      `${this._baseUrl}admin/subscriptions/${id}`,
      { withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get available filter options for subscriptions
   * @returns Observable with filter options
   */
  getFilterOptions(): Observable<ApiResponse<SubscriptionFilterOptions>> {
    return this._http.get<ApiResponse<SubscriptionFilterOptions>>(
      `${this._baseUrl}admin/subscriptions/filter-options`,
      { withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Get subscriptions for a specific user
   * @param userId User ID
   * @returns Observable with user's subscriptions
   */
  getUserSubscriptions(userId: string): Observable<ApiResponse<Subscription[]>> {
    return this._http.get<ApiResponse<Subscription[]>>(
      `${this._baseUrl}admin/subscriptions/user/${userId}`,
      { withCredentials: true }
    ).pipe(
      catchError(this._handleError)
    );
  }

  /**
   * Builds HTTP params based on provided filters
   * @param params Initial HttpParams object
   * @param filters Filter parameters
   * @returns Updated HttpParams object
   */
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

  /**
   * Error handler for HTTP requests
   * @param error HTTP error response
   * @returns Observable with error message
   */
  private _handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error?.error) {
        errorMessage = error.error.error;
      } else if (error.status) {
        errorMessage = this._getErrorMessageByStatus(error.status);
      }
    }
    
    console.error('API Error:', error);
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Gets appropriate error message based on HTTP status code
   * @param status HTTP status code
   * @returns Error message
   */
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