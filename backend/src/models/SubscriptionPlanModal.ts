import { Schema, model } from 'mongoose';
import { ISubscriptionPlan } from './interfaces/subscriptionPlan.interface';


const SubscriptionPlanSchema: Schema = new Schema({
  type: {
    type: String,
    required: true,
    unique: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  features: {
    type: [String],
    required: true
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  discountPercentage: {
    type: Number
  },
  billingCycle: {
    type: String,
    enum: ['monthly', 'annually'],
    default: 'monthly'
  },
  active: {  
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const SubscriptionPlanModel = model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);