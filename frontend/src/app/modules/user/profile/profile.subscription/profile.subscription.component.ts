import { Component, OnInit } from '@angular/core';
import { PremiumService, SubscriptionResponse, SubscriptionType } from '../../../../core/services/user/subscription/premium.service';
import { catchError, delay, of } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile.subscription',
  imports: [CommonModule],
  templateUrl: './profile.subscription.component.html',
  styleUrl: './profile.subscription.component.css'
})
export class ProfileSubscriptionComponent  implements OnInit {
  subscription: SubscriptionResponse | null = null;
  loading = true;
  error: string | null = null;
  cancelingSubscription = false;

  constructor(private premiumService: PremiumService,
    private router:Router
  ) {}

  ngOnInit(): void {
    this.loadSubscriptionDetails();
  }

  loadSubscriptionDetails(): void {
    this.loading = true;
    this.error = null;
    
    this.premiumService.getCurrentSubscription()
      .pipe(
        catchError(err => {
          this.error = err.message || 'Failed to load subscription details';
          return of({ success: false, data: null });
        })
      )
      .subscribe(response => {
        this.loading = false;
        if (response.success && response.data) {
          this.subscription = response.data;
        }
      });
  }

  cancelSubscription(): void {
    this.cancelingSubscription = true;
    setTimeout(()=>{
      if (!this.subscription) return;
      this.premiumService.cancelSubscription(this.subscription.subscriptionId)
      .pipe(delay(500),
        catchError(err => {
          this.error = err.message || 'Failed to cancel subscription';
          this.cancelingSubscription = false;
          return of({ success: false });
        })
      )
      .subscribe(response => {
        this.cancelingSubscription = false;
        if (response.success) {
          this.loadSubscriptionDetails();
        }
      });
    },2000);
    this.ngOnInit()
  }

  getFormattedSubscriptionType(): string {
    if (!this.subscription) return '';
    
    switch (this.subscription.type) {
      case SubscriptionType.PREMIUM:
        return 'Premium Plan';
      case SubscriptionType.STANDARD:
        return 'Standard Plan';
      default:
        return (this.subscription.type as string).charAt(0).toUpperCase() + (this.subscription.type as string).slice(1);
    }
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

  navigateToCheckout(){
    this.router.navigate(['/premium/checkout']);
  }
}
