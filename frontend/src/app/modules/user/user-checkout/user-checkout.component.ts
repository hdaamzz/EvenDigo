import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserNavComponent } from "../../../shared/user-nav/user-nav.component";
import { Router } from '@angular/router';
import { IEvent } from '../../../core/models/event.interface';
import { UserDashboardService } from '../../../core/services/user/dashboard/user.dashboard.service';
import { UserExploreService } from '../../../core/services/user/explore/user.explore.service';
import { catchError, of, tap } from 'rxjs';
import Notiflix from 'notiflix';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import { AdminCouponService } from '../../../core/services/admin/admin-coupon.service';
import { PayloadData } from '../../../core/models/booking.interface';
import { WalletService } from '../../../core/services/user/wallet/wallet.service';
import { IWallet } from '../../../core/models/wallet.interface';

interface TicketData {
  eventId: string;
  tickets: { [type: string]: number };
  totalAmount: number;
}

@Component({
  selector: 'app-user-checkout',
  imports: [CommonModule, FormsModule, UserNavComponent],
  templateUrl: './user-checkout.component.html',
  styleUrls: ['./user-checkout.component.css']
})
export class UserCheckoutComponent implements OnInit {
  event!: IEvent;
  wallet!:IWallet;
  ticketData!: TicketData;
  basePrice: number = 0;
  convenienceFee: number = 40;
  earlyBirdDiscount: number = 0;
  walletCashback: number = 0;
  couponCode: string = '';
  selectedPaymentMethod: 'wallet' | 'card' | null = 'wallet';
  stripe!: Stripe | null;
  couponsList:any[]=[];
  appliedCoupon: any = null;
  couponLoading=false
  proceedLoading:boolean=false

  constructor(
    private router: Router,
    private dashboardService: UserDashboardService,
    private exploreService: UserExploreService,
    private couponService: AdminCouponService,
    private walletService:WalletService
  ) {
    const ticketState = history?.state?.ticketData;
    if (!ticketState || !ticketState.eventId) {
      this.router.navigate(['/']);
      return;
    }
  
    this.ticketData = ticketState;
    this.showEventDetails(this.ticketData.eventId);
  }

  async ngOnInit() {
    if (!this.ticketData) return;
  
    this.basePrice = this.ticketData.totalAmount ?? 0;
    this.loadCoupons();
    this.getUserWallet();
    this.stripe = await loadStripe(environment.stripePublishKey);
    if (!this.stripe) {
      Notiflix.Notify.failure('Payment service unavailable. Please try again later.');
    }
  }

  getUserWallet(){
    this.walletService.getWalletDetails().pipe(
      tap((response) =>{
        if(response.data){
          this.wallet = response.data
        }
      }    
    ),
      catchError((error) => {
        console.error('Error fetching event:', error);
        Notiflix.Notify.failure('Error fetching event details');
        return of(null);
      })
    ).subscribe();
  }

  showEventDetails(eventId: string) {
    this.dashboardService.getEventById(eventId).pipe(
      tap((response) =>{
        if(response.data){
          this.event = response.data
        }
      }    
    ),
      catchError((error) => {
        console.error('Error fetching event:', error);
        Notiflix.Notify.failure('Error fetching event details');
        return of(null);
      })
    ).subscribe();
  }

  selectPaymentMethod(method: 'wallet' | 'card') {
    this.selectedPaymentMethod = method;
    if (method === 'wallet') {
      this.walletCashback = 0;
    }
  }

  getTicketBreakdown(): { type: string, count: number }[] {
    return Object.entries(this.ticketData?.tickets)
      .filter(([_, count]) => count > 0)
      .map(([type, count]) => ({ type, count }));
  }

  loadCoupons() {
    this.couponLoading = true;
    this.couponService.getCoupons().subscribe({
      next: (coupons) => {
        console.log(coupons);
        
        this.couponsList = coupons
          .filter(coupon => coupon.isActive && (!coupon.expiryDate || new Date(coupon.expiryDate) > new Date())) 
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
        this.couponLoading = false;
      },
      error: (err) => {
        console.error('Error loading coupons:', err);
        Notiflix.Notify.failure('Failed to load coupons');
        this.couponLoading = false;
      }
    });
  }
  applyCoupon() {
    if (!this.couponCode.trim()) {
      Notiflix.Notify.warning('Please enter a coupon code');
      return;
    }

    const coupon = this.couponsList.find(c => c.code.toUpperCase() === this.couponCode.toUpperCase());
    if (coupon && this.canApplyCoupon(coupon)) {
      this.appliedCoupon = coupon;
      Notiflix.Notify.success(`Coupon "${coupon.code}" applied successfully`);
    } else {
      Notiflix.Notify.failure('Invalid or unavailable coupon code');
      this.couponCode = '';
    }
  }

