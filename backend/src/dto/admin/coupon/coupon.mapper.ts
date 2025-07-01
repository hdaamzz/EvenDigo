import { ICoupon } from '../../../models/interfaces/coupon.interface';
import { CouponResponseDTO, CouponListResponseDTO } from './coupon.dto';

export class CouponMapper {
    static toCouponResponseDTO(coupon: ICoupon): CouponResponseDTO {
        return {
            _id: coupon._id?.toString() || '',
            couponCode: coupon.couponCode,
            discountType: coupon.discountType,
            discount: coupon.discount,
            minAmount: coupon.minAmount || 0,
            maxUses: coupon.maxUses || null,
            expiryDate: coupon.expiryDate || null,
            description: coupon.description || '',
            isActive: coupon.isActive || false,
            currentUses: coupon.currentUses || 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
    }

    static toCouponListResponseDTO(coupon: ICoupon): CouponListResponseDTO {
        return {
            _id: coupon._id?.toString() || '',
            couponCode: coupon.couponCode,
            discountType: coupon.discountType,
            discount: coupon.discount,
            minAmount: coupon.minAmount || 0,
            maxUses: coupon.maxUses || null,
            expiryDate: coupon.expiryDate || null,
            isActive: coupon.isActive || false,
            currentUses: coupon.currentUses || 0,
            createdAt: new Date()
        };
    }

    static toCouponListResponseDTOArray(coupons: ICoupon[]): CouponListResponseDTO[] {
        return coupons.map(coupon => this.toCouponListResponseDTO(coupon));
    }
}