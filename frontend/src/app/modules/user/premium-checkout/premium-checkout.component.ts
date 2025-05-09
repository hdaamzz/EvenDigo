import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { UserFooterComponent } from "../../../shared/user-footer/user-footer.component";
import { catchError, finalize, of, tap } from 'rxjs';
import Notiflix from 'notiflix';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { WalletService } from '../../../core/services/user/wallet/wallet.service';
import { IWallet } from '../../../core/models/wallet.interface';
import { PremiumService } from '../../../core/services/user/subscription/premium.service';

@Component({
  selector: 'app-premium-checkout',
  imports: [CommonModule, FormsModule, UserNavComponent, UserFooterComponent],
  templateUrl: './premium-checkout.component.html',
  styleUrl: './premium-checkout.component.css'
})
export class PremiumCheckoutComponent implements OnInit {
  wallet!: IWallet;
  selectedPaymentMethod: 'wallet' | 'card' = 'card';
  stripe!: Stripe | null;
  proceedLoading: boolean = false;
  isWalletLoading: boolean = true;
  errorMessage: string | null = null;
  planPrice: number = 499;
  planDetails = {
    name: 'Premium Plan',
    price: 499,
    billing: 'Monthly',
    features: [
      'Unlimited Participants',
      'Paid Event Creation',
      'Live Event Streaming',
      'No Platform Fee',
      'Full Refund Options',
      'Priority Support'
    ]
  };

  constructor(
    private router: Router,
    private walletService: WalletService,
    private premiumService: PremiumService
  ) { }

  async ngOnInit() {
    this.getUserWallet();
    await this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.stripe = await loadStripe(environment.stripePublishKey);
      if (!this.stripe) {
        this.errorMessage = 'Payment service unavailable. Please try again later.';
        Notiflix.Notify.failure(this.errorMessage);
      }
    } catch (error) {
      console.error('Stripe initialization error:', error);
      this.errorMessage = 'Payment service initialization failed.';
      Notiflix.Notify.failure(this.errorMessage);
    }
  }

  getUserWallet() {
    this.isWalletLoading = true;
    this.walletService.getWalletDetails().pipe(
      tap((response) => {
        if (response.data) {
          this.wallet = response.data;
        } else {
          throw new Error('Wallet data not available');
        }
      }),
      catchError((error) => {
        console.error('Error fetching wallet:', error);
        const errorMsg = error.error?.error || 'Error fetching wallet details';
        Notiflix.Notify.failure(errorMsg);
        return of(null);
      }),
      finalize(() => {
        this.isWalletLoading = false;
      })
    ).subscribe();
  }

  selectPaymentMethod(method: 'wallet' | 'card') {
    this.selectedPaymentMethod = method;
    this.errorMessage = null;
  }

  get hasInsufficientBalance(): boolean {
    return this.wallet && this.wallet.walletBalance < this.planPrice;
  }

  async completePurchase() {
    if (this.proceedLoading) return;
    this.proceedLoading = true;
    this.errorMessage = null;
    
    try {
      if (this.selectedPaymentMethod === 'wallet') {
        await this.processWalletPayment();
      } else {
        await this.processCardPayment();
      }
    } catch (error: any) {
      this.errorMessage = error.message || 'Payment processing failed. Please try again.';
      console.error('Payment error:', error);
      Notiflix.Notify.failure(`${this.errorMessage}`);
    } finally {
      this.proceedLoading = false;
    }
  }

  private async processWalletPayment() {
    if (this.hasInsufficientBalance) {
      throw new Error('Insufficient wallet balance. Please add funds or use a card.');
    }
    
    const payload = {
      planType: 'premium',
      amount: this.planPrice,
      successUrl: window.location.origin + '/premium/success',
      cancelUrl: window.location.origin + '/premium/checkout'
    };
    
    const response = await firstValueFrom(this.premiumService.processWalletUpgrade(payload));
    console.log(response);
    
    if (response.success) {
      this.router.navigate(['/premium/success'], { 
        queryParams: { 
          session_id: response.data?.stripeSessionId
        }
      });
      Notiflix.Notify.success('Premium plan activated successfully!');
    } else {
      throw new Error(response.error || 'Upgrade failed. Please try again.');
    }
  }

  private async processCardPayment() {
    if (!this.stripe) {
      throw new Error('Payment service not initialized. Please refresh the page.');
    }
    
    const payload = {
      planType: 'premium',
      amount: this.planPrice,
      successUrl: window.location.origin + '/payment/success',
      cancelUrl: window.location.origin + '/premium/checkout'
    };
    
    const response = await firstValueFrom(this.premiumService.createStripeSubscription(payload));
    
    if (!response.success || !response.data?.sessionId) {
      throw new Error(response.error || 'Failed to create payment session.');
    }
    
    const { error } = await this.stripe.redirectToCheckout({ 
      sessionId: response.data.sessionId 
    });
    
    if (error) {
      throw new Error(`Payment failed: ${error.message}`);
    }
  }
}