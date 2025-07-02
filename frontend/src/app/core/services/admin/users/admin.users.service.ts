import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { User } from '../../../models/userModel';
import { ApiResponse } from '../../../models/admin/admin.interface';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private readonly _apiUrl = `${environment.apiUrl}admin/users`;

  constructor(private _http: HttpClient) {}

    searchUsers(searchTerm: string): Observable<ApiResponse> {
    const params = searchTerm ? new HttpParams().set('search', searchTerm) : new HttpParams();
    
    return this._http.get<User[]>(
      `${this._apiUrl}/search-users`,
      { params }
    ).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError(this._handleError)
    );
  }

  searchVerificationUsers(searchTerm: string): Observable<ApiResponse> {
    const params = searchTerm ? new HttpParams().set('search', searchTerm) : new HttpParams();
    
    return this._http.get<User[]>(
      `${this._apiUrl}/search-verification-users`,
      { params }
    ).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError(this._handleError)
    );
  }

  usersList(): Observable<ApiResponse> {
    return this._http.get<User[]>(
      `${this._apiUrl}/all-users` 
     
    ).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError(this._handleError)
    );
  }


  verificationUsersList(): Observable<ApiResponse> {
    return this._http.get<User[]>(
      `${this._apiUrl}/verification-users` 
     
    ).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError(this._handleError)
    );
  }


  userDetails(userId: string): Observable<User> {    
    return this._http.post<User>(
      `${this._apiUrl}/get-details`, 
      { userId }
    ).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }


  blockUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._apiUrl}/block-user`,
      { userId }
    ).pipe(
      catchError(this._handleUserActionError('block'))
    );
  }


  unblockUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._apiUrl}/unblock-user`,
      { userId }
    ).pipe(
      catchError(this._handleUserActionError('unblock'))
    );
  }


  approveUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._apiUrl}/approve-user`,
      { userId }
    ).pipe(
      catchError(this._handleUserActionError('approve'))
    );
  }

  
  rejectUser(userId: string): Observable<User> {
    return this._http.patch<User>(
      `${this._apiUrl}/reject-user`,
      { userId }
    ).pipe(
      catchError(this._handleUserActionError('reject'))
    );
  }


  private _handleError(error: HttpErrorResponse): Observable<ApiResponse> {
    const errorMessage = error.error?.message || 'An error occurred while processing your request';
    console.error('API Error:', error);
    
    return throwError(() => ({
      success: false as const, 
      message: errorMessage
    }));
  }
  

  private _handleUserActionError(action: string) {
    return (error: HttpErrorResponse): Observable<never> => {
      const errorMessage = error.error?.message || `Failed to ${action} user`;
      console.error(`Error during ${action} operation:`, error);
      return throwError(() => new Error(errorMessage));
    };
  }
}