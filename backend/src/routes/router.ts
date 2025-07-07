import express from 'express';
import authRouter from './user/auth.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { 
  requireAdminRole, 
  requireUserRole, 
} from '../middlewares/rolebased.middleware';
import { securityHeaders, sanitizeInput } from '../middlewares/security.middleware';
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
import livestreamRoutes from './user/livestream.routes';

const router = express.Router();

router.use(securityHeaders);
router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));
router.use(sanitizeInput);

router.use('/user/auth', authRouter);
router.use('/admin/auth', adminAuthRouter);

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});

router.use(authMiddleware);

// User-only routes
router.use('/user/profile', requireUserRole, profileRouter);
router.use('/user/dashboard', requireUserRole, dashboardRouter);
router.use('/user/explore', requireUserRole, exploreRoutes);
router.use('/user/subscription', requireUserRole, subscriptionRoutes);
router.use('/user/chats', requireUserRole, chatRoutes);
router.use('/user/livestream', requireUserRole, livestreamRoutes);

// Admin-only routes
router.use('/admin/coupon', couponRouter);
router.use('/admin/events', requireAdminRole, adminEventsRouter);
router.use('/admin/users', adminUsersRouter);
router.use('/admin/achievements', requireAdminRole, achievementRouter);
router.use('/admin/finance', requireAdminRole, financeRouter);
router.use('/admin/dist', requireAdminRole, distributionRouter);
router.use('/admin/subscriptions', requireAdminRole, adminSubscriptionRoutes);
router.use('/admin/subscription-plans', requireAdminRole, subscriptionPlanRouter);
router.use('/admin/dashboard', requireAdminRole, adminDashboardRouter);

export default router;