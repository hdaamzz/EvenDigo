import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
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
  plans: SubscriptionPlan[] = [];
  selectedPlan?: SubscriptionPlan;
  
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
    this._authService.getPlans()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.plans = response.data;
          }
        },
        error: (error) => {
          Notiflix.Notify.failure('Failed to load subscription plans');
          console.error('Error loading plans:', error);
        }
      });
  }
  
  selectPlan(plan: SubscriptionPlan): void {
    this.selectedPlan = plan;
  }
  
  subscribeToPlan(plan: SubscriptionPlan): void {
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
}