
import { ICoupon } from "../../models/interfaces/coupon.interface";

export interface ICouponAdminService {
  getAllCoupons(): Promise<ICoupon[]>;
  getAllCouponsWithPagination(page: number, limit: number): Promise<{coupons: ICoupon[], totalCount: number, hasMore: boolean}> ;
  createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon>;
  updateCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  activateCoupon(couponId: string): Promise<ICoupon | null>;
  deactivateCoupon(couponId: string): Promise<ICoupon | null>;
  deleteCoupon(couponId: string): Promise<void>;
}
