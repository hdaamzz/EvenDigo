import { Request, Response } from 'express';
import { ISubscriptionPlanService } from '../../../../../src/services/implementation/admin/SubscriptionPlan.service';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';
import { CreateSubscriptionPlanDto, SubscriptionPlanMapper, UpdateSubscriptionPlanDto } from '../../../../../src/dto/admin/subscription/Subscription-plan.dto';


export interface ISubscriptionPlanController {
  getAll(req: Request, res: Response): Promise<void>;
  getById(req: Request, res: Response): Promise<void>;
  update(req: Request, res: Response): Promise<void>;
  delete(req: Request, res: Response): Promise<void>;
  create(req: Request, res: Response): Promise<void>
}

@injectable()
export class SubscriptionPlanController implements ISubscriptionPlanController{
  constructor(
    @inject('SubscriptionPlanService')
    private subscriptionPlanService: ISubscriptionPlanService
  ) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreateSubscriptionPlanDto = req.body;
      
      const newPlan = await this.subscriptionPlanService.createPlan(createDto);
      const responseDto = SubscriptionPlanMapper.toResponseDto(newPlan);
      
      res.status(StatusCode.CREATED).json({
        success: true,
        data: responseDto
      });
    } catch (error) {
      console.error('Error creating subscription plan:', error);
      
      if (error instanceof Error && error.message.includes('duplicate key')) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'A plan with this type already exists'
        });
        return;
      }
      
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to create subscription plan'
      });
    }
  };

  getAll = async (_req: Request, res: Response): Promise<void> => {
    try {
      const plans = await this.subscriptionPlanService.getAllPlans();
      const responseDtos = SubscriptionPlanMapper.toResponseDtoArray(plans);
      
      res.status(StatusCode.OK).json({
        success: true,
        data: responseDtos
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
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }
      
      const responseDto = SubscriptionPlanMapper.toResponseDto(plan);
      
      res.status(StatusCode.OK).json({
        success: true,
        data: responseDto
      });
    } catch (error) {
      console.error(`Error fetching subscription plan with ID ${req.params.id}:`, error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription plan'
      });
    }
  };

  getByPlanType = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planType } = req.params;
      const plan = await this.subscriptionPlanService.getPlanByType(planType);
      
      if (!plan) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }
      
      const responseDto = SubscriptionPlanMapper.toResponseDto(plan);
      
      res.status(StatusCode.OK).json({
        success: true,
        data: responseDto
      });
    } catch (error) {
      console.error(`Error fetching subscription plan with type ${req.params.planType}:`, error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription plan'
      });
    }
  };

  update = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateSubscriptionPlanDto = req.body;
      
      const updatedPlan = await this.subscriptionPlanService.updatePlan(id, updateDto);
        
      if (!updatedPlan) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: 'Subscription plan not found'
        });
        return;
      }
      
      const responseDto = SubscriptionPlanMapper.toResponseDto(updatedPlan);
      
      res.status(StatusCode.OK).json({
        success: true,
        data: responseDto
      });
    } catch (error) {
      console.error(`Error updating subscription plan with ID ${req.params.id}:`, error);
      
      if (error instanceof Error && error.message.includes('duplicate key')) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'A plan with this type already exists'
        });
        return;
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
        return;
      }
      
      res.status(StatusCode.OK).json({
        success: true,
        message: 'Subscription plan deleted successfully',
        data: null
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