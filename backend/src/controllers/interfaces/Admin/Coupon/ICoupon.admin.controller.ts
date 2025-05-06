import { Request, Response } from "express";

export interface ICouponAdminController {
  fetchAllCoupons(req: Request, res: Response): Promise<void>;
  fetchAllCouponsWithPagination(req: Request, res: Response): Promise<void>;
  createCoupon(req: Request, res: Response): Promise<void>;
  updateCoupon(req: Request, res: Response): Promise<void>;
  activateCoupon(req: Request, res: Response): Promise<void>;
  deactivateCoupon(req: Request, res: Response): Promise<void>;
  deleteCoupon(req: Request, res: Response): Promise<void>;
}
