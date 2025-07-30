import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Router } from '@angular/router';
import { Subject, takeUntil, delay, Subscription } from 'rxjs';
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
  private readonly destroy$ = new Subject<void>();

  // UI State
  isLoading = true;
  isInitialLoad = true;

  // Data
  plans: SubscriptionPlan[] = [];
  selectedPlan?: SubscriptionPlan;

  // For skeleton loading
  readonly skeletonPlans = Array(2);

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPlans();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadPlans(): void {
    this.isLoading = true;
    this.authService.getPlans()
      .pipe(
        takeUntil(this.destroy$),
        delay(this.isInitialLoad ? 800 : 300)
      )
      .subscribe({
        next: ({ data }) => {
          this.plans = data ?? [];
          this.onLoadComplete();
        },
        error: (error) => {
          this.onLoadComplete();
          Notiflix.Notify.failure('Failed to load subscription plans');
          console.error('[HomeComponent] Error loading plans: ', error);
        }
      });
  }

  private onLoadComplete(): void {
    this.isLoading = false;
    this.isInitialLoad = false;
  }

  selectPlan(plan: SubscriptionPlan): void {
    if (!this.isLoading) {
      this.selectedPlan = plan;
    }
  }

  subscribeToPlan(plan: SubscriptionPlan): void {
    if (this.isLoading) return;
    this.router.navigate(['/premium/checkout'], { queryParams: { type: plan.type } });
  }

  retryLoadPlans(): void {
    if (!this.isLoading) {
      this.loadPlans();
    }
  }

  trackByPlan(_index: number, plan: SubscriptionPlan): string | undefined {
    return plan.type;
  }
}
