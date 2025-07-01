import { Request, Response } from 'express';
import { ICouponAdminController } from '../../../../controllers/interfaces/Admin/Coupon/ICoupon.admin.controller';
import { ICouponAdminService } from '../../../../services/interfaces/ICoupon.admin.service';
import StatusCode from '../../../../types/statuscode';
import { inject, injectable } from 'tsyringe';
import { CouponMapper } from '../../../../dto/admin/coupon/coupon.mapper';
import { CreateCouponDTO, UpdateCouponDTO } from '../../../../dto/admin/coupon/coupon.dto';


@injectable()
export class CouponController implements ICouponAdminController {

    constructor(
        @inject("CouponService") private couponService: ICouponAdminService,
    ) { }

    async fetchAllCoupons(_req: Request, res: Response): Promise<void> {
        try {
            const coupons = await this.couponService.getAllCoupons();
            const couponDTOs = CouponMapper.toCouponListResponseDTOArray(coupons);
            res.status(StatusCode.OK).json({ success: true, data: couponDTOs });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    async fetchAllCouponsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            const search = req.query.search as string || '';

            const result = await this.couponService.getAllCouponsWithPagination(page, limit, search);
            const couponDTOs = CouponMapper.toCouponListResponseDTOArray(result.coupons);

            res.status(StatusCode.OK).json({
                success: true,
                data: couponDTOs,
                pagination: {
                    totalCount: result.totalCount,
                    totalPages: Math.ceil(result.totalCount / limit),
                    currentPage: page,
                    hasMore: result.hasMore
                }
            });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    async createCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponData: CreateCouponDTO = req.body;
            const newCoupon = await this.couponService.createCoupon(couponData);
            const couponDTO = CouponMapper.toCouponResponseDTO(newCoupon);
            res.status(StatusCode.CREATED).json({ success: true, data: couponDTO });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    async updateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updateData: UpdateCouponDTO = req.body;
            const updatedCoupon = await this.couponService.updateCoupon(couponId, updateData);

            if (!updatedCoupon) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: 'Coupon not found'
                });
                return;
            }

            const couponDTO = CouponMapper.toCouponResponseDTO(updatedCoupon);
            res.status(StatusCode.OK).json({ success: true, data: couponDTO });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    async activateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updatedCoupon = await this.couponService.activateCoupon(couponId);

            if (!updatedCoupon) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: 'Coupon not found'
                });
                return;
            }

            const couponDTO = CouponMapper.toCouponResponseDTO(updatedCoupon);
            res.status(StatusCode.OK).json({ success: true, data: couponDTO });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    async deactivateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updatedCoupon = await this.couponService.deactivateCoupon(couponId);

            if (!updatedCoupon) {
                res.status(StatusCode.NOT_FOUND).json({
                    success: false,
                    message: 'Coupon not found'
                });
                return;
            }

            const couponDTO = CouponMapper.toCouponResponseDTO(updatedCoupon);
            res.status(StatusCode.OK).json({ success: true, data: couponDTO });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: (error as Error).message
            });
        }
    }

    async deleteCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            await this.couponService.deleteCoupon(couponId);
            res.status(StatusCode.NO_CONTENT).send();
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: (error as Error).message
            });
        }
    }
}