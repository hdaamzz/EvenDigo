import { ICoupon } from '../../models/interfaces/coupon.interface';
import { IBaseRepository } from '../IBase.repository';

export interface ICouponRepository extends IBaseRepository<ICoupon> {
    findByCode(couponCode: string): Promise<ICoupon | null>;
    findActiveCoupons(): Promise<ICoupon[]>;
    findExpiredCoupons(): Promise<ICoupon[]>;
    findByDiscountType(discountType: string): Promise<ICoupon[]>;
    findByUsageLimit(usageLimit: number): Promise<ICoupon[]>;
    findCouponsInDateRange(startDate: Date, endDate: Date): Promise<ICoupon[]>;
    
    findActiveCouponsPaginated(page?: number, limit?: number): Promise<{
        items: ICoupon[];
        totalCount: number;
        hasMore: boolean;
        currentPage: number;
        totalPages: number;
    }>;
}