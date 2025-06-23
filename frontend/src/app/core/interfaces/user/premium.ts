export enum SubscriptionType {
  PREMIUM = 'premium',
  STANDARD = 'standard'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export interface PremiumSubscriptionPayload {
  planType: string;
  amount: number;
  successUrl: string;
  cancelUrl: string;
}
export type PaymentMethod = 'wallet' | 'card';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface StripeSessionResponse {
  sessionId: string;
}

export interface SubscriptionResponse {
  userId: string;
  subscriptionId: string;
  type: SubscriptionType;
  status: SubscriptionStatus;
  amount: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentMethod: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}