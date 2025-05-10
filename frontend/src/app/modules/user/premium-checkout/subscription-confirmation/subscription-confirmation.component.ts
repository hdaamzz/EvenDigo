import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Subscription as AngularSubscription } from 'rxjs';
import { takeUntil, Subject } from 'rxjs';
import { Subscription } from '../../../../core/models/admin/subscription.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { UserNavComponent } from "../../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../../shared/user-footer/user-footer.component";
import { PremiumService } from '../../../../core/services/user/subscription/premium.service';

@Component({
  selector: 'app-subscription-confirmation',
  standalone: true,
  imports: [CommonModule, DatePipe, FontAwesomeModule, UserNavComponent, UserFooterComponent],
  templateUrl: './subscription-confirmation.component.html',
  styleUrl: './subscription-confirmation.component.css'
})
export class SubscriptionConfirmationComponent implements OnInit, OnDestroy {
  subscription?: Subscription;
  isLoading = true;
  error: string | null = null;
  
  private readonly _destroy$ = new Subject<void>();
  
  constructor(
    private readonly _router: Router,
    private readonly _route: ActivatedRoute,
    private readonly _premiumService: PremiumService
  ) {}
  
  ngOnInit(): void {
    this._fetchSubscriptionDetails();
  }
  
  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
  
  private _fetchSubscriptionDetails(): void {
    const sessionId = this._route.snapshot.queryParamMap.get('session_id');
    
    if (!sessionId) {
      this._router.navigate(['/']);
      return;
    }
    
    this._premiumService.getSubscriptionBySessionId(sessionId)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.subscription = response.data;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error fetching subscription details:', error);
          this.error = error.message || 'Failed to load subscription details';
          this.isLoading = false;
          this._router.navigate(['/']);
        }
      });
  }
}