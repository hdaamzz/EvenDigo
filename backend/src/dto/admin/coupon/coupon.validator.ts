import { CreateCouponDTO, UpdateCouponDTO } from './coupon.dto';
import { DiscountType } from '../../../models/interfaces/coupon.interface';

export class CouponDTOValidator {
    
    static validateCreateCouponDTO(dto: CreateCouponDTO): void {
        this._validateCouponCode(dto.couponCode);
        this._validateDiscount(dto.discountType, dto.discount);
        
        if (dto.minAmount && dto.minAmount < 0) {
            throw new Error('Minimum amount must be non-negative');
        }
        
        if (dto.maxUses && dto.maxUses <= 0) {
            throw new Error('Maximum uses must be greater than 0');
        }
        
        if (dto.expiryDate && dto.expiryDate <= new Date()) {
            throw new Error('Expiry date must be in the future');
        }
    }

    static validateUpdateCouponDTO(dto: UpdateCouponDTO): void {
        if (dto.couponCode !== undefined) {
            this._validateCouponCode(dto.couponCode);
        }
        
        if (dto.discountType && dto.discount) {
            this._validateDiscount(dto.discountType, dto.discount);
        }
        
        if (dto.minAmount !== undefined && dto.minAmount < 0) {
            throw new Error('Minimum amount must be non-negative');
        }
        
        if (dto.maxUses !== undefined && dto.maxUses <= 0) {
            throw new Error('Maximum uses must be greater than 0');
        }
        
        if (dto.expiryDate !== undefined && dto.expiryDate <= new Date()) {
            throw new Error('Expiry date must be in the future');
        }
    }

    private static _validateCouponCode(couponCode: string): void {
        if (!couponCode || couponCode.trim().length === 0) {
            throw new Error('Coupon code is required');
        }
        
        if (couponCode.length < 3 || couponCode.length > 20) {
            throw new Error('Coupon code must be between 3 and 20 characters');
        }
        
        if (!/^[A-Z0-9]+$/i.test(couponCode)) {
            throw new Error('Coupon code can only contain letters and numbers');
        }
    }

    private static _validateDiscount(discountType: DiscountType, discount: number): void {
        if (discountType === DiscountType.PERCENTAGE && (discount < 0 || discount > 100)) {
            throw new Error('Percentage discount must be between 0 and 100');
        }
        
        if (discountType === DiscountType.FIXED_AMOUNT && discount < 0) {
            throw new Error('Fixed amount discount must be non-negative');
        }
    }
}
