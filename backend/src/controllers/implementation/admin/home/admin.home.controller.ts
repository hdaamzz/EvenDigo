// src/controllers/implementation/admin/home/admin.home.controller.ts
import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IHomeController } from '../../../../../src/controllers/interfaces/Admin/Home/IHome.controller';
import { IDashboardService } from '../../../../../src/services/interfaces/admin/IDashboard.admin.service';
import StatusCode from '../../../../../src/types/statuscode';

@injectable()
export class AdminHomeController implements IHomeController {
  constructor(@inject('DashboardService') private dashboardService: IDashboardService) {}

  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const stats = await this.dashboardService.getDashboardStats();
      res.status(StatusCode.OK).json({
        success: true,
        data: stats,
        message: 'Dashboard statistics fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch dashboard statistics',
        data: null,
      });
    }
  }

  async getRevenueChart(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string || 'monthly';
      const chartData = await this.dashboardService.getRevenueChart(period);
      res.status(StatusCode.OK).json({
        success: true,
        data: chartData,
        message: 'Revenue chart data fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching revenue chart data:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch revenue chart data',
        data: null,
      });
    }
  }

  async getRecentTransactions(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 5;
      const transactions = await this.dashboardService.getRecentTransactions(limit);
      res.status(StatusCode.OK).json({
        success: true,
        data: transactions,
        message: 'Recent transactions fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch recent transactions',
        data: null,
      });
    }
  }

  async getSubscriptionPlans(_req: Request, res: Response): Promise<void> {
    try {
      const subscriptions = await this.dashboardService.getSubscriptionPlans();
      res.status(StatusCode.OK).json({
        success: true,
        data: subscriptions,
        message: 'Subscription plans fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch subscription plans',
        data: null,
      });
    }
  }

  async getRecentActivities(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 5;
      const activities = await this.dashboardService.getRecentActivities(limit);
      res.status(StatusCode.OK).json({
        success: true,
        data: activities,
        message: 'Recent activities fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch recent activities',
        data: null,
      });
    }
  }

  async getUpcomingEvents(req: Request, res: Response): Promise<void> {
    try {
      const limit = Number(req.query.limit) || 3;
      const upcomingEvents = await this.dashboardService.getUpcomingEvents(limit);
      res.status(StatusCode.OK).json({
        success: true,
        data: upcomingEvents,
        message: 'Upcoming events fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch upcoming events',
        data: null,
      });
    }
  }

  async getUserRegistrationStats(req: Request, res: Response): Promise<void> {
    try {
      const period = req.query.period as string || 'monthly';
      const chartData = await this.dashboardService.getUserRegistrationStats(period);
      res.status(StatusCode.OK).json({
        success: true,
        data: chartData,
        message: 'User registration statistics fetched successfully',
      });
    } catch (error) {
      console.error('Error fetching user registration stats:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch user registration statistics',
        data: null,
      });
    }
  }
}