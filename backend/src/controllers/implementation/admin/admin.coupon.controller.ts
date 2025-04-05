import { Request, Response } from 'express';
import { inject, injectable,  } from 'tsyringe';
import { ICouponAdminService } from '../../../../src/services/interfaces/ICoupon.admin.service';
import { ICouponAdminController } from '../../../../src/controllers/interfaces/ICoupon.admin.controller';

@injectable()
export class CouponController implements ICouponAdminController{

    constructor(
        @inject("CouponService") private couponService: ICouponAdminService,
    ) {}

    async fetchAllCoupons(_req: Request, res: Response): Promise<void> {
        try {
            const coupons = await this.couponService.getAllCoupons();
            res.status(200).json({ success: true, data: coupons });
        } catch (error) {
            res.status(500).json({ success: false, message: (error as Error).message });
        }
    }

    async createCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponData = req.body;
            const newCoupon = await this.couponService.createCoupon(couponData);
            res.status(201).json({ success: true, data: newCoupon });
        } catch (error) {
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }

    async updateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.id;
            const updateData = req.body;
            const updatedCoupon = await this.couponService.updateCoupon(couponId, updateData);
            res.status(200).json({ success: true, data: updatedCoupon });
        } catch (error) {
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }

    async activateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.id;
            const updatedCoupon = await this.couponService.activateCoupon(couponId);
            res.status(200).json({ success: true, data: updatedCoupon });
        } catch (error) {
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }

    async deactivateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.id;
            const updatedCoupon = await this.couponService.deactivateCoupon(couponId);
            res.status(200).json({ success: true, data: updatedCoupon });
        } catch (error) {
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }

    async deleteCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.id;
            await this.couponService.deleteCoupon(couponId);
            res.status(204).send(); // No content on successful deletion
        } catch (error) {
            res.status(400).json({ success: false, message: (error as Error).message });
        }
    }
}