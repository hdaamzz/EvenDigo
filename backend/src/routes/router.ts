// routes/index.ts
import express from 'express';
import authRouter from './user/auth.routes';
import { authMiddleware } from '../../src/middlewares/auth.middleware';
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
// import { errorHandler } from '../../src/middlewares/errorHandler.middleware';

const router = express.Router();

// Apply security middleware
router.use(securityHeaders);
router.use(express.json({ limit: '10mb' }));
router.use(express.urlencoded({ extended: true, limit: '10mb' }));
router.use(sanitizeInput);

// Public routes (no authentication required)
router.use('/user/auth', authRouter);
router.use('/admin/auth', adminAuthRouter);

// Protected routes (authentication required)
router.use(authMiddleware);

// User routes
router.use('/user/profile', profileRouter);
router.use('/user/dashboard', dashboardRouter);
router.use('/user/explore', exploreRoutes);
router.use('/user/subscription', subscriptionRoutes);
router.use('/user/chats', chatRoutes);

// Admin routes
router.use('/admin/coupon', couponRouter);
router.use('/admin/events', adminEventsRouter);
router.use('/admin/users', adminUsersRouter);
router.use('/admin/achievements', achievementRouter);
router.use('/admin/finance', financeRouter);
router.use('/admin/dist', distributionRouter);
router.use('/admin/subscriptions', adminSubscriptionRoutes);
router.use('/admin/subscription-plans', subscriptionPlanRouter);
router.use('/admin/dashboard', adminDashboardRouter);

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString()
  });
});


export default router;