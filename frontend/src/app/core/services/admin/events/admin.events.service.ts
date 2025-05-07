import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, throwError } from 'rxjs';
import { EventsApiResponse } from '../../../models/admin/admin.interface';
import { IEvent } from '../../../models/event.interface';

@Injectable({
  providedIn: 'root'
})
export class AdminEventsService {
  private baseUrl=environment.baseUrl;
  constructor(private http :HttpClient) { }

  eventList(page: number = 1, limit: number = 9): Observable<EventsApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<IEvent[]>(`${this.baseUrl}admin/events`, {
      withCredentials: true,
      params
    }).pipe(
      map(events => ({
        success: true as const,
        data: events
      })),
      catchError((error: HttpErrorResponse) => {
        const errMsg = error.error?.message || 'An error occurred while fetching events';
        return of({
          success: false as const,
          message: errMsg
        });
      })
    );
  }
  

  updateEventStatus(eventId: string, status: boolean) {
    return this.http.patch<any>(`${this.baseUrl}admin/events/${eventId}/status`, { status },{withCredentials: true})
      .pipe(
        map(response => response),
        catchError(error => {
          console.error('Error updating event status:', error);
          return throwError(() => error);
        })
      );
  }
}
