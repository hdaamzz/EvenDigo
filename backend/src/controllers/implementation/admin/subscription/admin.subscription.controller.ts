import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';

import StatusCode from '../../../../../src/types/statuscode';
import { IAdminSubscriptionController } from '../../../interfaces/Admin/Subscription/IAdminSubscription.controller';
import { IAdminSubscriptionService } from '../../../../../src/services/interfaces/IAdminSubscription.service';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, NotFoundException } from '../../../../../src/error/error-handlers';

@injectable()
export class AdminSubscriptionController implements IAdminSubscriptionController {
  constructor(
    @inject("AdminSubscriptionService") private adminSubscriptionService: IAdminSubscriptionService
  ) {}

  getAllSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      
      const filters: any = {};
      
      if (req.query.status && req.query.status !== 'all') {
        filters.status = req.query.status;
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
      ResponseHandler.success(res, result);
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch subscriptions');
    }
  };

  getSubscriptionStats = async (_req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.adminSubscriptionService.getSubscriptionStats();
      ResponseHandler.success(res, stats);
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch subscription statistics');
    }
  };

  getSubscriptionById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new BadRequestException('Subscription ID is required');
      }

      const subscription = await this.adminSubscriptionService.getSubscriptionById(id);
      
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }

      ResponseHandler.success(res, subscription);
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch subscription details',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : 
        error instanceof NotFoundException ? StatusCode.NOT_FOUND : 
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  getUserSubscriptions = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        throw new BadRequestException('User ID is required');
      }

      const subscriptions = await this.adminSubscriptionService.getUserSubscriptions(userId);
      ResponseHandler.success(res, subscriptions);
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch user subscriptions',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  updateSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id, isActive } = req.body;
      
      if (!id) {
        throw new BadRequestException('Subscription ID is required');
      }

      if (isActive === undefined) {
        throw new BadRequestException('Status value is required');
      }

      const updatedSubscription = await this.adminSubscriptionService.updateSubscriptionStatus(id, isActive);
      
      if (!updatedSubscription) {
        throw new NotFoundException('Subscription not found');
      }

      ResponseHandler.success(
        res, 
        updatedSubscription, 
        `Subscription ${isActive ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to update subscription status',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : 
        error instanceof NotFoundException ? StatusCode.NOT_FOUND : 
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  deleteSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw new BadRequestException('Subscription ID is required');
      }

      const result = await this.adminSubscriptionService.deleteSubscription(id);
      
      if (!result) {
        throw new NotFoundException('Subscription not found');
      }

      ResponseHandler.success(res, null, 'Subscription deleted successfully');
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to delete subscription',
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : 
        error instanceof NotFoundException ? StatusCode.NOT_FOUND : 
        StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  };

  getFilterOptions = async (_req: Request, res: Response): Promise<void> => {
    try {
      const filterOptions = await this.adminSubscriptionService.getFilterOptions();
      ResponseHandler.success(res, filterOptions);
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch filter options');
    }
  };
}