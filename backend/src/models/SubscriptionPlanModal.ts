import { Schema, model } from 'mongoose';
import { Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually';
  createdAt?: Date;
  updatedAt?: Date;
}

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
  }
}, {
  timestamps: true
});

export const SubscriptionPlanModel = model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);