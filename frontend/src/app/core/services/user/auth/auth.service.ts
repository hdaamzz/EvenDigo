import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, delay, Observable, of } from 'rxjs';
import { ILogin, IRegister, User } from '../../../models/userModel';
import { environment } from '../../../../environments/environment';
import { CommonResponse } from '../../../models/user.auth.interface';
import { SubscriptionPlan } from '../../../interfaces/admin/subscriptionPlan';
import { ApiResponse } from '../../../interfaces/user/premium';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}user/auth`;

  constructor(private http: HttpClient) { }

  userRegister(userData: IRegister): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.apiUrl}/send-otp`, userData).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        return of({ success: false, message: 'Registration failed. Please try again.' });
      })
    );
  }

  verifyOTP(email: string, otp: string): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.apiUrl}/verify-otp`, { email, otp }).pipe(
      catchError((error) => {
        console.error('OTP verification error:', error);
        return of({ success: false, message: 'OTP verification failed. Please try again.' });
      })
    );
  }

  userLogin(userData: ILogin): Observable<any> {
    return this.http.post(`${this.apiUrl}/sign-in`, userData).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return of({ success: false, message: error.error?.message || error.message });
      })
    );
  }

  checkAuthStatus(): Observable<{
    isAuthenticated: boolean; user?: User; token?: string, role?: string
  }> {
    return this.http.get<{ isAuthenticated: boolean; user?: User; token?: string, role?: string }>(
      `${this.apiUrl}/status`
    ).pipe(
      catchError((error) => {
        console.error('Auth status check error:', error);
        return of({ 
          isAuthenticated: false, 
          user: undefined, 
          token: undefined, 
          role: undefined 
        });
      })
    );
  }

  loginWithFirebase(idToken: string, name?: string | null, email?: string | null, profileImg?: string | null): Observable<any> {
    const payload = {
      idToken,
      name: name || 'Unknown',
      email: email || '',
      profileImg: profileImg || '',
    };

    return this.http.post(`${this.apiUrl}/firebase-signin`, payload).pipe(
      catchError((error) => {
        console.error('Firebase login error:', error);
        return of({ success: false, message: 'Firebase authentication failed' });
      })
    );
  }

  forgotPassword(formData: {email:string}): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.apiUrl}/forgot-password`, formData).pipe(
      catchError((error) => {
        console.error('Forgot password error:', error);
        return of({ success: false, message: 'Failed to send reset email' });
      })
    );
  }

  resetPassword(resetData: {email:string,newPassword:string,token:string}): Observable<CommonResponse> {
    return this.http.post<CommonResponse>(`${this.apiUrl}/reset-password`, resetData).pipe(
      catchError((error) => {
        console.error('Reset password error:', error);
        return of({ success: false, message: 'Password reset failed' });
      })
    );
  }

  logout(): Observable<CommonResponse> {
    return this.http.get<CommonResponse>(`${this.apiUrl}/logout`).pipe(
      catchError((error) => {
        console.error('Logout error:', error);
        return of({ success: false, message: 'Logout failed. Please try again.' });
      })
    );
  }   
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.http.get<ApiResponse<SubscriptionPlan[]>>(`${this.apiUrl}/plans`).pipe(
      delay(700),
      catchError(error => {
        console.error('Get plans error:', error);
        return of({ success: false, message: 'Failed to fetch subscription plans' });
      })
    );
  }
}