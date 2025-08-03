import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface EventAnalytics {
  eventId: string;
  eventTitle: string;
  eventType: string;
  totalParticipants: number;
  totalRevenue: number;
  organizerRevenue: number;
  adminRevenue: number;
  adminPercentage: number;
  ticketBreakdown: Array<{
    type: string;
    soldTickets: number;
    totalTickets: number;
    revenue: number;
    price: number;
  }>;
  bookingStats: {
    totalBookings: number;
    successfulBookings: number;
    cancelledBookings: number;
  };
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
  }>;
  participantGrowth: Array<{
    date: string;
    count: number;
  }>;
  isDistributed: boolean;
  distributedAt?: Date;
}

export interface AnalyticsResponse {
  success: boolean;
  data: EventAnalytics;
  message?: string;
}

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
