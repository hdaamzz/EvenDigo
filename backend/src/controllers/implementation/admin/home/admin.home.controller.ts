import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IHomeController } from '../../../../controllers/interfaces/Admin/Home/IHome.controller';
import { IDashboardService } from '../../../../services/interfaces/admin/IDashboard.admin.service';
import StatusCode from '../../../../types/statuscode';
import {
  DashboardStatsDto,
  RevenueChartDto,
  UserRegistrationChartDto,
  RecentTransactionDto,
  SubscriptionPlanDto,
  RecentActivityDto,
  UpcomingEventDto
} from '../../../../dto/admin/home/admin.home.dto';

@injectable()
export class AdminHomeController implements IHomeController {
  constructor(@inject('DashboardService') private dashboardService: IDashboardService) {}

  async getDashboardStats(_req: Request, res: Response): Promise<void> {
    try {
      const statsData = await this.dashboardService.getDashboardStats();
      const stats = new DashboardStatsDto(statsData);
      
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
      const chartDataRaw = await this.dashboardService.getRevenueChart(period);
      const chartData = new RevenueChartDto(chartDataRaw);
      
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
      const transactionsData = await this.dashboardService.getRecentTransactions(limit);
      const transactions = transactionsData.map(transaction => new RecentTransactionDto(transaction));
      
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
      const subscriptionsData = await this.dashboardService.getSubscriptionPlans();
      const subscriptions = subscriptionsData.map(subscription => new SubscriptionPlanDto(subscription));
      
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
      const activitiesData = await this.dashboardService.getRecentActivities(limit);
      const activities = activitiesData.map(activity => new RecentActivityDto(activity));
      
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
      const upcomingEventsData = await this.dashboardService.getUpcomingEvents(limit);
      const upcomingEvents = (await Promise.all(upcomingEventsData)).map(event => 
        new UpcomingEventDto({
          id: event.id,
          title: event.title,
          date: event.date,
          location: event.location,
          organizer: event.organizer,
          ticketsSold: event.ticketsSold,
          image: event.image
        })
      );
      
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
      const chartDataRaw = await this.dashboardService.getUserRegistrationStats(period);
      const chartData = new UserRegistrationChartDto(chartDataRaw);
      
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