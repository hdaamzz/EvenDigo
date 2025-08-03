import { ICouponRepository } from '../../../repositories/interfaces/ICoupon.repository';
import { ICoupon } from '../../../models/interfaces/coupon.interface';
import { ICouponAdminService } from '../../../services/interfaces/ICoupon.admin.service';
import { CreateCouponDTO, UpdateCouponDTO } from '../../../dto/admin/coupon/coupon.dto';
import { ServiceCouponMapper } from '../../../dto/admin/coupon/service.coupon.mapper';
import { CouponDTOValidator } from '../../../dto/admin/coupon/coupon.validator';
import { inject, injectable } from 'tsyringe';

@injectable()
export class CouponService implements ICouponAdminService {

    constructor(
        @inject("CouponRepository") private couponRepository: ICouponRepository,
    ) {}

    async getAllCoupons(): Promise<ICoupon[]> {
        return this.couponRepository.findAll();
    }

    async getAllCouponsWithPagination(
        page: number = 1, 
        limit: number = 10, 
        search: string = ''
    ): Promise<{coupons: ICoupon[], totalCount: number, hasMore: boolean}> {
        const result = await this.couponRepository.findAllCouponsPagination(page, limit, search);
        
        return {
            coupons: result.coupons,
            totalCount: result.totalCount,
            hasMore: result.hasMore
        };
    }

    async createCoupon(couponData: CreateCouponDTO): Promise<ICoupon> {
        CouponDTOValidator.validateCreateCouponDTO(couponData);

        const existingCoupon = await this.couponRepository.findCouponByCode(couponData.couponCode);
        if (existingCoupon) {
            throw new Error('Coupon code already exists');
        }

        const couponEntityData = ServiceCouponMapper.toEntityFromCreateDTO(couponData);

        return this.couponRepository.createCoupon(couponEntityData);
    }

    async updateCoupon(couponId: string, updateData: UpdateCouponDTO): Promise<ICoupon | null> {
        CouponDTOValidator.validateUpdateCouponDTO(updateData);

        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }

        if (updateData.couponCode && updateData.couponCode !== coupon.couponCode) {
            const existingCoupon = await this.couponRepository.findCouponByCode(updateData.couponCode);
            if (existingCoupon) {
                throw new Error('Coupon code already exists');
            }
        }

        const updateEntityData = ServiceCouponMapper.toEntityFromUpdateDTO(updateData);

        return this.couponRepository.updateById(couponId, updateEntityData);
    }

    async activateCoupon(couponId: string): Promise<ICoupon | null> {
        const coupon = await this.couponRepository.findById(couponId);
        if (!coupon) {
            throw new Error('Coupon not found');
        }

        this._validateCouponForActivation(coupon);

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

        if (coupon.currentUses && coupon.currentUses > 0) {
            throw new Error('Cannot delete coupon that has been used');
        }

        await this.couponRepository.deleteById(couponId);
    }

    private _validateCouponForActivation(coupon: ICoupon): void {
        if (coupon.expiryDate && coupon.expiryDate < new Date()) {
            throw new Error('Cannot activate expired coupon');
        }

        if (coupon.maxUses && coupon.currentUses && coupon.currentUses >= coupon.maxUses) {
            throw new Error('Cannot activate coupon that has reached maximum uses');
        }
    }
}
