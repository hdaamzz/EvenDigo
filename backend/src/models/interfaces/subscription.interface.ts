import { Document, Schema } from "mongoose";

export enum SubscriptionStatus {
  INACTIVE='inactive',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum SubscriptionType {
  PREMIUM = 'premium',
  STANDARD = 'standard'
}

export interface ISubscription extends Document {
  userId: Schema.Types.ObjectId | string;
  subscriptionId: string;
  type: SubscriptionType;
  amount: number;
  status: SubscriptionStatus;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  paymentMethod: string;
  stripeSessionId?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  cancelledAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}