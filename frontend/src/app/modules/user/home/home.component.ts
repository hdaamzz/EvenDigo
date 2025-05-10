import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Router } from '@angular/router';
import { SubscriptionPlan, SubscriptionPlanService } from '../../../core/services/admin/subscription-plan/subscription-plan.service';
import { takeUntil } from 'rxjs';
import Notiflix from 'notiflix';
import { AuthService } from '../../../core/services/user/auth/auth.service';

@Component({
  selector: 'app-home',
  imports: [UserFooterComponent, UserNavComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  plans: SubscriptionPlan[] = [{
    _id: '',
    type: '',
    price: 0,
    description: '',
    features: []
  },{
    _id: '',
    type: '',
    price: 0,
    description: '',
    features: []
  }]
  selectedPlan?: SubscriptionPlan;

  constructor(
    private router: Router,
    private authService:AuthService,
  ) {}

  ngOnInit() {
    this.loadPlans();
  }
  
  loadPlans() {
    this.authService.getPlans()
          .subscribe({
            next: (response ) => {
              if(response.data){
                this.plans = response.data;
              }
            },
            error: (error) => {
              Notiflix.Notify.failure('Failed to load subscription plans');
              console.error('Error loading plans:', error);
            }
          });
  }
  
  selectPlan(plan: SubscriptionPlan) {
    this.selectedPlan = plan;
  }
  
  subscribeToPlan(plan: SubscriptionPlan) {
    if (plan.type === 'Premium') {
      this.router.navigate(['/premium/checkout'], { 
        queryParams: { 
          type: plan.type
        }
      });
      return;
    }
    
    if (plan.type === 'Basic') {
      this.router.navigate(['/dashboard']);
    }
  }
}