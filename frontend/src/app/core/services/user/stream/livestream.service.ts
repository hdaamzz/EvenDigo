import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../../environments/environment';


export interface LiveStreamResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    roomId: string;
    streamKey?: string;
    rtmpUrl?: string;
  };
}

export interface LiveStreamStatus {
  isLive: boolean;
  viewerCount: number;
  startTime?: Date;
}

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
    return this.http.post<LiveStreamResponse>(`${this.apiUrl}/events/${eventId}/join`, {});
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
