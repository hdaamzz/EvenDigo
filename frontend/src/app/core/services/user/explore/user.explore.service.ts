import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AllEventResponse } from '../../../models/event.interface';
import { PayloadData } from '../../../models/booking.interface';

@Injectable({
  providedIn: 'root'
})
export class UserExploreService {

  private readonly apiUrl = `${environment.apiUrl}user/explore`;


  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}`);
  }

  createStripeCheckoutSession(data:PayloadData): Observable<{ success: boolean, data: { sessionId: string } }> {
    const respo=this.http.post<{ success: boolean, data: { sessionId: string } }>(`${this.apiUrl}/checkout`, data);
    return respo
  }

  createWalletCheckout(payload: PayloadData): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/checkout`, 
      payload
    );
  }
}
