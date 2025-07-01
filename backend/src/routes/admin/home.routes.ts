// src/routes/admin.dashboard.router.ts
import { Router } from 'express';
import { container } from 'tsyringe';
import { AdminHomeController } from '../../controllers/implementation/admin/home/admin.home.controller';

const dashboardController = container.resolve(AdminHomeController);
const adminDashboardRouter = Router();

adminDashboardRouter.get('/stats', (req, res) => dashboardController.getDashboardStats(req, res));
adminDashboardRouter.get('/revenue-chart', (req, res) => dashboardController.getRevenueChart(req, res));
adminDashboardRouter.get('/transactions', (req, res) => dashboardController.getRecentTransactions(req, res));
adminDashboardRouter.get('/subscriptions', (req, res) => dashboardController.getSubscriptionPlans(req, res));
adminDashboardRouter.get('/activities', (req, res) => dashboardController.getRecentActivities(req, res));
adminDashboardRouter.get('/upcoming-events', (req, res) => dashboardController.getUpcomingEvents(req, res));
adminDashboardRouter.get('/user-registrations', (req, res) => dashboardController.getUserRegistrationStats(req, res));

export default adminDashboardRouter;