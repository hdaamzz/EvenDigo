import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, firstValueFrom, of, Subject, takeUntil, tap } from 'rxjs';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import Notiflix from 'notiflix';

import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { IEvent } from '../../../core/models/event.interface';
import { IWallet } from '../../../core/models/wallet.interface';
import { PayloadData } from '../../../core/models/booking.interface';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import { UserExploreService } from '../../../core/services/user/explore/user.explore.service';
import { AdminCouponService } from '../../../core/services/admin/coupon/admin-coupon.service';
import { WalletService } from '../../../core/services/user/wallet/wallet.service';
import { environment } from '../../../environments/environment';
import { Coupon, TicketData } from '../../../core/interfaces/user/checkout';


@Component({
  selector: 'app-user-checkout',
  imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './user-checkout.component.html',
  styleUrls: ['./user-checkout.component.css'],
  standalone: true
})
export class UserCheckoutComponent implements OnInit, OnDestroy {
  private readonly _destroy$ = new Subject<void>();
  
  public event!: IEvent;
  public wallet!: IWallet;
  public ticketData!: TicketData;
  public basePrice = 0;
  public convenienceFee = 40;
  public earlyBirdDiscount = 0;
  public walletCashback = 0;
  public couponCode = '';
  public selectedPaymentMethod: 'wallet' | 'card' | null = 'wallet';
  public couponsList: Coupon[] = [];
  public appliedCoupon: Coupon | null = null;
  public couponLoading = false;
  public proceedLoading = false;

  private _stripe: Stripe | null = null;

  constructor(
    private _router: Router,
    private _dashboardService: UserDashboardService,
    private _exploreService: UserExploreService,
    private _route: ActivatedRoute,
    private _couponService: AdminCouponService,
    private _walletService: WalletService
  ) {
    this._initTicketData();
  }

  public async ngOnInit(): Promise<void> {
    if (!this.ticketData) return;
  
    this.basePrice = this.ticketData.totalAmount ?? 0;
    this._loadCoupons();
    this._getUserWallet();
    await this._initStripe();
  }

  public ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  public selectPaymentMethod(method: 'wallet' | 'card'): void {
    this.selectedPaymentMethod = method;
    if (method === 'wallet') {
      this.walletCashback = 0;
    }
  }

