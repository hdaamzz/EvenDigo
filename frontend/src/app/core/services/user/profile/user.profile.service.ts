import { Injectable } from '@angular/core';
import { catchError, delay, Observable, of, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
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

  private readonly apiUrl = `${environment.apiUrl}user/profile`;

  constructor(private http: HttpClient) { }

  
  userDetails(): Observable<UpdateProfileResponse> {
      return this.http.get<UpdateProfileResponse>(`${this.apiUrl}/user-details`).pipe(
        catchError(error => {
          console.error('Error fetching user details:', error);
          return throwError(() => new Error('Failed to fetch user details'));
        })
      );
  }
  updateUserProfile( userData: Partial<User>): Observable<UpdateProfileResponse> {
    
    return this.http.post<UpdateProfileResponse>(`${this.apiUrl}/update`, {
      ...userData
    }).pipe(
      catchError(error => {
        console.error('Error updating user profile:', error);
        return throwError(() => new Error('Failed to update user profile'));
      })
    );
  }

  verificationRequest():Observable<VerificationRequestResponse>{
    return this.http.post<VerificationRequestResponse>(`${this.apiUrl}/verification-request`,{}).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    )
  }

  verificationRequestDetails():Observable<any>{
    return this.http.get(`${this.apiUrl}/verification-request`).pipe(
      catchError(error => {
        console.error('Error fetching user details:', error);
        return throwError(() => new Error('Failed to fetch user details'));
      })
    )
  }
  getUserEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}/events`);
  }

  getUserBookings(): Observable<AllBookingResponse> {
    return this.http.get<AllBookingResponse>(`${this.apiUrl}/bookings`);
  }
  cancelTicket(bookingId: string, ticketUniqueId: string): Observable<void> {    
    return this.http.post<void>(`${this.apiUrl}/events/cancel`, { bookingId,ticketUniqueId });
  }

  deleteEvent(eventId: string):Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/events/${eventId}`);
  }
  updateEvent(eventId: string, formData: FormData): Observable<void> {
    formData.append('eventId', eventId);
    
    return this.http.put<void>(`${this.apiUrl}/events`, formData);
  }
  getEventById(eventId: string) :Observable<EventResponse>{
    return this.http.get<EventResponse>(`${this.apiUrl}/events/${eventId}`);
  }
  getBadgeById() :Observable<any>{
    return this.http.get(`${this.apiUrl}/badge`);
  }
  changePassword(data: {currentPassword: string, newPassword: string, confirmPassword: string}): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, data).pipe(
      catchError(error => {
        console.error('Error changing password:', error);
        return throwError(() => new Error(error.error?.message || 'Failed to change password'));
      })
    );
  }
}
