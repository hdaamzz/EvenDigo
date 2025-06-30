import { CouponModel } from '../../../src/models/CouponModel';
import { ICoupon } from '../../models/interfaces/coupon.interface';
import { BaseRepository } from '../BaseRepository';
import { ICouponRepository } from '../interfaces/ICoupon.repository';
import { injectable } from 'tsyringe';

@injectable()
export class CouponRepository extends BaseRepository<ICoupon> implements ICouponRepository {
    constructor() {
        super(CouponModel);
    }

    async findByCode(couponCode: string): Promise<ICoupon | null> {
        return this.findOne({ couponCode });
    }

    async findActiveCoupons(): Promise<ICoupon[]> {
        const currentDate = new Date();
        return this.findMany({
            isActive: true,
            validFrom: { $lte: currentDate },
            validUntil: { $gte: currentDate }
        });
    }

    async findExpiredCoupons(): Promise<ICoupon[]> {
        const currentDate = new Date();
        return this.findMany({
            validUntil: { $lt: currentDate }
        });
    }

    async findByDiscountType(discountType: string): Promise<ICoupon[]> {
        return this.findMany({ discountType });
    }

    async findByUsageLimit(usageLimit: number): Promise<ICoupon[]> {
        return this.findMany({ usageLimit: { $lte: usageLimit } });
    }

    async findCouponsInDateRange(startDate: Date, endDate: Date): Promise<ICoupon[]> {
        return this.findMany({
            $or: [
                {
                    validFrom: { $gte: startDate, $lte: endDate }
                },
                {
                    validUntil: { $gte: startDate, $lte: endDate }
                },
                {
                    validFrom: { $lte: startDate },
                    validUntil: { $gte: endDate }
                }
            ]
        });
    }

    async findActiveCouponsPaginated(page: number = 1, limit: number = 10): Promise<{
        items: ICoupon[];
        totalCount: number;
        hasMore: boolean;
        currentPage: number;
        totalPages: number;
    }> {
        const currentDate = new Date();
        const filter = {
            isActive: true,
            validFrom: { $lte: currentDate },
            validUntil: { $gte: currentDate }
        };
        
        return this.findWithPagination(filter, page, limit);
    }

    async findAll(): Promise<ICoupon[]> {
        return super.findAll();
    }

    async findAllCoupons(): Promise<ICoupon[]> {
        return this.findAll();
    }

    async findAllCouponsPagination(page?: number, limit?: number): Promise<{
        coupons: ICoupon[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const result = await this.findAllPaginated(page, limit);
        return {
            coupons: result.items,
            totalCount: result.totalCount,
            hasMore: result.hasMore
        };
    }

    async findCouponById(couponId: string): Promise<ICoupon | null> {
        return this.findById(couponId);
    }

    async findCouponByCode(couponCode: string): Promise<ICoupon | null> {
        return this.findByCode(couponCode);
    }

    async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
        return this.create(couponData);
    }

    async updateCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        return this.update(couponId, updateData);
    }

    async deleteCoupon(couponId: string): Promise<void> {
        return this.delete(couponId);
    }
}