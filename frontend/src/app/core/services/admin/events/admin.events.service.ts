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
  private readonly _apiUrl = `${environment.apiUrl}admin/events`;
  constructor(private _http: HttpClient) { }

  getEvents(page = 1, limit = 9, searchTerm = '', filter = 'all'): Observable<EventsApiResponse> {
  let params = new HttpParams()
    .set('page', page.toString())
    .set('limit', limit.toString());

  if (searchTerm.trim()) {
    params = params.set('search', searchTerm.trim());
  }

  if (filter !== 'all') {
    params = params.set('filter', filter);
  }

  return this._http.get<{
    events: IEvent[];
    total: number;
    currentPage: number;
    totalPages: number;
  }>(`${this._apiUrl}`, { params }).pipe(
    map(response => ({
      success: true as const,
      data: response.events,
      total: response.total,
      currentPage: response.currentPage,
      totalPages: response.totalPages
    })),
    catchError(this._handleError)
  );
}


  updateEventStatus(eventId: string, status: boolean): Observable<EventsApiResponse> {
    return this._http.patch<any>(
      `${this._apiUrl}/${eventId}/status`,
      { status },

    ).pipe(
      map(response => response),
      catchError(this._handleError)
    );
  }


  private _handleError(error: HttpErrorResponse): Observable<EventsApiResponse> {
    const errorMessage = error.error?.message || 'An error occurred while processing your request';
    console.info('API Error:', error);

    return throwError(() => ({
      success: false as const,
      message: errorMessage
    }));
  }
}