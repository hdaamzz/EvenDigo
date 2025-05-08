import { Request, Response } from 'express';
import { ISubscriptionPlanService } from '../../../../../src/services/implementation/admin/SubscriptionPlan.service';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';


export interface ISubscriptionPlanController {
  getAll(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
}


@injectable()
export class SubscriptionPlanController implements ISubscriptionPlanController{
  constructor(
    @inject('SubscriptionPlanService')
    private subscriptionPlanService: ISubscriptionPlanService
  ) {}

    getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const plans = await this.subscriptionPlanService.getAllPlans();
      res.status(StatusCode.OK).json({
        success: true,
        data: plans
      });
    } catch (error) {
        console.error('Error fetching subscription plans:', error);
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          error: (error as Error).message || 'Failed to fetch subscription plans'
        });
    }
  };

    getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const plan = await this.subscriptionPlanService.getPlanById(id);
      
      if (!plan) {
        res.status(StatusCode.NOT_FOUND).json({
            success: true,
          });
      }
      
      res.status(StatusCode.OK).json({
        success: true,
        data: plan
      });
    } catch (error) {
      console.error(`Error fetching subscription plan with ID ${req.params.id}:`, error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription plans'
      });
    }
  };

  

    update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { type, price, description, features, isPopular, discountPercentage, billingCycle } = req.body;
      
      const updatedPlan = await this.subscriptionPlanService.updatePlan(id, {
        type,
        price,
        description,
        features,
        isPopular,
        discountPercentage,
        billingCycle
      });
      
      if (!updatedPlan) {
        res.status(StatusCode.NOT_FOUND).json({
            success: true,
          });
      }
      
      res.status(StatusCode.OK).json({
        success: true,
        data: updatedPlan
      });
    } catch (error) {
      console.error(`Error updating subscription plan with ID ${req.params.id}:`, error);
      
      if (error instanceof Error && error.message.includes('duplicate key')) {
        res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            error: (error as Error).message || 'A plan with this type already exists'
          });
      }
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to update subscription plan'
      });
    }
  };


    delete = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const isDeleted = await this.subscriptionPlanService.deletePlan(id);
      
      if (!isDeleted) {
        res.status(StatusCode.NOT_FOUND).json({
            success: false,
            message: 'Subscription plan not found'
          });
      }
      
      res.status(StatusCode.OK).json({
        success: true,
        message:"",
        data: isDeleted
      });
    } catch (error) {
      console.error(`Error deleting subscription plan with ID ${req.params.id}:`, error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to delete subscription plan'
      });
    }
  };
}