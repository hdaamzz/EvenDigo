export interface PlanFeature {
  id: string;
  name: string;
  selected: boolean;
}
export interface SubscriptionPlan {
  _id: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually';
  active?: boolean;
}