/**
 * Interface for API pagination data
 */
export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

/**
 * Interface for coupon data
 */
export interface ICoupon {
  _id?: string;
  couponCode: string;
  discountType: 'percentage' | 'fixed_amount';
  discount: number;
  minAmount: number;
  maxUses: number | null;
  currentUses?: number;
  expiryDate: Date | string;
  description: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for single coupon API response
 */
export interface CouponResponse {
  success: boolean;
  message: string;
  data: ICoupon;
}

/**
 * Interface for multiple coupons API response with pagination
 */
export interface AllCouponResponse {
  success: boolean;
  message: string;
  data: ICoupon[];
  pagination?: PaginationData;
}