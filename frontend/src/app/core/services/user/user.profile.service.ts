import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../models/userModel';
import { BehaviorSubject } from 'rxjs';
interface Transaction {
  date: string;
  eventDetails: string;
  transactionId: string;
  amount: number;
  balance: number;
}

interface WalletDetails {
  balance: number;
  transactions: Transaction[];
}


@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private userIdSource = new BehaviorSubject<string | undefined>(undefined);
  currentUserId = this.userIdSource.asObservable();

  baseUrl=environment.baseUrl
  constructor(private http: HttpClient) { }

  updateUserId(userId: string | undefined) {
    this.userIdSource.next(userId);
  }
  userDetails(id: string): Observable<User> {
      return this.http.post<User>(`${this.baseUrl}user/profile/user-details`, { userId: id }, {
        withCredentials: true,
      }).pipe(
        catchError(error => {
          console.error('Error fetching user details:', error);
          return throwError(() => new Error('Failed to fetch user details'));
        })
      );
  }
  updateUserProfile(userId: string | undefined, userData: any): Observable<any> {
    if (!userId) {
      return throwError(() => new Error('User ID is missing'));
    }
    
    return this.http.post<any>(`${this.baseUrl}user/profile/update`, {
      userId: userId,
      ...userData
    }, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }

  verificationRequest(id:string):Observable<any>{
    return this.http.post(`${this.baseUrl}user/profile/verification-request`,{id},{
      withCredentials: true,
    }).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    )
  }

  verificationRequestDetails(id:string):Observable<any>{
    return this.http.get(`${this.baseUrl}user/profile/verification-request/${id}`,{withCredentials: true}).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    )
  }
  getUserEvents(): Observable<any> {
    return this.http.get<{ success: boolean; data: any[] }>(`${this.baseUrl}user/profile/events`, {
      withCredentials: true,
    });
  }
  cancelTicket(bookingId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}user/profile/events/cancel`, { bookingId }, {
      withCredentials: true
    });
  }
}
