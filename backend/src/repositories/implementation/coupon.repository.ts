import { CouponModel } from '../../../src/models/CouponModel';
import { ICoupon } from '../../models/interfaces/coupon.interface';
import { Schema } from 'mongoose';
import { ICouponRepository } from '../interfaces/ICoupon.repository';
import { injectable } from 'tsyringe';

@injectable()
export class CouponRepository implements ICouponRepository{
    async findAllCoupons(): Promise<ICoupon[]> {
        return CouponModel.find({}).sort({ createdAt: -1 }).exec();
    }

    async findAllCouponsPagination(page: number = 1, limit: number = 10): Promise<{coupons: ICoupon[], totalCount: number, hasMore: boolean}> {
        const skip = (page - 1) * limit;
        
        const [coupons, totalCount] = await Promise.all([
            CouponModel.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            CouponModel.countDocuments({})
        ]);
        
        const hasMore = totalCount > (skip + coupons.length);
        
        return { coupons, totalCount, hasMore };
    }

    async findCouponById(couponId: Schema.Types.ObjectId | string): Promise<ICoupon | null> {
        return CouponModel.findById(couponId).exec();
    }

    async findCouponByCode(couponCode: string): Promise<ICoupon | null> {
        return CouponModel.findOne({ couponCode }).exec();
    }

    async createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon> {
        const coupon = new CouponModel(couponData);
        return coupon.save();
    }

    async updateCoupon(couponId: Schema.Types.ObjectId | string, updateData: Partial<ICoupon>): Promise<ICoupon | null> {
        return CouponModel.findByIdAndUpdate(
            couponId,
            { $set: updateData },
            { new: true }
        ).exec();
    }

    async deleteCoupon(couponId: Schema.Types.ObjectId | string): Promise<void> {
        await CouponModel.findByIdAndDelete(couponId).exec();
    }
}