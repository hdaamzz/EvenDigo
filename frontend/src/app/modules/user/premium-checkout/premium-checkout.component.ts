import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { catchError, finalize, Observable, of, Subject, takeUntil, tap } from 'rxjs';
import Notiflix from 'notiflix';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { WalletService } from '../../../core/services/user/wallet/wallet.service';
import { IWallet } from '../../../core/models/wallet.interface';
import { PremiumService } from '../../../core/services/user/subscription/premium.service';
import { SubscriptionPlan } from '../../../core/models/subscription.interface';

type PaymentMethod = 'wallet' | 'card';

@Component({
  selector: 'app-premium-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, UserNavComponent, UserFooterComponent],
  templateUrl: './premium-checkout.component.html',
  styleUrl: './premium-checkout.component.css'
})
export class PremiumCheckoutComponent implements OnInit, OnDestroy {
  // Public properties
  wallet!: IWallet;
  selectedPaymentMethod: PaymentMethod = 'card';
  proceedLoading = false;
  isWalletLoading = true;
  errorMessage: string | null = null;
  planDetails: SubscriptionPlan = {
    id: '',
    price: 0,
    description: '',
    discountPercentage: 0,
    isPopular: false,
    billingCycle: '',
    features: []
  };

  // Private properties
  private _stripe: Stripe | null = null;
  private _destroy$ = new Subject<void>();

  constructor(
    private _router: Router,
    private _walletService: WalletService,
    private _premiumService: PremiumService,
    private _route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this._loadPlanDetails();
    this._loadWalletDetails();
    this._initializeStripe();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  selectPaymentMethod(method: PaymentMethod): void {
    this.selectedPaymentMethod = method;
    this.errorMessage = null;
  }

  get hasInsufficientBalance(): boolean {
    return this.wallet && this.wallet.walletBalance < this.planDetails.price;
  }

  async completePurchase(): Promise<void> {
    if (this.proceedLoading) return;
    
    this.proceedLoading = true;
    this.errorMessage = null;
    
    try {
      if (this.selectedPaymentMethod === 'wallet') {
        await this._processWalletPayment();
      } else {
        await this._processCardPayment();
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Payment processing failed. Please try again.';
      console.error('Payment error:', error);
      Notiflix.Notify.failure(this.errorMessage ?? 'An error occurred');
    } finally {
      this.proceedLoading = false;
    }
  }

  private async _initializeStripe(): Promise<void> {
    try {
      this._stripe = await loadStripe(environment.stripePublishKey);
      if (!this._stripe) {
        this.errorMessage = 'Payment service unavailable. Please try again later.';
        Notiflix.Notify.failure(this.errorMessage);
      }
    } catch (error) {
      console.error('Stripe initialization error:', error);
      this.errorMessage = 'Payment service initialization failed.';
      Notiflix.Notify.failure(this.errorMessage);
    }
  }

  private _loadWalletDetails(): void {
    this.isWalletLoading = true;
    
    this._walletService.getWalletDetails()
      .pipe(
        takeUntil(this._destroy$),
        tap(response => {
          if (response.data) {
            this.wallet = response.data;
          } else {
            throw new Error('Wallet data not available');
          }
        }),
        catchError(error => {
          console.error('Error fetching wallet:', error);
          const errorMsg = error.error?.error || 'Error fetching wallet details';
          Notiflix.Notify.failure(errorMsg);
          return of(null);
        }),
        finalize(() => {
          this.isWalletLoading = false;
        })
      )
      .subscribe();
  }

  private _loadPlanDetails(): void {
    this.isWalletLoading = true;
    const planType = this._route.snapshot.queryParamMap.get('type');
    
    if (planType) {
      this._premiumService.getSubscriptionByType(planType)
        .pipe(
          takeUntil(this._destroy$),
          tap(response => {
            if (response.data) {
              this.planDetails = response.data;
            }
          }),
          catchError(error => {
            console.error("Error fetching subscription details:", error);
            this._router.navigate(['/']);
            return of(null);
          }),
          finalize(() => {
            this.isWalletLoading = false;
          })
        )
        .subscribe();
    }
  }

  private async _processWalletPayment(): Promise<void> {
    if (this.hasInsufficientBalance) {
      throw new Error('Insufficient wallet balance. Please add funds or use a card.');
    }
    
    const payload = {
      planType: 'premium',
      amount: this.planDetails.price,
      successUrl: `${window.location.origin}/premium/success`,
      cancelUrl: `${window.location.origin}/premium/checkout`
    };
    
    const response = await firstValueFrom(this._premiumService.processWalletUpgrade(payload));
    
    if (response.success) {
      this._router.navigate(['/premium/success'], { 
        queryParams: { 
          session_id: response.data?.stripeSessionId
        }
      });
      Notiflix.Notify.success('Premium plan activated successfully!');
    } else {
      throw new Error(response.error || 'Upgrade failed. Please try again.');
    }
  }

  private async _processCardPayment(): Promise<void> {
    if (!this._stripe) {
      throw new Error('Payment service not initialized. Please refresh the page.');
    }
    
    const payload = {
      planType: 'premium',
      amount: this.planDetails.price,
      successUrl: `${window.location.origin}/payment/success`,
      cancelUrl: `${window.location.origin}/premium/checkout`
    };
    
    const response = await firstValueFrom(this._premiumService.createStripeSubscription(payload));
    
    if (!response.success || !response.data?.sessionId) {
      throw new Error(response.error || 'Failed to create payment session.');
    }
    
    const { error } = await this._stripe.redirectToCheckout({ 
      sessionId: response.data.sessionId 
    });
    
    if (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}