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
        return this.couponRepository.findAllCoupons();
    }

    async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
        // Add validation if needed (e.g., check if couponCode is unique)
        const existingCoupon = await this.couponRepository.findCouponByCode(couponData.couponCode!);
        if (existingCoupon) {
            throw new Error('Coupon code already exists');
        }
        return this.couponRepository.createCoupon(couponData);
    }

    async updateCoupon(couponId: string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findCouponById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return this.couponRepository.updateCoupon(couponId, updateData);
    }

    async activateCoupon(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findCouponById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return this.couponRepository.updateCoupon(couponId, { isActive: true });
    }

    async deactivateCoupon(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findCouponById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        return this.couponRepository.updateCoupon(couponId, { isActive: false });
    }

    async deleteCoupon(couponId: string): Promise<void> {
        const coupon = await this.couponRepository.findCouponById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }
        await this.couponRepository.deleteCoupon(couponId);
    }
}