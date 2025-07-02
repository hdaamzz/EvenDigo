import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Router } from '@angular/router';
import { Subject, takeUntil, delay } from 'rxjs';
import Notiflix from 'notiflix';
import { AuthService } from '../../../core/services/user/auth/auth.service';
import { SubscriptionPlan } from '../../../core/interfaces/admin/subscriptionPlan';

@Component({
  selector: 'app-home',
  standalone: true, 
  imports: [UserFooterComponent, UserNavComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  // Loading states
  isLoading = true;
  isInitialLoad = true;
  
  // Data
  plans: SubscriptionPlan[] = [];
  selectedPlan?: SubscriptionPlan;
  
  // Skeleton data for better UX
  skeletonPlans = Array(2).fill(null);
  
  constructor(
    private _router: Router,
    private _authService: AuthService,
  ) {}

  ngOnInit(): void {
    this._loadPlans();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  private _loadPlans(): void {
    this.isLoading = true;
    
    this._authService.getPlans()
      .pipe(
        takeUntil(this._destroy$),
        // Add minimum loading time for better UX
        delay(this.isInitialLoad ? 800 : 300)
      )
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.plans = response.data;
          }
          this._handleLoadingComplete();
        },
        error: (error) => {
          this._handleLoadingComplete();
          Notiflix.Notify.failure('Failed to load subscription plans');
          console.error('Error loading plans:', error);
        }
      });
  }
  
  private _handleLoadingComplete(): void {
    this.isLoading = false;
    this.isInitialLoad = false;
  }
  
  selectPlan(plan: SubscriptionPlan): void {
    if (this.isLoading) return;
    this.selectedPlan = plan;
  }
  
  subscribeToPlan(plan: SubscriptionPlan): void {
    if (this.isLoading) return;
    
    if (plan.type === 'premium') {
      this._router.navigate(['/premium/checkout'], { 
        queryParams: { 
          type: plan.type
        }
      });
      return;
    }
    
    if (plan.type === 'basic') {
      this._router.navigate(['/premium/checkout'], { 
        queryParams: { 
          type: plan.type
        }
      });
      return;
    }
  }
  
  // Retry loading function
  retryLoadPlans(): void {
    if (!this.isLoading) {
      this._loadPlans();
    }
  }
  
  // TrackBy function for better performance
  trackByPlan(index: number, plan: SubscriptionPlan): any {
    return plan.type || index;
  }
}