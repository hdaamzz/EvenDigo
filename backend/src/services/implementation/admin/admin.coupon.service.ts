import { ICouponRepository } from '../../../../src/repositories/interfaces/ICoupon.repository';
import { ICoupon } from '../../../models/interfaces/coupon.interface';
import { ICouponAdminService } from '../../../../src/services/interfaces/ICoupon.admin.service';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CouponService implements ICouponAdminService{

    constructor(
        @inject("CouponRepository") private couponRepository: ICouponRepository,
    ) {}

    async getAllCoupons(): Promise<ICoupon[]> {
        return this.couponRepository.findAll();
    }
    async getAllCouponsWithPagination(page: number = 1, limit: number = 10): Promise<{coupons: ICoupon[], totalCount: number, hasMore: boolean}> {
        const result = await this.couponRepository.findAllCouponsPagination(page, limit);
        
        return {
            coupons: result.coupons,
            totalCount: result.totalCount,
            hasMore: result.hasMore
        };
    }

    async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
        const existingCoupon = await this.couponRepository.findCouponByCode(couponData.couponCode!);
        if (existingCoupon) {
            throw new Error('Coupon code already exists');
        }
        return this.couponRepository.createCoupon(couponData);
    }

    async updateCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return this.couponRepository.updateById(couponId, updateData);
    }

    async activateCoupon(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return this.couponRepository.updateById(couponId, { isActive: true });
    }

    async deactivateCoupon(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return this.couponRepository.updateById(couponId, { isActive: false });
    }

    async deleteCoupon(couponId: string): Promise<void> {
        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        await this.couponRepository.deleteById(couponId);
    }
}