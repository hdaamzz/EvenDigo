import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { IAdminSubscriptionController } from '../../../interfaces/Admin/Subscription/IAdminSubscription.controller';
import { IAdminSubscriptionService } from '../../../../services/interfaces/IAdminSubscription.service';
import { 
  AdminSubscriptionDto, 
  AdminSubscriptionStatsDto, 
  AdminPaginatedSubscriptionsDto,
  AdminFilterOptionsDto 
} from '../../../../dto/admin/subscription/AdminSubscriptionDto';

@injectable()
export class AdminSubscriptionController implements IAdminSubscriptionController {
  constructor(
    @inject("AdminSubscriptionService") private adminSubscriptionService: IAdminSubscriptionService
  ) {}

  getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const activeOnly = req.query.activeOnly === 'true';
      
      const filters: any = {};
      
      if (activeOnly) {
        filters.activeOnly = true;
      }
      
      if (req.query.planType && req.query.planType !== 'all') {
        filters.planType = req.query.planType;
      }
      
      if (req.query.search) {
        filters.searchTerm = req.query.search;
      }
      
      if (req.query.startDate) {
        filters.startDate = new Date(req.query.startDate as string);
      }
      
      if (req.query.endDate) {
        filters.endDate = new Date(req.query.endDate as string);
      }

      const result = await this.adminSubscriptionService.getAllSubscriptions(page, limit, filters);
      const dto = AdminPaginatedSubscriptionsDto.fromPaginatedData(result);

      res.status(StatusCode.OK).json({
        success: true,
        data: dto
      });
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscriptions'
      });
    }
  };

  getSubscriptionStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.adminSubscriptionService.getSubscriptionStats();
      const dto = AdminSubscriptionStatsDto.fromStats(stats);

      res.status(StatusCode.OK).json({
        success: true,
        data: dto
      });
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription statistics'
      });
    }
  };

  getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Subscription ID is required'
        });
        return;
      }

      const subscription = await this.adminSubscriptionService.getSubscriptionById(id);
      
      if (!subscription) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          error: 'Subscription not found'
        });
        return;
      }

      const dto = AdminSubscriptionDto.fromSubscription(subscription);

      res.status(StatusCode.OK).json({
        success: true,
        data: dto
      });
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription details'
      });
    }
  };

  getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'User ID is required'
        });
        return;
      }

      const subscriptions = await this.adminSubscriptionService.getUserSubscriptions(userId);
      const dto = AdminSubscriptionDto.fromSubscriptions(subscriptions);

      res.status(StatusCode.OK).json({
        success: true,
        data: dto
      });
    } catch (error) {
      console.error('Error fetching user subscriptions:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch user subscriptions'
      });
    }
  };

  updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, isActive } = req.body;
      
      if (!id) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Subscription ID is required'
        });
        return;
      }

      if (isActive === undefined) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Status value is required'
        });
        return;
      }

      const updatedSubscription = await this.adminSubscriptionService.updateSubscriptionStatus(id, isActive);
      
      if (!updatedSubscription) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          error: 'Subscription not found'
        });
        return;
      }

      const dto = AdminSubscriptionDto.fromSubscription(updatedSubscription);

      res.status(StatusCode.OK).json({
        success: true,
        data: dto,
        message: `Subscription ${isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating subscription status:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to update subscription status'
      });
    }
  };

  deleteSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Subscription ID is required'
        });
        return;
      }

      const result = await this.adminSubscriptionService.deleteSubscription(id);
      
      if (!result) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          error: 'Subscription not found'
        });
        return;
      }

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Subscription deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting subscription:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to delete subscription'
      });
    }
  };

  getFilterOptions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const filterOptions = await this.adminSubscriptionService.getFilterOptions();
      const dto = AdminFilterOptionsDto.fromFilterOptions(filterOptions);

      res.status(StatusCode.OK).json({
        success: true,
        data: dto
      });
    } catch (error) {
      console.error('Error fetching filter options:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch filter options'
      });
    }
  };
}