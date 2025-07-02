import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private readonly apiUrl = `${environment.apiUrl}user/profile/wallet`;

  
  constructor(private http: HttpClient) { }
  
  getWalletDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  addMoney(amount: number, reference?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add-money`, {
      amount,
      reference
    });
  }

  withdrawMoney(amount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/withdraw-money`, {
      amount
    });
  }

  getTransactionHistory(limit = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/transactions?limit=${limit}`);
  }
}
