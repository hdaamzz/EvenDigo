import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
   private apiUrl=environment.apiUrl
  
  constructor(private http: HttpClient) { }
  
  getWalletDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/profile/wallet`);
  }

  addMoney(amount: number, reference?: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}user/profile/wallet/add-money`, {
      amount,
      reference
    });
  }

  withdrawMoney(amount: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}user/profile/wallet/withdraw-money`, {
      amount
    });
  }

  getTransactionHistory(limit = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/profile/wallet/transactions?limit=${limit}`);
  }
}
