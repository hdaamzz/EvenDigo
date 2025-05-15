import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, delay, tap } from 'rxjs/operators';

import Notiflix from 'notiflix';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../models/admin/subscription.interface';

export interface SubscriptionPlan {
  _id: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually';
  active?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) { }
  
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    return this.http.get<ApiResponse<SubscriptionPlan[]>>(`${this.baseUrl}admin/subscription-plans`).pipe(
      delay(700),
      catchError(error => this.handleApiError(error, 'fetch subscription plans'))
    );
  }
  
  getPlanById(id: string): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.baseUrl}admin/subscription-plans/${id}`).pipe(
      catchError(error => this.handleApiError(error, 'fetch plan details'))
    );
  }
  
  createPlan(plan: Omit<SubscriptionPlan, '_id'>): Observable<SubscriptionPlan> {
    Notiflix.Loading.circle('Creating plan...');
    
    return this.http.post<SubscriptionPlan>(`${this.baseUrl}admin/subscription-plans`, plan).pipe(
      delay(700),
      tap(() => Notiflix.Loading.remove()),
      catchError(error => this.handleApiError(error, 'create subscription plan'))
    );
  }
  
  updatePlan(plan: SubscriptionPlan): Observable<SubscriptionPlan> {
    Notiflix.Loading.circle('Updating plan...');
    
    return this.http.put<SubscriptionPlan>(`${this.baseUrl}admin/subscription-plans/${plan._id}`, plan).pipe(
      delay(700), 
      tap(() => Notiflix.Loading.remove()),
      catchError(error => this.handleApiError(error, 'update subscription plan'))
    );
  }
  
  togglePlanStatus(id: string, active: boolean): Observable<SubscriptionPlan> {
    Notiflix.Loading.circle(`${active ? 'Activating' : 'Deactivating'} plan...`);
    
    return this.http.put<SubscriptionPlan>(
      `${this.baseUrl}admin/subscription-plans/${id}`, 
      { active }, 
  
    ).pipe(
      delay(700),
      tap(() => Notiflix.Loading.remove()),
      catchError(error => this.handleApiError(error, `${active ? 'activate' : 'deactivate'} subscription plan`))
    );
  }

  deletePlan(id: string): Observable<any> {
    Notiflix.Loading.circle('Deleting plan...');
    
    return this.http.delete<any>(`${this.baseUrl}admin/subscription-plans/${id}`).pipe(
      delay(700),
      tap(() => Notiflix.Loading.remove()),
      catchError(error => this.handleApiError(error, 'delete subscription plan'))
    );
  }
  
  private handleApiError(error: HttpErrorResponse, operation: string): Observable<never> {
    Notiflix.Loading.remove();
    
    console.error(`Error during ${operation}:`, error);
    
    let errorMessage = `Failed to ${operation}`;
    
    if (error.status === 0) {
      errorMessage = 'Network error occurred. Please check your connection.';
    } else if (error.status === 401) {
      errorMessage = 'Unauthorized access. Please login again.';
    } else if (error.status === 403) {
      errorMessage = 'You do not have permission to perform this action.';
    } else if (error.status === 404) {
      errorMessage = 'The requested resource was not found.';
    } else if (error.status >= 500) {
      errorMessage = 'Server error occurred. Please try again later.';
    }
    
    Notiflix.Notify.failure(errorMessage);
    
    return throwError(() => new Error(errorMessage));
  }
}