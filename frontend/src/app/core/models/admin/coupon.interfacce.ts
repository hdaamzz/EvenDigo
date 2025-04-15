export interface ICoupon {
    couponCode?: string;
    createdAt?: string;
    currentUses?: number;
    description: string;
    discount: number;
    discountType: 'percentage' | 'fixed_amount';
    expiryDate: string | Date;
    id?: string;
    isActive?: boolean;
    maxUses: number |null;
    minAmount: number;
    updatedAt?: string;
    status?:string
    // __v?: number;
    _id?: string;
  }

  export interface AllCouponResponse {
    success:boolean;
    data:ICoupon[];
    pagination?:{
      totalCount:number;
      totalPages:number;
      currentPage:number;
      hasMore:boolean
    }
  }
  export interface CouponResponse {
    success:boolean;
    data:ICoupon
  }