import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { UserNavComponent } from '../../../shared/user-nav/user-nav.component';
import { Router } from '@angular/router';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

@Component({
  selector: 'app-home',
  imports: [UserFooterComponent, UserNavComponent, CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  plans: SubscriptionPlan[] = [];
  selectedPlan?: SubscriptionPlan;

  constructor(
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlans();
  }
  
  loadPlans() {
    this.plans = [
      {
        id: 'free',
        name: 'Free Plan',
        price: '₹0',
        description: 'Perfect for small events',
        features: [
          'Up to 250 Participants',
          'Email Communications',
          'Multiple Ticket Types',
          'Basic Support',
          'One-to-One Chat'
        ]
      },
      {
        id: 'premium',
        name: 'Premium Plan',
        price: '₹499/mo',
        description: 'For growing communities',
        features: [
          'Unlimited Participants',
          'Paid Event Creation',
          'Live Event Streaming',
          'No Platform Fee',
          'Full Refund Options',
          'Priority Support',
          'One-to-One Chat',
          'Event Based Chat'
        ]
      }
    ];
  }
  
  selectPlan(plan: SubscriptionPlan) {
    this.selectedPlan = plan;
  }
  
  subscribeToPlan(plan: SubscriptionPlan) {
    if (plan.id === 'premium') {
      this.router.navigate(['/premium/checkout']);
      return;
    }
    
    if (plan.id === 'free') {
      this.router.navigate(['/dashboard']);
    }
  }
}