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
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  getAllEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.baseUrl}user/explore`,{withCredentials: true});
  }

  createStripeCheckoutSession(data:PayloadData): Observable<{ success: boolean, data: { sessionId: string } }> {
    const respo=this.http.post<{ success: boolean, data: { sessionId: string } }>(`${this.baseUrl}user/explore/checkout`, data, { withCredentials: true });
    return respo
  }

  createWalletCheckout(payload: PayloadData): Observable<any> {
    return this.http.post<any>(
      `${this.baseUrl}user/explore/checkout`, 
      payload, 
      { withCredentials: true }
    );
  }
}
