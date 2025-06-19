import { DiscountType } from "../../../../src/models/interfaces/coupon.interface";

export interface CreateCouponDTO {
    couponCode: string;
    discountType: DiscountType;
    discount: number;
    minAmount?: number;
    maxUses?: number;
    expiryDate?: Date;
    description?: string;
}

export interface UpdateCouponDTO {
    couponCode?: string;
    discountType?: DiscountType;
    discount?: number;
    minAmount?: number;
    maxUses?: number;
    expiryDate?: Date;
    description?: string;
    isActive?: boolean;
}

export interface CouponResponseDTO {
    _id: string;
    couponCode: string;
    discountType: DiscountType;
    discount: number;
    minAmount: number;
    maxUses: number | null;
    expiryDate: Date | null;
    description: string;
    isActive: boolean;
    currentUses: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CouponListResponseDTO {
    _id: string;
    couponCode: string;
    discountType: DiscountType;
    discount: number;
    minAmount: number;
    maxUses: number | null;
    expiryDate: Date | null;
    isActive: boolean;
    currentUses: number;
    createdAt: Date;
}

export interface PaginatedCouponResponseDTO {
    coupons: CouponListResponseDTO[];
    pagination: {
        totalCount: number;
        totalPages: number;
        currentPage: number;
        hasMore: boolean;
    };
}