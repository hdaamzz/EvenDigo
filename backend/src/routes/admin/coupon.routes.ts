import { Router } from 'express';
import { CouponController } from '../../controllers/implementation/admin/coupon/admin.coupon.controller';
import { container } from 'tsyringe';
import { requireAdminRole } from '../../middlewares/rolebased.middleware';

const couponController = container.resolve(CouponController);
const couponRouter = Router();

couponRouter.get('/', (req, res) => couponController.fetchAllCouponsWithPagination(req, res));
couponRouter.post('/',requireAdminRole, (req, res) => couponController.createCoupon(req, res));
couponRouter.put('/:couponId',requireAdminRole, (req, res) => couponController.updateCoupon(req, res));
couponRouter.patch('/active/:couponId',requireAdminRole, (req, res) => couponController.activateCoupon(req, res));
couponRouter.patch('/deactivate/:couponId',requireAdminRole, (req, res) => couponController.deactivateCoupon(req, res));
couponRouter.delete('/:couponId',requireAdminRole, (req, res) => couponController.deleteCoupon(req, res));

export default couponRouter;