import { Request, Response } from 'express';
import { ICouponAdminController } from '../../../../controllers/interfaces/Admin/Coupon/ICoupon.admin.controller';
import { ICouponAdminService } from '../../../../services/interfaces/ICoupon.admin.service';
import StatusCode from '../../../../types/statuscode';
import { inject, injectable } from 'tsyringe';
import { CouponMapper } from '../../../../dto/admin/coupon/coupon.mapper';
import { CouponListResponseDTO, CreateCouponDTO, UpdateCouponDTO } from '../../../../dto/admin/coupon/coupon.dto';
import { ICoupon } from 'src/models/interfaces/coupon.interface';

@injectable()
export class CouponController implements ICouponAdminController {
    constructor(
        @inject("CouponService") private readonly _couponService: ICouponAdminService,
    ) { }

    async fetchAllCoupons(_req: Request, res: Response): Promise<void> {
        try {
            const coupons = await this._couponService.getAllCoupons();
            const couponDTOs = CouponMapper.toCouponListResponseDTOArray(coupons);

            res.status(StatusCode.OK).json({ success: true, data: couponDTOs });
        } catch (error) {
            this._handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async fetchAllCouponsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const { page, limit, search } = this._extractPaginationParams(req);

            const result = await this._couponService.getAllCouponsWithPagination(page, limit, search);
            const couponDTOs = CouponMapper.toCouponListResponseDTOArray(result.coupons);

            const response = this._buildPaginatedResponse(couponDTOs, result, page, limit);
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async createCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponData = this._extractCouponData(req);
            const newCoupon = await this._couponService.createCoupon(couponData);
            const couponDTO = CouponMapper.toCouponResponseDTO(newCoupon);

            res.status(StatusCode.CREATED).json({ success: true, data: couponDTO });
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async updateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = this._getCouponIdFromParams(req);
            const updateData = this._extractUpdateData(req);
            const updatedCoupon = await this._couponService.updateCoupon(couponId, updateData);

            if (!updatedCoupon) {
                this._sendNotFoundResponse(res, 'Coupon not found');
                return;
            }

            const couponDTO = CouponMapper.toCouponResponseDTO(updatedCoupon);
            res.status(StatusCode.OK).json({ success: true, data: couponDTO });
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async activateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = this._getCouponIdFromParams(req);
            const updatedCoupon = await this._couponService.activateCoupon(couponId);

            if (!updatedCoupon) {
                this._sendNotFoundResponse(res, 'Coupon not found');
                return;
            }

            const couponDTO = CouponMapper.toCouponResponseDTO(updatedCoupon);
            res.status(StatusCode.OK).json({ success: true, data: couponDTO });
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async deactivateCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = this._getCouponIdFromParams(req);
            const updatedCoupon = await this._couponService.deactivateCoupon(couponId);

            if (!updatedCoupon) {
                this._sendNotFoundResponse(res, 'Coupon not found');
                return;
            }

            const couponDTO = CouponMapper.toCouponResponseDTO(updatedCoupon);
            res.status(StatusCode.OK).json({ success: true, data: couponDTO });
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async deleteCoupon(req: Request, res: Response): Promise<void> {
        try {
            const couponId = this._getCouponIdFromParams(req);
            await this._couponService.deleteCoupon(couponId);

            res.status(StatusCode.NO_CONTENT).send();
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    private _extractPaginationParams(req: Request): { page: number; limit: number; search: string } {
        const page = this._parsePageNumber(req.query.page as string);
        const limit = this._parseLimit(req.query.limit as string);
        const search = (req.query.search as string) || '';

        return { page, limit, search };
    }

    private _parsePageNumber(page: string): number {
        const parsedPage = parseInt(page);
        return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    }

    private _parseLimit(limit: string): number {
        const parsedLimit = parseInt(limit);
        return isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100); // Cap at 100
    }

    private _extractCouponData(req: Request): CreateCouponDTO {
        return req.body as CreateCouponDTO;
    }

    private _extractUpdateData(req: Request): UpdateCouponDTO {
        return req.body as UpdateCouponDTO;
    }

    private _getCouponIdFromParams(req: Request): string {
        const couponId = req.params.couponId;

        if (!couponId) {
            throw new Error('Coupon ID is required');
        }

        return couponId;
    }

    private _buildPaginatedResponse(couponDTOs: CouponListResponseDTO[], result: {
        coupons: ICoupon[];
        totalCount: number;
        hasMore: boolean;
    }, page: number, limit: number): object {        
        return {
            success: true,
            data: couponDTOs,
            pagination: {
                totalCount: result.totalCount,
                totalPages: Math.ceil(result.totalCount / limit),
                currentPage: page,
                hasMore: result.hasMore
            }
        };
    }

    private _sendNotFoundResponse(res: Response, message: string): void {
        res.status(StatusCode.NOT_FOUND).json({
            success: false,
            message
        });
    }

    private _handleError(res: Response, error: unknown, statusCode: number): void {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';

        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
}
