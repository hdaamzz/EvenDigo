import express from 'express';
import authRouter from './user/auth.routes';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
import profileRouter from './user/profile.routes';
import dashboardRouter from './user/dashboard.routes';
import exploreRoutes from './user/explore.routes';
import couponRouter from './admin/coupon.routes';
import adminEventsRouter from './admin/events.routes';
import adminUsersRouter from './admin/users.routes';
import adminAuthRouter from './admin/auth.routes';


const router = express.Router();

router.use(express.json());

router.use('/user/auth',authRouter);
router.use('/admin/auth',adminAuthRouter);
router.use(authMiddleware);

//User - Routes
router.use('/user/profile',profileRouter);
router.use('/user/dashboard',dashboardRouter);
router.use('/user/explore',exploreRoutes);

//Admin - Routes
router.use('/admin/coupon',couponRouter);
router.use('/admin/events',adminEventsRouter);
router.use('/admin/users',adminUsersRouter);



export default router;