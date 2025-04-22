import { Request, Response } from 'express';
import { inject, injectable,  } from 'tsyringe';
import { ICouponAdminService } from '../../../../src/services/interfaces/ICoupon.admin.service';
import { ICouponAdminController } from '../../../../src/controllers/interfaces/ICoupon.admin.controller';
import StatusCode from '../../../../src/types/statuscode';

@injectable()
export class CouponController implements ICouponAdminController{

    constructor(
        @inject("CouponService") private couponService: ICouponAdminService,
    ) {}

    async fetchAllCoupons(_req: Request, res: Response): Promise<void> {
        try {
            const coupons = await this.couponService.getAllCoupons();
            res.status(StatusCode.OK).json({ success: true, data: coupons });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async fetchAllCouponsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.couponService.getAllCouponsWithPagination(page, limit);
            res.status(StatusCode.OK).json({ 
                success: true, 
                data: result.coupons,
                pagination: {
                    totalCount: result.totalCount,
                    totalPages: Math.ceil(result.totalCount / limit),
                    currentPage: page,
                    hasMore: result.hasMore
                }
            });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async createCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponData = req.body;
            const newCoupon = await this.couponService.createCoupon(couponData);
            res.status(StatusCode.CREATED).json({ success: true, data: newCoupon });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async updateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updateData = req.body;
            const updatedCoupon = await this.couponService.updateCoupon(couponId, updateData);
            res.status(StatusCode.OK).json({ success: true, data: updatedCoupon });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async activateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updatedCoupon = await this.couponService.activateCoupon(couponId);
            res.status(StatusCode.OK).json({ success: true, data: updatedCoupon });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async deactivateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updatedCoupon = await this.couponService.deactivateCoupon(couponId);
            res.status(StatusCode.OK).json({ success: true, data: updatedCoupon });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async deleteCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            await this.couponService.deleteCoupon(couponId);
            res.status(StatusCode.NO_CONTENT).send(); 
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }
}