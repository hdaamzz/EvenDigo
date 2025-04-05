import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ILogin, IRegister, User } from '../../models/userModel';
import { catchError, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }

  userRegister(userData: IRegister): Observable<any> {
    return this.http.post(`${this.baseUrl}user/auth/send-otp`, userData).pipe(
      catchError((error) => {
        console.error('Registration error:', error);
        return of({ success: false, message: 'Registration failed. Please try again.' });
      })
    );
  }

  verifyOTP(email: string, otp: string): Observable<any> {
    return this.http.post(`${this.baseUrl}user/auth/verify-otp`, { email, otp }).pipe(
      catchError((error) => {
        console.error('OTP verification error:', error);
        return of({ success: false, message: 'OTP verification failed. Please try again.' });
      })
    );
  }
  userLogin(userData: ILogin): Observable<any> {
    return this.http.post(`${this.baseUrl}user/auth/sign-in`, userData, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error('Login error:', error);
        return of({ success: false, message: error.error.message });
      })
    );
  }
  checkAuthStatus(): Observable<{
    isAuthenticated: boolean; user?: User; token?: string, role?: string
  }> {
    return this.http.get<{ isAuthenticated: boolean; user?: User; token?: string, role?: string }>(
      `${this.baseUrl}user/auth/status`,
      { withCredentials: true }
    );
  }

  checkUserRole(): Observable<any> {
    return this.http.get(
      `${this.baseUrl}user/auth/role`,
      { withCredentials: true }
    );
  }


  loginWithFirebase(idToken: string, name?: string | null, email?: string | null, profileImg?: string | null): Observable<any> {
    const payload = {
      idToken,
      name: name || 'Unknown',
      email: email || '',
      profileImg: profileImg || '',
    };


    return this.http.post(`${this.baseUrl}user/auth/firebase-signin`, payload, {
      withCredentials: true,
    });
  }

  forgotPassword(formData:any):Observable<any>{
    return this.http.post(`${this.baseUrl}user/auth/forgot-password`,formData)
  }
  resetPassword(resetData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/auth/reset-password`, resetData);
  }

  logout(): Observable<any> {
    return this.http.get(`${this.baseUrl}user/auth/logout`, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        console.error('Logout error:', error);
        return of({ success: false, message: 'Logout failed. Please try again.' });
      })
    );
  }


}
