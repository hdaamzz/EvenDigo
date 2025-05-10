import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User } from '../../../models/userModel';
import { ApiResponse } from '../../../models/admin/admin.interface';

/**
 * Service for managing admin operations related to users
 * Provides functionality for listing, viewing, approving, and blocking users
 */
@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private readonly _baseUrl = environment.baseUrl;
  private readonly _httpOptions = { withCredentials: true };

  constructor(private _http: HttpClient) {}

  /**
   * Get a list of all users in the system
   * @returns Observable of ApiResponse containing user data
   */
  usersList(): Observable<ApiResponse> {
    return this._http.get<User[]>(
      `${this._baseUrl}admin/users/all-users`, 
      this._httpOptions
    ).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError(this._handleError)
    );
  }

  /**
   * Get a list of users awaiting verification
   * @returns Observable of ApiResponse containing users pending verification
   */
  verificationUsersList(): Observable<ApiResponse> {
    return this._http.get<User[]>(
      `${this._baseUrl}admin/users/verification-users`, 
      this._httpOptions
    ).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError(this._handleError)
    );
  }

  /**
   * Get detailed information for a specific user
   * @param userId The ID of the user to retrieve
   * @returns Observable of User details
   */
  userDetails(userId: string): Observable<User> {    
    return this._http.post<User>(
      `${this._baseUrl}admin/users/get-details`, 
      { userId }, 
      this._httpOptions
    ).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }

  /**
   * Block a user from accessing the system
   * @param userId The ID of the user to block
   * @returns Observable of updated User object
   */
  blockUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._baseUrl}admin/users/block-user`,
      { userId },
      this._httpOptions
    ).pipe(
      catchError(this._handleUserActionError('block'))
    );
  }

  /**
   * Unblock a previously blocked user
   * @param userId The ID of the user to unblock
   * @returns Observable of updated User object
   */
  unblockUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._baseUrl}admin/users/unblock-user`,
      { userId },
      this._httpOptions
    ).pipe(
      catchError(this._handleUserActionError('unblock'))
    );
  }

  /**
   * Approve a user's verification request
   * @param userId The ID of the user to approve
   * @returns Observable of updated User object
   */
  approveUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._baseUrl}admin/users/approve-user`,
      { userId },
      this._httpOptions
    ).pipe(
      catchError(this._handleUserActionError('approve'))
    );
  }

  /**
   * Reject a user's verification request
   * @param userId The ID of the user to reject
   * @returns Observable of updated User object
   */
  rejectUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._baseUrl}admin/users/reject-user`,
      { userId },
      this._httpOptions
    ).pipe(
      catchError(this._handleUserActionError('reject'))
    );
  }

  /**
   * Handle HTTP errors for API responses
   * @private
   */
  private _handleError(error: HttpErrorResponse): Observable<ApiResponse> {
    const errorMessage = error.error?.message || 'An error occurred while processing your request';
    console.error('API Error:', error);
    
    return throwError(() => ({
      success: false as const, 
      message: errorMessage
    }));
  }
  
  /**
   * Handle errors for user action operations
   * @private
   */
  private _handleUserActionError(action: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const errorMessage = error.error?.message || `Failed to ${action} user`;
      console.error(`Error during ${action} operation:`, error);
      return throwError(() => new Error(errorMessage));
    };
  }
}