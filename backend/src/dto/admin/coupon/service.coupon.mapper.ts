import { ICoupon } from '../../../models/interfaces/coupon.interface';
import { CreateCouponDTO, UpdateCouponDTO } from './coupon.dto';

export class ServiceCouponMapper {
    
    static toEntityFromCreateDTO(createDTO: CreateCouponDTO): Partial<ICoupon> {
        return {
            couponCode: createDTO.couponCode.toUpperCase(),
            discountType: createDTO.discountType,
            discount: createDTO.discount,
            minAmount: createDTO.minAmount || 0,
            maxUses: createDTO.maxUses || undefined,
            expiryDate: createDTO.expiryDate || undefined,
            description: createDTO.description || '',
            isActive: true,
            currentUses: 0
        };
    }

    static toEntityFromUpdateDTO(updateDTO: UpdateCouponDTO): Partial<ICoupon> {
        const updateEntityData: Partial<ICoupon> = {};
        
        if (updateDTO.couponCode !== undefined) {
            updateEntityData.couponCode = updateDTO.couponCode.toUpperCase();
        }
        if (updateDTO.discountType !== undefined) {
            updateEntityData.discountType = updateDTO.discountType;
        }
        if (updateDTO.discount !== undefined) {
            updateEntityData.discount = updateDTO.discount;
        }
        if (updateDTO.minAmount !== undefined) {
            updateEntityData.minAmount = updateDTO.minAmount;
        }
        if (updateDTO.maxUses !== undefined) {
            updateEntityData.maxUses = updateDTO.maxUses;
        }
        if (updateDTO.expiryDate !== undefined) {
            updateEntityData.expiryDate = updateDTO.expiryDate;
        }
        if (updateDTO.description !== undefined) {
            updateEntityData.description = updateDTO.description;
        }
        if (updateDTO.isActive !== undefined) {
            updateEntityData.isActive = updateDTO.isActive;
        }

        return updateEntityData;
    }
}
