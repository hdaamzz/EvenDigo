import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import { EventsApiResponse } from '../../models/admin/admin.interface';
import { IEvent } from '../../models/event.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminEventsService {
  private baseUrl=environment.baseUrl;
  constructor(private http :HttpClient) { }

  eventList(): Observable<EventsApiResponse> {
    return this.http.get<IEvent[]>(`${this.baseUrl}admin/events`, {
      withCredentials: true,
    }).pipe(
      map(events => ({
        success: true as const,
        data: events
      })),
      catchError((error: HttpErrorResponse) => {
        const errMsg = error.error?.message || 'An error occurred while fetching all events';
        return of({
          success: false as const,
          message: errMsg
        });
      })
    );
  }





}
