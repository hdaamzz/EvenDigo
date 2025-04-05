import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IEvent } from '../../../models/event.interface';


@Injectable({
  providedIn: 'root'
})
export class UserDashboardService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Create a new event
  createEvent(eventData: FormData): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}user/dashboard/events`, eventData, {
      withCredentials: true,
    });
  }

  // // Get all events for logged in user
  getUserEvents(): Observable<any> {
    return this.http.get<IEvent[]>(`${this.baseUrl}user/dashboard/events`,{
      withCredentials: true,
    });
  }

  // // Get event by ID
  getEventById(eventId: string): Observable<any> {
    return this.http.get<IEvent>(`${this.baseUrl}user/dashboard/events/${eventId}`,{
      withCredentials: true,
    });
  }

  // // Update event
  // updateEvent(eventId: string, eventData: FormData): Observable<any> {
  //   return this.http.put<any>(`${this.apiUrl}/${eventId}`, eventData);
  // }

  // // Delete event
  // deleteEvent(eventId: string): Observable<any> {
  //   return this.http.delete<any>(`${this.apiUrl}/${eventId}`);
  // }
}

