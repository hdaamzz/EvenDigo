import { Request, Response } from 'express';
import { ICouponAdminController } from '../../../../../src/controllers/interfaces/Admin/Coupon/ICoupon.admin.controller';
import { ICouponAdminService } from '../../../../../src/services/interfaces/ICoupon.admin.service';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '../../../../../src/error/error-handlers';

@injectable()
export class CouponController implements ICouponAdminController {
    constructor(
        @inject("CouponService") private couponService: ICouponAdminService,
    ) { }

    async fetchAllCoupons(_req: Request, res: Response): Promise<void> {
        try {
            const coupons = await this.couponService.getAllCoupons();
            ResponseHandler.success(res, coupons, 'Coupons fetched successfully');
        } catch (error) {
            ResponseHandler.error(res, error, 'Failed to fetch coupons', StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async fetchAllCouponsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.couponService.getAllCouponsWithPagination(page, limit);

            ResponseHandler.success(res,
                {
                    coupons: result.coupons,
                    pagination: {
                        totalCount: result.totalCount,
                        totalPages: Math.ceil(result.totalCount / limit),
                        currentPage: page,
                        hasMore: result.hasMore
                    }
                }, 'Paginated coupons fetched successfully'
            );
        } catch (error) {
            ResponseHandler.error(res, error, 'Failed to fetch paginated coupons', StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async createCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponData = req.body;
            const newCoupon = await this.couponService.createCoupon(couponData);
            ResponseHandler.success(res, newCoupon, 'Coupon created successfully', StatusCode.CREATED);
        } catch (error) {
            if (error instanceof BadRequestException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Invalid coupon data',
                    StatusCode.BAD_REQUEST
                );
            } else if (error instanceof ConflictException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Coupon already exists',
                    StatusCode.CONFLICT
                );
            } else {
                ResponseHandler.error(
                    res,
                    error,
                    'Failed to create coupon',
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async updateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updateData = req.body;
            const updatedCoupon = await this.couponService.updateCoupon(couponId, updateData);
            ResponseHandler.success(res, updatedCoupon, 'Coupon updated successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Coupon not found',
                    StatusCode.NOT_FOUND
                );
            } else if (error instanceof BadRequestException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Invalid update data',
                    StatusCode.BAD_REQUEST
                );
            } else {
                ResponseHandler.error(
                    res,
                    error,
                    'Failed to update coupon',
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async activateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updatedCoupon = await this.couponService.activateCoupon(couponId);
            ResponseHandler.success(res, updatedCoupon, 'Coupon activated successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Coupon not found',
                    StatusCode.NOT_FOUND
                );
            } else {
                ResponseHandler.error(
                    res,
                    error,
                    'Failed to activate coupon',
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async deactivateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            const updatedCoupon = await this.couponService.deactivateCoupon(couponId);
            ResponseHandler.success(res, updatedCoupon, 'Coupon deactivated successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Coupon not found',
                    StatusCode.NOT_FOUND
                );
            } else {
                ResponseHandler.error(
                    res,
                    error,
                    'Failed to deactivate coupon',
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async deleteCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = req.params.couponId;
            await this.couponService.deleteCoupon(couponId);
            ResponseHandler.success(res, null, 'Coupon deleted successfully', StatusCode.NO_CONTENT);
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Coupon not found',
                    StatusCode.NOT_FOUND
                );
            } else if (error instanceof ForbiddenException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Cannot delete this coupon',
                    StatusCode.FORBIDDEN
                );
            } else {
                ResponseHandler.error(
                    res,
                    error,
                    'Failed to delete coupon',
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}