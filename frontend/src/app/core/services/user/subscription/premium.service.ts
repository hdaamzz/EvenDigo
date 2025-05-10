import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Subscription } from '../../../models/admin/subscription.interface';
import { SubscriptionPlan } from '../../admin/subscription-plan/subscription-plan.service';

export enum SubscriptionType {
  PREMIUM = 'premium',
  STANDARD = 'standard'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export interface PremiumSubscriptionPayload {
  planType: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StripeSessionResponse {
  sessionId: string;
}

export interface SubscriptionResponse {
  userId: string;
  subscriptionId: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  amount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentMethod: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PremiumService {
  private baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  createStripeSubscription(payload: PremiumSubscriptionPayload): Observable<ApiResponse<StripeSessionResponse>> {
    return this.http.post<ApiResponse<StripeSessionResponse>>(
      `${this.baseUrl}user/subscription/create-checkout`,
      payload,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  processWalletUpgrade(payload: PremiumSubscriptionPayload): Observable<ApiResponse<SubscriptionResponse>> {
    return this.http.post<ApiResponse<SubscriptionResponse>>(
      `${this.baseUrl}user/subscription/wallet-upgrade`,
      payload,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getCurrentSubscription(): Observable<ApiResponse<SubscriptionResponse>> {
    return this.http.get<ApiResponse<SubscriptionResponse>>(
      `${this.baseUrl}user/subscription/current`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  cancelSubscription(subscriptionId: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.baseUrl}user/subscription/cancel`,
      { subscriptionId },
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionBySessionId(sessionId: string): Observable<ApiResponse<Subscription>> {
    return this.http.get<ApiResponse<Subscription>>(
      `${this.baseUrl}user/subscription/confirm/${sessionId}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  getSubscriptionByType(type: string): Observable<ApiResponse<SubscriptionPlan>> {
    return this.http.get<ApiResponse<SubscriptionPlan>>(
      `${this.baseUrl}user/subscription/type/${type}`,
      { withCredentials: true }
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.error) {
        errorMessage = error.error.error;
      } else if (error.status) {
        switch (error.status) {
          case 401:
            errorMessage = 'Unauthorized. Please login again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to perform this action.';
            break;
          case 404:
            errorMessage = 'Requested resource not found.';
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = `Server error: ${error.status}`;
            break;
        }
      }
    }

    console.error('API Error:', error);

    return throwError(() => new Error(errorMessage));
  }
}