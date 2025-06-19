export interface CreateSubscriptionPlanDto {
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually';
  active?: boolean;
}

export interface UpdateSubscriptionPlanDto {
  type?: string;
  price?: number;
  description?: string;
  features?: string[];
  isPopular?: boolean;
  discountPercentage?: number;
  billingCycle?: 'monthly' | 'annually';
  active?: boolean;
}

export interface SubscriptionPlanResponseDto {
  _id: string;
  type: string;
  price: number;
  description: string;
  features: string[];
  isPopular: boolean;
  discountPercentage?: number;
  billingCycle: 'monthly' | 'annually';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// DTO Mapper class
export class SubscriptionPlanMapper {
  static toResponseDto(plan: any): SubscriptionPlanResponseDto {
    return {
      _id: plan._id,
      type: plan.type,
      price: plan.price,
      description: plan.description,
      features: plan.features,
      isPopular: plan.isPopular || false,
      discountPercentage: plan.discountPercentage,
      billingCycle: plan.billingCycle || 'monthly',
      active: plan.active,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt
    };
  }

  static toResponseDtoArray(plans: any[]): SubscriptionPlanResponseDto[] {
    return plans.map(plan => this.toResponseDto(plan));
  }
}