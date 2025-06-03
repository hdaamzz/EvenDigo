import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { EventsApiResponse } from '../../../models/admin/admin.interface';
import { IEvent } from '../../../models/event.interface';


@Injectable({
  providedIn: 'root'
})
export class AdminEventsService {
  private readonly _apiUrl = environment.apiUrl;
  
  constructor(private _http: HttpClient) { }


  getEvents(page = 1, limit = 9): Observable<EventsApiResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this._http.get<IEvent[]>(`${this._apiUrl}admin/events`, {
      params
    }).pipe(
      map(events => ({
        success: true as const,
        data: events
      })),
      catchError(this._handleError)
    );
  }
  

  updateEventStatus(eventId: string, status: boolean): Observable<EventsApiResponse> {
    return this._http.patch<any>(
      `${this._apiUrl}admin/events/${eventId}/status`, 
      { status },
      
    ).pipe(
      map(response => response),
      catchError(this._handleError)
    );
  }


  private _handleError(error: HttpErrorResponse): Observable<EventsApiResponse> {
    const errorMessage = error.error?.message || 'An error occurred while processing your request';
    console.error('API Error:', error);
    
    return throwError(() => ({
      success: false as const,
      message: errorMessage
    }));
  }
}