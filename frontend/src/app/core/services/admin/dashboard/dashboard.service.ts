// src/core/services/admin/dashboard/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import Notiflix from 'notiflix';

export interface StatCard {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

export interface Transaction {
  type: string;
  amount: string;
  icon: string;
  isPositive: boolean;
  timestamp: string;
  description: string;
}

export interface Subscription {
  name: string;
  users: number;
  percentage: number;
  icon: string;
  planId: string;
}

export interface Activity {
  title: string;
  timeAgo: string;
  icon: string;
  userId?: string;
  eventId?: string;
  activityType?: string;
  timestamp: string;
}

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  organizer: {
    id: string;
    name: string;
    image: string;
  };
  ticketsSold: number;
  image: string;
}

export interface DashboardStats {
  totalCustomers: number;
  customerGrowth: number;
  activeEvents: number;
  eventGrowth: number;
  totalRevenue: number;
  revenueGrowth: number;
  ticketsSold: number;
  ticketsGrowth: number;
}

export interface NewCounts {
  newSubscriptions: number;
  newActivities: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  
  private readonly _apiUrl = `${environment.apiUrl}admin/dashboard`;


  constructor(private _http: HttpClient) {}

  getStatCards(): Observable<ApiResponse<StatCard[]>> {
    return this._http.get<ApiResponse<DashboardStats>>(`${this._apiUrl}/stats`).pipe(
      map((response) => {
        if (response.success) {
          const stats = response.data;
          const statCards: StatCard[] = [
            {
              title: 'Total Customers',
              value: stats.totalCustomers.toLocaleString(),
              change: `${Math.abs(stats.customerGrowth)}% this month`,
              isPositive: stats.customerGrowth >= 0,
              icon: 'fas fa-users',
            },
            {
              title: 'Active Events',
              value: stats.activeEvents.toLocaleString(),
              change: `${Math.abs(stats.eventGrowth)}% this month`,
              isPositive: stats.eventGrowth >= 0,
              icon: 'fas fa-calendar-alt',
            },
            {
              title: 'Revenue',
              value: `₹${stats.totalRevenue.toLocaleString()}`,
              change: `${Math.abs(stats.revenueGrowth)}% this month`,
              isPositive: stats.revenueGrowth >= 0,
              icon: 'fas fa-money-bill-wave',
            },
            {
              title: 'Tickets Sold',
              value: stats.ticketsSold.toLocaleString(),
              change: `${Math.abs(stats.ticketsGrowth)}% this month`,
              isPositive: stats.ticketsGrowth >= 0,
              icon: 'fas fa-ticket-alt',
            },
          ];
          return { success: true, data: statCards, message: response.message };
        }
        return response as unknown as ApiResponse<StatCard[]>;
      }),
      catchError(this._handleError)
    );
  }

  getRevenueData(period: string = 'monthly'): Observable<ApiResponse<ChartData>> {
    const params = new HttpParams().set('period', period);
    return this._http
      .get<ApiResponse<ChartData>>(`${this._apiUrl}/revenue-chart`, { params })
      .pipe(catchError(this._handleError));
  }

  getUserRegistrationStats(period: string = 'monthly'): Observable<ApiResponse<ChartData>> {
    const params = new HttpParams().set('period', period);
    return this._http
      .get<ApiResponse<ChartData>>(`${this._apiUrl}/user-registrations`, { params })
      .pipe(catchError(this._handleError));
  }

  getTransactions(limit: number = 5): Observable<ApiResponse<Transaction[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this._http
      .get<ApiResponse<Transaction[]>>(`${this._apiUrl}/transactions`, { params })
      .pipe(catchError(this._handleError));
  }

  getSubscriptions(): Observable<ApiResponse<Subscription[]>> {
    return this._http
      .get<ApiResponse<Subscription[]>>(`${this._apiUrl}/subscriptions`)
      .pipe(catchError(this._handleError));
  }

  getRecentActivities(limit: number = 5): Observable<ApiResponse<Activity[]>> {
    const params = new HttpParams().set('limit', limit.toString());
    return this._http
      .get<ApiResponse<Activity[]>>(`${this._apiUrl}/activities`, { params })
      .pipe(catchError(this._handleError));
  }

  private _handleError(error: HttpErrorResponse): Observable<ApiResponse<any>> {
    let errorMessage = 'An unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      errorMessage = error.error?.message || `Server Error: ${error.status} - ${error.statusText}`;
    }
    Notiflix.Notify.failure(errorMessage);
    return throwError(() => ({
      success: false,
      message: errorMessage,
      data: null,
    }));
  }
}