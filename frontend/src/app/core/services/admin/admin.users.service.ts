import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, map, throwError } from 'rxjs';
import { User } from '../../models/userModel';
import { ApiResponse } from '../../models/admin/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminUsersService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  usersList(): Observable<ApiResponse> {
    return this.http.get<User[]>(`${this.baseUrl}admin/users/all-users`, {
      withCredentials: true,
    }).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'An error occurred while fetching users';
        return [{
          success: false as const, 
          message: errorMessage
        }];
      })
    );
  }

  
  verificationUsersList(): Observable<ApiResponse> {
    return this.http.get<User[]>(`${this.baseUrl}admin/users/verification-users`, {
      withCredentials: true,
    }).pipe(
      map(users => ({
        success: true as const, 
        data: users
      })),
      catchError((error: HttpErrorResponse) => {
        const errorMessage = error.error?.message || 'An error occurred while fetching users';
        return [{
          success: false as const, 
          message: errorMessage
        }];
      })
    );
  }

  userDetails(id: string): Observable<User> {    
    return this.http.post<User>(`${this.baseUrl}admin/users/get-details`, { userId: id }, {
      withCredentials: true,
    }).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    );
  }

  blockUser(id:string):Observable<User>{
    return this.http.patch<User>(`${this.baseUrl}admin/users/block-user`,{id},{
      withCredentials:true
    });
  }
  unblockUser(id:string):Observable<User>{
    return this.http.patch<User>(`${this.baseUrl}admin/users/unblock-user`,{id},{
      withCredentials:true
    });
  }

  approveUser(id:string):Observable<User>{
    return this.http.patch<User>(`${this.baseUrl}admin/users/approve-user`,{id},{
      withCredentials:true
    });
  }
  rejectUser(id:string):Observable<User>{
    return this.http.patch<User>(`${this.baseUrl}admin/users/reject-user`,{id},{
      withCredentials:true
    });
  }
}