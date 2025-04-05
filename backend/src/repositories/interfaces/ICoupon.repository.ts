import { Schema } from "mongoose";
import { ICoupon } from "../../models/interfaces/coupon.interface";

export interface ICouponRepository {
  findAllCoupons(): Promise<ICoupon[]>;
  findCouponById(couponId: Schema.Types.ObjectId | string): Promise<ICoupon | null>;
  findCouponByCode(couponCode: string): Promise<ICoupon | null>;
  createCoupon(couponData: Partial<ICoupon>): Promise<ICoupon>;
  updateCoupon(couponId: Schema.Types.ObjectId | string, updateData: Partial<ICoupon>): Promise<ICoupon | null>;
  deleteCoupon(couponId: Schema.Types.ObjectId | string): Promise<void>;
}
