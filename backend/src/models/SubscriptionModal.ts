import mongoose, { Schema, Document } from 'mongoose';

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

const SubscriptionSchema = new Schema<ISubscription>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: Object.values(SubscriptionType),
    default: SubscriptionType.PREMIUM
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(SubscriptionStatus),
    default: SubscriptionStatus.PENDING
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  paymentMethod: {
    type: String,
    required: true
  },
  stripeSessionId: {
    type: String
  },
  stripeCustomerId: {
    type: String
  },
  stripeSubscriptionId: {
    type: String
  },
  cancelledAt: {
    type: Date
  }
}, {
  timestamps: true
});


export const SubscriptionModel = mongoose.model<ISubscription>('Subscription', SubscriptionSchema);