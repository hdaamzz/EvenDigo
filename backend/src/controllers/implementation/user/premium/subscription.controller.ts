import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { ISubscriptionController } from '../../../interfaces/User/Premium/ISubscription.controller';
import { ICheckoutService } from '../../../../services/interfaces/user/subscription/ICheckout.service';
import { IWalletSubscriptionService } from '../../../../services/interfaces/user/subscription/IWalletSubscription.service';
import { ISubscriptionQueryService } from '../../../../services/interfaces/user/subscription/ISubscriptionQuery.service';
import { BadRequestException } from '../../../../error/error-handlers';
import { ResponseHandler } from '../../../../utils/response-handler';
import StatusCode from '../../../../types/statuscode';
import { IAdminSubscriptionService } from '../../../../services/interfaces/IAdminSubscription.service';


@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject("CheckoutService") private checkoutService: ICheckoutService,
    @inject("WalletSubscriptionService") private walletSubscriptionService: IWalletSubscriptionService,
    @inject("SubscriptionQueryService") private subscriptionQueryService: ISubscriptionQueryService,
    @inject("AdminSubscriptionService") private adminSubscriptionService: IAdminSubscriptionService
  ) {}

  createCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planType, amount, successUrl, cancelUrl } = req.body;
      const userId = req.user._id;

      if (!planType || !amount || !successUrl || !cancelUrl) {
        throw new BadRequestException('Missing required fields');
      }

      const result = await this.checkoutService.createCheckoutSession(userId, {
        planType,
        amount,
        successUrl,
        cancelUrl
      });

      ResponseHandler.success(res, { sessionId: result.sessionId }, 'Checkout session created successfully');
    } catch (error) {
      if (error instanceof BadRequestException) {
        ResponseHandler.error(res, error, error.message, 400);
      } else {
        ResponseHandler.error(res, error, 'Failed to create subscription');
      }
    }
  };

  walletUpgrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planType, amount, successUrl, cancelUrl } = req.body;
      const userId = req.user._id;

      if (!planType || !amount) {
        throw new BadRequestException('Missing required fields');
      }

      const subscription = await this.walletSubscriptionService.processSubscription(userId, {
        planType,
        amount,
        successUrl: successUrl || '',
        cancelUrl: cancelUrl || ''
      });

      ResponseHandler.success(
        res, 
        {
          subscriptionId: subscription.subscriptionId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          isActive: subscription.isActive,
          paymentMethod: subscription.paymentMethod,
          userId: subscription.userId,
          stripeSessionId:subscription.stripeSessionId
        }, 
        'Subscription activated successfully'
      );
    } catch (error) {
      if (error instanceof BadRequestException) {
        ResponseHandler.error(res, error, error.message, 400);
      } else {
        ResponseHandler.error(res, error, 'Failed to process subscription');
      }
    }
  };

  getCurrentSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const subscription = await this.subscriptionQueryService.getCurrentActiveSubscription(userId);

      if (!subscription) {
        ResponseHandler.success(res, null, 'No active subscription found');
        return;
      }

      ResponseHandler.success(res, {
        subscriptionId: subscription.subscriptionId,
        type: subscription.type,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        isActive: subscription.isActive,
        paymentMethod: subscription.paymentMethod,
        amount: subscription.amount,
        userId: subscription.userId
      });
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch subscription');
    }
  };

  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.body;
      const userId = req.user._id;

      if (!subscriptionId) {
        throw new BadRequestException('Subscription ID is required');
      }

      const result = await this.subscriptionQueryService.cancelUserSubscription(userId, subscriptionId);
      
      ResponseHandler.success(res, null, result.message);
    } catch (error) {
      if (error instanceof BadRequestException) {
        ResponseHandler.error(res, error, error.message, 400);
      } else {
        ResponseHandler.error(res, error, 'Failed to cancel subscription');
      }
    }
  };
  
  getSubscriptionDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { sessionId } = req.params;
      
      if (!sessionId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Subscription ID is required'
        });
        return;
      }
      
      const subscription = await this.adminSubscriptionService.getSubscriptionBySessionId(sessionId);
      
      if (!subscription) {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          error: 'Subscription not found'
        });
        return;
      }

      res.status(StatusCode.OK).json({
        success: true,
        data: subscription
      });
    } catch (error) {
      console.error('Error fetching subscription details:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription details'
      });
    }
  };


  handleStripeWebhook = async (req: Request, res: Response): Promise<void> => {
    const signature = req.headers['stripe-signature'] as string;
    
    if (!signature) {
      ResponseHandler.error(res, new Error('Stripe signature is missing'), 'Invalid webhook', 400);
      return;
    }

    try {
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!endpointSecret) {
        throw new Error('STRIPE_WEBHOOK_SECRET is not set');
      }

      const event = this.subscriptionQueryService.constructWebhookEvent(req.body, signature, endpointSecret);
      
      await this.subscriptionQueryService.handleSubscriptionWebhook(event);
      
      ResponseHandler.success(res, null, 'Webhook received');
    } catch (error) {
      ResponseHandler.error(res, error, 'Webhook failed', 400);
    }
  };
}