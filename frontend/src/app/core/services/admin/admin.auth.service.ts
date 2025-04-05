import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { IAdminLogin } from '../../models/admin/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private baseUrl = environment.baseUrl;
  constructor(private http: HttpClient) { }
  adminLogin(adminData: IAdminLogin): Observable<any> {
    return this.http.post(`${this.baseUrl}admin/auth/sign-in`, adminData, {
      withCredentials: true,
    }).pipe(
      catchError((error) => {
        return of({ success: false, message: error.error.message });
      })
    );
  }
}
