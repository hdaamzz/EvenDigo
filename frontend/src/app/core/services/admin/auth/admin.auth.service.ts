import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { IAdminLogin } from '../../../models/admin/admin.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }
  adminLogin(adminData: IAdminLogin): Observable<any> {
    return this.http.post(`${this.apiUrl}admin/auth/sign-in`, adminData).pipe(
      catchError((error) => {
        return of({ success: false, message: error.error.message });
      })
    );
  }
}
