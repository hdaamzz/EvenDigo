import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AllEventResponse } from '../../../models/event.interface';
import { PayloadData } from '../../../models/booking.interface';
import { PaginatedEventResponse } from '../../../interfaces/user/event';

@Injectable({
  providedIn: 'root'
})
export class UserExploreService {

  private readonly apiUrl = `${environment.apiUrl}user/explore`;


  constructor(private http: HttpClient) {}

  getAllEvents(page: number = 1, limit: number = 12): Observable<PaginatedEventResponse> {
    return this.http.get<PaginatedEventResponse>(`${this.apiUrl}?page=${page}&limit=${limit}`);
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
