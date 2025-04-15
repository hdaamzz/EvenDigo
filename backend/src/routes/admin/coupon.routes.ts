// coupon.router.ts
import { Router } from 'express';
import { CouponController } from '../../controllers/implementation/admin/admin.coupon.controller';
import { container } from 'tsyringe';

const couponController = container.resolve(CouponController);
const couponRouter = Router();

// Routes for coupon management
couponRouter.get('/', (req, res) => couponController.fetchAllCouponsWithPagination(req, res));
couponRouter.post('/', (req, res) => couponController.createCoupon(req, res));
couponRouter.put('/:id', (req, res) => couponController.updateCoupon(req, res));
couponRouter.patch('/active/:id', (req, res) => couponController.activateCoupon(req, res));
couponRouter.patch('/deactivate/:id', (req, res) => couponController.deactivateCoupon(req, res));
couponRouter.delete('/:id', (req, res) => couponController.deleteCoupon(req, res));

export default couponRouter;