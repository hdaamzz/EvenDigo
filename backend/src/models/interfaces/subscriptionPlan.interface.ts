import { Document } from "mongoose";

export interface ISubscriptionPlan extends Document {
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually' | null;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}