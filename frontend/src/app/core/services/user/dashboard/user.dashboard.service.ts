import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AllEventResponse, EventResponse, IEvent } from '../../../models/event.interface';


@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Create a new event
  createEvent(eventData: FormData): Observable<EventResponse> {
    return this.http.post<EventResponse>(`${this.baseUrl}user/dashboard/events`, eventData, {
      withCredentials: true,
    });
  }

  // // Get all events for logged in user
  getUserEvents(): Observable<AllEventResponse> {
    return this.http.get<AllEventResponse>(`${this.baseUrl}user/dashboard/events`,{
      withCredentials: true,
    });
  }

  // // Get event by ID
  getEventById(eventId: string): Observable<EventResponse> {
    return this.http.get<EventResponse>(`${this.baseUrl}user/dashboard/events/${eventId}`,{
      withCredentials: true,
    });
  }
}

