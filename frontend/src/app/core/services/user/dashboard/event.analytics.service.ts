import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AnalyticsResponse } from '../../../../core/interfaces/user/dashboard';


@Injectable({
  providedIn: 'root'
})
export class EventAnalyticsService {
  private readonly apiUrl = `${environment.apiUrl}user/dashboard/analytics`;

  constructor(private http: HttpClient) {}

  getEventAnalytics(eventId: string): Observable<AnalyticsResponse> {
    return this.http.get<AnalyticsResponse>(`${this.apiUrl}/event/${eventId}`);
  }
}
