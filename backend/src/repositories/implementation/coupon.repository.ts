import { CouponModel } from '../../models/CouponModel';
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
        return this.findAll({
            isActive: true,
            validFrom: { $lte: currentDate },
            validUntil: { $gte: currentDate }
        });
    }

    async findExpiredCoupons(): Promise<ICoupon[]> {
        const currentDate = new Date();
        return this.findAll({
            validUntil: { $lt: currentDate }
        });
    }

    async findByDiscountType(discountType: string): Promise<ICoupon[]> {
        return this.findAll({ discountType });
    }

    async findByUsageLimit(usageLimit: number): Promise<ICoupon[]> {
        return this.findAll({ usageLimit: { $lte: usageLimit } });
    }

    async findCouponsInDateRange(startDate: Date, endDate: Date): Promise<ICoupon[]> {
        return this.findAll({
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

        const result = await this.findWithPagination(filter, { page, limit });

        return {
            items: result.data,
            totalCount: result.total,
            hasMore: result.hasNext,
            currentPage: result.page,
            totalPages: result.pages
        };
    }

    async findAllCoupons(): Promise<ICoupon[]> {
        return this.findAll();
    }

    async findAllCouponsPagination(page: number = 1, limit: number = 10, search: string = ''): Promise<{
        coupons: ICoupon[];
        totalCount: number;
        hasMore: boolean;
    }> {
        const searchFilter: any = {};

        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');

            searchFilter.$or = [
                { couponCode: searchRegex },
                { description: searchRegex },
                { discountType: searchRegex },
                {
                    $expr: {
                        $regexMatch: {
                            input: {
                                $cond: {
                                    if: "$isActive",
                                    then: "active",
                                    else: "inactive"
                                }
                            },
                            regex: search.trim(),
                            options: "i"
                        }
                    }
                }
            ];
        }

        const result = await this.findWithPagination(searchFilter, { page, limit });

        return {
            coupons: result.data,
            totalCount: result.total,
            hasMore: result.hasNext
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
        return this.updateById(couponId, updateData);
    }

    async deleteCoupon(couponId: string): Promise<boolean> {
        return this.deleteById(couponId);
    }
}