import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IEvent } from '../../../models/event.interface';

@Injectable({
  providedIn: 'root'
})
export class UserExploreService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Get all events 
  getAllEvents(): Observable<any> {
    return this.http.get<IEvent[]>(`${this.baseUrl}user/explore`,{withCredentials: true});
  }

  createStripeCheckoutSession(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}user/explore/checkout`, data, { withCredentials: true });
  }
}
