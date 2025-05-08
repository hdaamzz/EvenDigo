export interface SubscriptionPlan {
  _id: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually';
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError, delay,tap } from 'rxjs/operators';

import Notiflix from 'notiflix';
import { environment } from '../../../../environments/environment';
import { ApiResponse } from '../../../models/admin/subscription.interface';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {
  private baseUrl = environment.baseUrl;
  
  constructor(private http: HttpClient) { }
  
  getPlans(): Observable<ApiResponse<SubscriptionPlan[]>> {
    
    return this.http.get<ApiResponse<SubscriptionPlan[]>>(`${this.baseUrl}admin/subscription-plans`,{withCredentials:true}).pipe(
      delay(700),
      catchError(error => this.handleApiError(error, 'fetch subscription plans'))
    );
  }
  
  getPlanById(id: string): Observable<SubscriptionPlan> {
    return this.http.get<SubscriptionPlan>(`${this.baseUrl}admin/subscription-plans/${id}`,{withCredentials:true}).pipe(
      catchError(error => this.handleApiError(error, 'fetch plan details'))
    );
  }
  
  updatePlan(plan: SubscriptionPlan): Observable<SubscriptionPlan> {
    Notiflix.Loading.circle('Updating plan...');
    
    return this.http.put<SubscriptionPlan>(`${this.baseUrl}admin/subscription-plans/${plan._id}`, plan,{withCredentials:true}).pipe(
      delay(700), 
      tap(() => Notiflix.Loading.remove()),
      catchError(error => this.handleApiError(error, 'update subscription plan'))
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
    
    // if (operation === 'fetch subscription plans') {
    //   console.log('Using fallback plan data');
    //   return of(this.fallbackPlans) as any;
    // }
    
    return throwError(() => new Error(errorMessage));
  }
}