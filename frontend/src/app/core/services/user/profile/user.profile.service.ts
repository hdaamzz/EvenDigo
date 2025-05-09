import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User, VerificationRequestResponse } from '../../../models/userModel';
import { UpdateProfileResponse } from '../../../models/profile.interfaces';
import { AllEventResponse, EventResponse, IEvent } from '../../../models/event.interface';
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

  baseUrl=environment.baseUrl
  constructor(private http: HttpClient) { }

  
  userDetails(): Observable<UpdateProfileResponse> {
      return this.http.get<UpdateProfileResponse>(`${this.baseUrl}user/profile/user-details`, {
        withCredentials: true,
      }).pipe(
        catchError(error => {
          console.error('Error fetching user details:', error);
          return throwError(() => new Error('Failed to fetch user details'));
        })
      );
  }
  updateUserProfile( userData: Partial<User>): Observable<UpdateProfileResponse> {
    
    return this.http.post<UpdateProfileResponse>(`${this.baseUrl}user/profile/update`, {
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

  verificationRequest():Observable<VerificationRequestResponse>{
    console.log("helll");
    
    return this.http.post<VerificationRequestResponse>(`${this.baseUrl}user/profile/verification-request`,{},{withCredentials:true}).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    )
  }

  verificationRequestDetails():Observable<any>{
    return this.http.get(`${this.baseUrl}user/profile/verification-request`,{withCredentials: true}).pipe(
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

  deleteEvent(eventId: string):Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}user/profile/events/${eventId}`,{withCredentials:true});
  }
  updateEvent(eventId: string, formData: FormData): Observable<void> {
    formData.append('eventId', eventId);
    
    return this.http.put<void>(`${this.baseUrl}user/profile/events`, formData, {
      withCredentials: true
    });
  }
  getEventById(eventId: string) :Observable<EventResponse>{
    return this.http.get<EventResponse>(`${this.baseUrl}user/profile/events/${eventId}`,{
      withCredentials: true
    });
  }
  getBadgeById() :Observable<any>{
    return this.http.get(`${this.baseUrl}user/profile/badge`,{
      withCredentials: true
    });
  }
  changePassword(data: {currentPassword: string, newPassword: string, confirmPassword: string}): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}user/profile/change-password`, data, {
      withCredentials: true
    }).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to change password'));
      })
    );
  }
}
