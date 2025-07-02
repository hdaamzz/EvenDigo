import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AllEventResponse, EventResponse, IEvent } from '../../../models/event.interface';


@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private readonly apiUrl = `${environment.apiUrl}user/dashboard`;


  constructor(private http: HttpClient) {}

  createEvent(eventData: FormData): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.apiUrl}/events`, eventData );
  }

  getUserEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}/events`);
  }

  getOngoingEvents(): Observable<any> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}/events/ongoing`);
  }

  getUserOrganizedEvents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/organized`);
  }

  getUserParticipatedEvents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/events/participated`);
  }

  getEventById(eventId: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}/events/${eventId}`);
  }
}

