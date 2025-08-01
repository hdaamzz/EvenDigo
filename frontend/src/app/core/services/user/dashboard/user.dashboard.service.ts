import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AllEventResponse, EventResponse } from '../../../models/event.interface';


@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private readonly apiUrl = `${environment.apiUrl}user/dashboard`;


  constructor(private http: HttpClient) {}

  createEvent(eventData: FormData): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.apiUrl}/events`, eventData );
  }

  getUserEvents(page: number = 1, limit: number = 10): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}/events?page=${page}&limit=${limit}`);
  }

  getOngoingEvents(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}/events/ongoing?page=${page}&limit=${limit}`);
  }

  getUserOrganizedEvents(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/organized?page=${page}&limit=${limit}`);
  }

  getUserParticipatedEvents(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/participated?page=${page}&limit=${limit}`);
  }

  getEventById(eventId: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/events/${eventId}`);
  }
}

