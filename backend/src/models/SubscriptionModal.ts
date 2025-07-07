import mongoose, { Schema } from 'mongoose';
import { ISubscription, SubscriptionStatus, SubscriptionType } from './interfaces/subscription.interface';

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