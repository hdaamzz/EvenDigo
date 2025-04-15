import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, VerificationRequestResponse } from '../../../models/userModel';
import { UpdateProfileResponse } from '../../../models/profile.interfaces';
import { AllEventResponse } from '../../../models/event.interface';
import { AllBookingResponse } from '../../../models/booking.interface';
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
  updateUserProfile(userId: string | undefined, userData: Partial<User>): Observable<UpdateProfileResponse> {
    if (!userId) {
      return throwError(() => new Error('User ID is missing'));
    }
    
    return this.http.post<UpdateProfileResponse>(`${this.baseUrl}user/profile/update`, {
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

  verificationRequest(id:string):Observable<VerificationRequestResponse>{
    return this.http.post<VerificationRequestResponse>(`${this.baseUrl}user/profile/verification-request`,{id},{
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
  getUserEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.baseUrl}user/profile/events`, {
      withCredentials: true,
    });
  }

  getUserBookings(): Observable<AllBookingResponse> {
    return this.http.get<AllBookingResponse>(`${this.baseUrl}user/profile/bookings`, {
      withCredentials: true,
    });
  }
  cancelTicket(bookingId: string, ticketUniqueId: string): Observable<void> {    
    return this.http.post<void>(`${this.baseUrl}user/profile/events/cancel`, { bookingId,ticketUniqueId }, {
      withCredentials: true
    });
  }
}
