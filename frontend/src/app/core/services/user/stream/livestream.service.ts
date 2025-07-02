import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { LiveStreamResponse, LiveStreamStatus } from '../../../interfaces/user/stream';




@Injectable({
  providedIn: 'root'
})

export class LivestreamService {

private apiUrl = `${environment.apiUrl}user/livestream`;
  private liveStreamStatus = new BehaviorSubject<LiveStreamStatus>({
    isLive: false,
    viewerCount: 0
  });

  public liveStreamStatus$ = this.liveStreamStatus.asObservable();

  constructor(private http: HttpClient) {}

  startLiveStream(eventId: string): Observable<LiveStreamResponse> {
    return this.http.post<LiveStreamResponse>(`${this.apiUrl}/events/${eventId}/start`, {});
  }

  joinLiveStream(eventId: string): Observable<LiveStreamResponse> {
  return this.http.post<LiveStreamResponse>(`${this.apiUrl}/events/${eventId}/join`, {})
    .pipe(
      catchError(error => {
        console.error('Failed to join live stream:', error);
        return throwError(() => new Error('Failed to join stream. Please try again.'));
      })
    );
}

  endLiveStream(eventId: string): Observable<LiveStreamResponse> {
    return this.http.post<LiveStreamResponse>(`${this.apiUrl}/events/${eventId}/end`, {});
  }

  getLiveStreamStatus(eventId: string): Observable<{ success: boolean; data: LiveStreamStatus }> {
    return this.http.get<{ success: boolean; data: LiveStreamStatus }>(`${this.apiUrl}/events/${eventId}/status`);
  }

  generateViewerToken(eventId: string): Observable<LiveStreamResponse> {
    return this.http.get<LiveStreamResponse>(`${this.apiUrl}/events/${eventId}/token`);
  }

  updateLiveStreamStatus(status: LiveStreamStatus): void {
    this.liveStreamStatus.next(status);
  }
}
