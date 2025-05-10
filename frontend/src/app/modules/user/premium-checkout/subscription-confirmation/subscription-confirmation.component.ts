import { Component } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription } from '../../../../core/models/admin/subscription.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { UserNavComponent } from "../../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../../shared/user-footer/user-footer.component";
import { PremiumService } from '../../../../core/services/user/subscription/premium.service';

@Component({
  selector: 'app-subscription-confirmation',
  imports: [CommonModule, DatePipe, FontAwesomeModule, UserNavComponent, UserFooterComponent],
  templateUrl: './subscription-confirmation.component.html',
  styleUrl: './subscription-confirmation.component.css'
})
export class SubscriptionConfirmationComponent {
  subscription?: Subscription;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private premiumService:PremiumService
  ) {}
  // http://localhost:4200/premium/success?session_id=cs_test_a1oZ910BA4ec8L6wPbA5lI2Di2mQBN5eAQHhSqVZl7LXvTS7EdCdBkW2Gw
  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    
    
    if (sessionId) {
      this.premiumService.getSubscriptionBySessionId(sessionId).subscribe(
        (response) => {
          this.subscription = response.data;
        },
        (error) => {
          console.error("Error fetching booking details:", error);
          this.router.navigate(['/']);
        }
      );
    } else {
      this.router.navigate(['/']);
    }
  }
}