  public getTicketBreakdown(): { type: string, count: number }[] {
    return Object.entries(this.ticketData?.tickets || {})
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }));
  }

  public applyCoupon(): void {
    if (!this.couponCode.trim()) {
      Notiflix.Notify.warning('Please enter a coupon code');
      return;
    }

    const coupon = this.couponsList.find(c => 
      c.code.toUpperCase() === this.couponCode.toUpperCase());
      
    if (coupon && this._canApplyCoupon(coupon)) {
      this.appliedCoupon = coupon;
      Notiflix.Notify.success(`Coupon "${coupon.code}" applied successfully`);
    } else {
      Notiflix.Notify.failure('Invalid or unavailable coupon code');
      this.couponCode = '';
    }
  }

  public getTicketCount(): number {
    if (!this.ticketData?.tickets) return 0;
    return Object.values(this.ticketData.tickets).reduce(
      (sum, count) => sum + (count as number), 0);
  }

  public applyCouponFromList(coupon: Coupon): void {
    if (this._canApplyCoupon(coupon)) {
      this.appliedCoupon = coupon;
      this.couponCode = coupon.code;
      Notiflix.Notify.success(`Coupon "${coupon.code}" applied successfully`);
    }
  }

  public removeCoupon(): void {
    this.appliedCoupon = null;
    this.couponCode = '';
    Notiflix.Notify.info('Coupon removed');
  }

  public calculateTotal(): number {
    let total = this.basePrice + this.convenienceFee - 
                this.earlyBirdDiscount - this.walletCashback;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.discountType === 'percentage') {
        const discount = (total * this.appliedCoupon.discount) / 100;
        total -= discount;
      } else {
        total -= this.appliedCoupon.discount;
      }
    }
    
    return Math.max(total, 0);
  }

  public getCouponDiscount(): number {
    if (!this.appliedCoupon) return 0;

    const subtotal = this.basePrice + this.convenienceFee - 
                    this.earlyBirdDiscount - this.walletCashback;
                    
    if (this.appliedCoupon.discountType === 'percentage') {
      return (subtotal * this.appliedCoupon.discount) / 100;
    }
    
    return this.appliedCoupon.discount;
  }

  public async completePurchase(): Promise<void> {
    this.proceedLoading = true;
    
    if (!this._stripe) {
      Notiflix.Notify.failure('Payment service not initialized. Please refresh the page.');
      this.proceedLoading = false;
      return;
    }
    
    const payload: PayloadData = this._createPayloadData();
  
    try {
      if (this.selectedPaymentMethod === 'wallet') {
        this._handleWalletPayment(payload);
      } else {
        await this._handleCardPayment(payload);
      }
    } catch (error: any) {
      this.proceedLoading = false;
      console.error('Error during checkout:', error);
      Notiflix.Notify.failure(`Checkout failed: ${error.message || 'Please try again.'}`);
    }
  }

  private _initTicketData(): void {
    try {
      const queryParams = this._route.snapshot.queryParams;
      
      if (!queryParams['eventId'] || !queryParams['tickets']) {
        console.error('Missing required query parameters');
        this._router.navigate(['/']);
        return;
      }

      this.ticketData = {
        eventId: queryParams['eventId'],
        tickets: JSON.parse(queryParams['tickets']),
        totalAmount: parseFloat(queryParams['totalAmount']) || 0,
        eventTitle: queryParams['eventTitle'] || ''
      };

      if (!this.ticketData.eventId || !this.ticketData.tickets) {
        console.error('Invalid ticket data from query params');
        this._router.navigate(['/']);
        return;
      }

      this._showEventDetails(this.ticketData.eventId);
    } catch (error) {
      console.error('Error parsing query parameters:', error);
      Notiflix.Notify.failure('Invalid ticket data. Please select tickets again.');
      this._router.navigate(['/']);
    }
  }

  private _showEventDetails(eventId: string): void {
    this._dashboardService.getEventById(eventId)
      .pipe(
        takeUntil(this._destroy$),
        tap((response) => {
          if (response.data) {
            this.event = response.data;
          }
        }),
        catchError((error) => {
          console.error('Error fetching event:', error);
          Notiflix.Notify.failure('Error fetching event details');
          return of(null);
        })
      )
      .subscribe();
  }

  private _getUserWallet(): void {
    this._walletService.getWalletDetails()
      .pipe(
        takeUntil(this._destroy$),
        tap((response) => {
          if (response.data) {
            this.wallet = response.data;
          }
        }),
        catchError((error) => {
          console.error('Error fetching wallet:', error);
          Notiflix.Notify.failure('Error fetching wallet details');
          return of(null);
        })
      )
      .subscribe();
  }

  private async _initStripe(): Promise<void> {
    try {
      this._stripe = await loadStripe(environment.stripePublishKey);
      if (!this._stripe) {
        Notiflix.Notify.failure('Payment service unavailable. Please try again later.');
      }
    } catch (error) {
      console.error('Failed to initialize Stripe:', error);
      Notiflix.Notify.failure('Payment service unavailable. Please try again later.');
    }
  }

  private _loadCoupons(): void {
    this.couponLoading = true;
    this._couponService.getCoupons()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (coupons) => {
          this.couponsList = this._processCoupons(coupons);
          this.couponLoading = false;
        },
        error: (err) => {
          console.error('Error loading coupons:', err);
          Notiflix.Notify.failure('Failed to load coupons');
          this.couponLoading = false;
        }
      });
  }

  private _processCoupons(coupons: any[]): Coupon[] {
    const currentDate = new Date();
    
    return coupons
      .filter(coupon => 
        coupon.isActive && 
        (!coupon.expiryDate || new Date(coupon.expiryDate) > currentDate)
      )
      .map(coupon => ({
        _id: coupon._id,
        code: coupon.couponCode,
        description: coupon.description,
        discount: coupon.discount,
        discountType: coupon.discountType,
        minAmount: coupon.minAmount || 0,
        maxUses: coupon.maxUses || 'Unlimited',
        usageCount: coupon.currentUses || 0,
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate) : null,
        status: coupon.isActive ? 'active' : 'inactive'
      }));
  }

  private _canApplyCoupon(coupon: Coupon): boolean {
    if (typeof coupon.maxUses === 'number' && coupon.usageCount >= coupon.maxUses) {
      Notiflix.Notify.failure(`Coupon "${coupon.code}" has reached its usage limit`);
      return false;
    }
    
    if (coupon.minAmount > this.calculateTotal()) { 
      Notiflix.Notify.warning(
        `Minimum amount of $${coupon.minAmount} required to apply "${coupon.code}"`);
      return false;
    }
    
    return true;
  }

  private _createPayloadData(): PayloadData {
    return {
      eventId: this.ticketData.eventId,
      tickets: this.ticketData.tickets,
      amount: this.calculateTotal(),
      successUrl: window.location.origin + '/payment/success',
      cancelUrl: window.location.origin + '/checkout',
      paymentMethod: this.selectedPaymentMethod,
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : '',
      discount: this.appliedCoupon ? this.getCouponDiscount() : 0,
    };
  }

  private _handleWalletPayment(payload: PayloadData): void {
    this._exploreService.createWalletCheckout(payload)
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (response) => {
          this.proceedLoading = false;
          
          if (response.success) {
            this._router.navigate(['/payment/success'], { 
              queryParams: { 
                session_id: response.data.stripeSessionId 
              }
            });
            Notiflix.Notify.success('Payment successful! Your booking is confirmed.');
          } else {
            Notiflix.Notify.failure(response.error || 'Payment failed. Please try again.');
          }
        },
        error: (error) => {
          this.proceedLoading = false;
          console.error('Wallet payment error:', error);
          Notiflix.Notify.failure(error.error?.error || 'Payment failed. Please try again.');
        }
      });
  }

  private async _handleCardPayment(payload: PayloadData): Promise<void> {
    try {
      const response = await firstValueFrom(
        this._exploreService.createStripeCheckoutSession(payload)
      );

      const sessionId = response.data.sessionId;
      this.proceedLoading = false;
      
      if (!this._stripe) {
        throw new Error('Stripe not initialized');
      }

      const { error } = await this._stripe.redirectToCheckout({ sessionId });
      if (error) {
        console.error('Stripe Checkout error:', error.message);
        Notiflix.Notify.failure(`Payment failed: ${error.message}`);
      }
    } catch (error: any) {
      this.proceedLoading = false;
      throw error;
    }
  }
}