
export interface SubscriptionPlan {
    id?: string;
    type:string;
    price: number;
    description: string;
    discountPercentage?:number;
    isPopular?:boolean;
    billingCycle?:string;
    features: string[];
  }
  
  export interface SubscriptionResponse {
    success: boolean;
    subscriptionId: string;
    message: string;
    expiresAt?: Date;
    planId: string;
  }
  
  export interface SubscriptionRequest {
    planId: string;
    paymentMethodId?: string; 
    couponCode?: string;
  }
  
  export enum SubscriptionStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    CANCELED = 'canceled',
    EXPIRED = 'expired'
  }
  
  export interface UserSubscription {
    id: string;
    userId: string;
    planId: string;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    autoRenew: boolean;
    paymentMethodId?: string;
    lastPaymentDate?: Date;
  }