  getTicketCount(): number {
    if (!this.ticketData || !this.ticketData.tickets) return 0;
    return Object.values(this.ticketData.tickets).reduce((sum, count) => sum + (count as number), 0);
  }
  

  applyCouponFromList(coupon: any) {
    if (this.canApplyCoupon(coupon)) {
      this.appliedCoupon = coupon;
      this.couponCode = coupon.code;
      Notiflix.Notify.success(`Coupon "${coupon.code}" applied successfully`);
    }
  }
  removeCoupon() {
    this.appliedCoupon = null;
    this.couponCode = '';
    Notiflix.Notify.info('Coupon removed');
  }

  calculateTotal(): number {
    let total = this.basePrice + this.convenienceFee - this.earlyBirdDiscount - this.walletCashback;

  
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

  async completePurchase() {
    this.proceedLoading=true
    if (!this.stripe) {
      Notiflix.Notify.failure('Payment service not initialized. Please refresh the page.');
      return;
    }
    
    const payload:PayloadData = {
      eventId: this.ticketData.eventId,
      tickets: this.ticketData.tickets,
      amount: this.calculateTotal(),
      successUrl: window.location.origin + '/payment/success',
      cancelUrl: window.location.origin + '/checkout',
      paymentMethod: this.selectedPaymentMethod,
      couponCode: this.appliedCoupon ? this.appliedCoupon.code : null,
      discount: this.appliedCoupon ? this.getCouponDiscount() : 0,
    };
  
    try {
      if (this.selectedPaymentMethod === 'wallet') {
        this.exploreService.createWalletCheckout(payload).subscribe(
          (response) => {
            this.proceedLoading = false;
            
            if (response.success) {
              // Navigate to success page with booking data
              this.router.navigate(['/payment/success'], { 
                queryParams: { 
                  booking_id: response.data.bookingId 
                }
              });
              Notiflix.Notify.success('Payment successful! Your booking is confirmed.');
            } else {
              Notiflix.Notify.failure(response.error || 'Payment failed. Please try again.');
            }
          },
          (error) => {
            this.proceedLoading = false;
            console.error('Wallet payment error:', error);
            Notiflix.Notify.failure(error.error?.error || 'Payment failed. Please try again.');
          }
        );

      } else {
        const response = await firstValueFrom(this.exploreService.createStripeCheckoutSession(payload));

        const sessionId = response.data.sessionId;
        this.proceedLoading=false
        console.log('Stripe Session ID:', sessionId);
  
        const { error } = await this.stripe.redirectToCheckout({ sessionId });
        if (error) {
          console.error('Stripe Checkout error:', error.message);
          Notiflix.Notify.failure(`Payment failed: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error('Error during checkout:', error);
      Notiflix.Notify.failure(`Checkout failed: ${error.message || 'Please try again.'}`);
    }
  }

  

  private canApplyCoupon(coupon: any): boolean {
    if (coupon.usageCount >= coupon.maxUses && coupon.maxUses !== 'Unlimited') {
      Notiflix.Notify.failure(`Coupon "${coupon.code}" has reached its usage limit`);
      return false;
    }
    if (coupon.minAmount > this.calculateTotal()) { 
      Notiflix.Notify.warning(`Minimum amount of $${coupon.minAmount} required to apply "${coupon.code}"`);
      return false;
    }
    return true;
  }
  getCouponDiscount(): number {
    if (!this.appliedCoupon) return 0;

    const subtotal = this.basePrice + this.convenienceFee - this.earlyBirdDiscount - this.walletCashback;
    if (this.appliedCoupon.discountType === 'percentage') {
      return (subtotal * this.appliedCoupon.discount) / 100;
    }
    return this.appliedCoupon.discount;
  }
}