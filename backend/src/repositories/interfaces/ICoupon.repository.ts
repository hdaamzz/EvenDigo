import { ICoupon } from '../../models/interfaces/coupon.interface';
import { IBaseRepository } from '../IBase.repository';

export interface ICouponRepository extends IBaseRepository<ICoupon> {
  // Basic coupon queries
  findByCode(couponCode: string): Promise<ICoupon | null>;
  findActiveCoupons(): Promise<ICoupon[]>;
  findExpiredCoupons(): Promise<ICoupon[]>;
  findByDiscountType(discountType: string): Promise<ICoupon[]>;
  findByUsageLimit(usageLimit: number): Promise<ICoupon[]>;
  findCouponsInDateRange(startDate: Date, endDate: Date): Promise<ICoupon[]>;

  // Pagination methods
  findActiveCouponsPaginated(page?: number, limit?: number): Promise<{
    items: ICoupon[];
    totalCount: number;
    hasMore: boolean;
    currentPage: number;
    totalPages: number;
  }>;

  findAllCouponsPagination(page: number, limit: number, search: string): Promise<{
    coupons: ICoupon[];
    totalCount: number;
    hasMore: boolean;
}>

  // Alias methods for better readability
  findAllCoupons(): Promise<ICoupon[]>;
  findCouponById(couponId: string): Promise<ICoupon | null>;
  findCouponByCode(couponCode: string): Promise<ICoupon | null>;

  // CRUD operations
  createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon>;
  updateCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  deleteCoupon(couponId: string): Promise<boolean>;
}