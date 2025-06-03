import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AllEventResponse, EventResponse, IEvent } from '../../../models/event.interface';


@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  createEvent(eventData: FormData): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.apiUrl}user/dashboard/events`, eventData );
  }

  getUserEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.apiUrl}user/dashboard/events`);
  }

  getUserOrganizedEvents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/dashboard/events/organized`);
  }

  getUserParticipatedEvents(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}user/dashboard/events/participated`);
  }

  getEventById(eventId: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.apiUrl}user/dashboard/events/${eventId}`);
  }
}

