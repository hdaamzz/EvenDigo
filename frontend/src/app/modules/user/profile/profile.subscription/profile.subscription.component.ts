import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, catchError, delay, finalize, of, takeUntil } from 'rxjs';
import { 
  PremiumService
} from '../../../../core/services/user/subscription/premium.service';
import { 
  SubscriptionResponse, 
  SubscriptionType 
} from '../../../../core/interfaces/user/premium';
import { SubscriptionPlan } from '../../../../core/interfaces/admin/subscriptionPlan';

@Component({
  selector: 'app-profile-subscription',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './profile.subscription.component.html',
  styleUrl: './profile.subscription.component.css'
})
export class ProfileSubscriptionComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  subscription: SubscriptionResponse | null = null;
  isLoading = true;
  errorMessage: string | null = null;
  isCancelingSubscription = false;
  
  showCancelDialog = false;
  showPlanModal = false;
  
  subscriptionPlans: SubscriptionPlan[] = [];
  plansLoading = false;
  plansError: string | null = null;

  constructor(
    private _premiumService: PremiumService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionDetails();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadSubscriptionDetails(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this._premiumService.getCurrentSubscription()
      .pipe(
        takeUntil(this._destroy$),
        catchError(err => {
          this.errorMessage = err.message || 'Failed to load subscription details';
          return of({ success: false, data: null });
        }),
        finalize(() => this.isLoading = false)
      )
      .subscribe(response => {
        if (response.success && response.data) {
          this.subscription = response.data;
        }
      });
  }

  showPlanSelection(): void {
    this.showPlanModal = true;
    this.loadSubscriptionPlans();
  }

  hidePlanSelection(): void {
    this.showPlanModal = false;
    this.plansError = null;
  }

  loadSubscriptionPlans(): void {
    this.plansLoading = true;
    this.plansError = null;
    
    this._premiumService.getPlans()
      .pipe(
        takeUntil(this._destroy$),
        catchError(err => {
          this.plansError = err.message || 'Failed to load subscription plans';
          return of({ success: false, data: [] });
        }),
        finalize(() => this.plansLoading = false)
      )
      .subscribe(response => {
        if (response.success && response.data) {
          this.subscriptionPlans = response.data;
        }
      });
  }

  selectPlan(plan: SubscriptionPlan): void {
    this.hidePlanSelection();
    this.navigateToCheckout(plan.type);
  }

  showCancelConfirmation(): void {
    this.showCancelDialog = true;
  }

  hideCancelConfirmation(): void {
    this.showCancelDialog = false;
  }

  confirmCancelSubscription(): void {
    this.hideCancelConfirmation();
    this.cancelSubscription();
  }

  cancelSubscription(): void {
    if (!this.subscription) {
      return;
    }
    
    this.isCancelingSubscription = true;
    this.errorMessage = null;
    
    this._premiumService.cancelSubscription(this.subscription.subscriptionId)
      .pipe(
        takeUntil(this._destroy$),
        delay(1000), 
        catchError(err => {
          this.errorMessage = err.message || 'Failed to cancel subscription';
          return of({ success: false });
        }),
        finalize(() => this.isCancelingSubscription = false)
      )
      .subscribe(response => {
        if (response.success) {
          this.subscription = null; 
          this.loadSubscriptionDetails();
        }
      });
  }

  navigateToCheckout(planType: string): void {
    this._router.navigate(['/premium/checkout'], { 
      queryParams: { 
        type: planType.toLowerCase()
      }
    });
  }

  getFormattedSubscriptionType(): string {
    if (!this.subscription) return '';
    
    switch (this.subscription.type) {
      case SubscriptionType.PREMIUM:
        return 'Premium Plan';
      case SubscriptionType.STANDARD:
        return 'Standard Plan';
      default:
        return this._capitalizeFirstLetter(this.subscription.type as string);
    }
  }

  private _capitalizeFirstLetter(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  formatDate(date: Date | string): string {
    if (!date) return 'N/A';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getRemainingDays(): number {
    if (!this.subscription) return 0;
    
    const endDate = new Date(this.subscription.endDate);
    const today = new Date();
    
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }

  getProgressPercentage(): number {
    if (!this.subscription) return 0;
    
    const startDate = new Date(this.subscription.startDate);
    const endDate = new Date(this.subscription.endDate);
    const today = new Date();
    
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = today.getTime() - startDate.getTime();
    
    if (elapsed < 0) return 0;
    if (elapsed > totalDuration) return 100;
    
    return Math.floor((elapsed / totalDuration) * 100);
  }
}
