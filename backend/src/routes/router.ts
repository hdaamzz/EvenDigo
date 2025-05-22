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
import achievementRouter from './admin/achievements.routes';
import financeRouter from './admin/revenue.routes';
import distributionRouter from './admin/distribution.revenue.routes';
import subscriptionRoutes from './user/subscription.routes';
import adminSubscriptionRoutes from './admin/subscription.routes';
import subscriptionPlanRouter from './admin/subscriptionPlan.route';
import chatRoutes from './user/chat.routes';
import adminDashboardRouter from './admin/home.routes';


const router = express.Router();


router.use(express.json());

// const authDebounce = createRouteDebounce(500);     
// const dashboardDebounce = createRouteDebounce(300);
// const chatDebounce = createRouteDebounce(200);
// const searchDebounce = createRouteDebounce(400); 

router.use('/user/auth',authRouter);
router.use('/admin/auth',adminAuthRouter);
router.use(authMiddleware);

//User - Routes
router.use('/user/profile',profileRouter);
router.use('/user/dashboard',dashboardRouter);
router.use('/user/explore',exploreRoutes);
router.use('/user/subscription',subscriptionRoutes);
router.use('/user/chats', chatRoutes);


//Admin - Routes
router.use('/admin/coupon',couponRouter);
router.use('/admin/events',adminEventsRouter);
router.use('/admin/users',adminUsersRouter);
router.use('/admin/achievements', achievementRouter);
router.use('/admin/finance', financeRouter);
router.use('/admin/dist',distributionRouter);
router.use('/admin/subscriptions', adminSubscriptionRoutes);
router.use('/admin/subscription-plans', subscriptionPlanRouter);
router.use('/admin/dashboard', adminDashboardRouter);





export default router;