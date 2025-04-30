import { Request, Response } from 'express';
import { ISubscriptionController } from '../../../../../src/controllers/interfaces/user/ISubscription.controller';
import { inject, injectable } from 'tsyringe';
import { ISubscriptionService } from '../../../../../src/services/interfaces/ISubscription.service';
import StatusCode from '../../../../../src/types/statuscode';


@injectable()
export class SubscriptionController implements ISubscriptionController {
  constructor(
    @inject("SubscriptionService") private subscriptionService: ISubscriptionService
  ) {}

  createCheckout = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planType, amount, successUrl, cancelUrl } = req.body;
      const userId = req.user._id;

      if (!planType || !amount || !successUrl || !cancelUrl) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Missing required fields'
        });
        return;
      }

      const result = await this.subscriptionService.createStripeSubscription(userId, {
        planType,
        amount,
        successUrl,
        cancelUrl
      });

      res.status(StatusCode.OK).json({
        success: true,
        data: { sessionId: result.sessionId }
      });
    } catch (error) {
      console.error('Error creating subscription checkout:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to create subscription'
      });
    }
  };

  walletUpgrade = async (req: Request, res: Response): Promise<void> => {
    try {
      const { planType, amount, successUrl, cancelUrl } = req.body;
      const userId = req.user._id;

      if (!planType || !amount) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Missing required fields'
        });
        return;
      }

      const subscription = await this.subscriptionService.processWalletSubscription(userId, {
        planType,
        amount,
        successUrl: successUrl || '',
        cancelUrl: cancelUrl || ''
      });

      res.status(StatusCode.OK).json({
        success: true,
        data: {
          subscriptionId: subscription.subscriptionId,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          isActive: subscription.isActive,
          paymentMethod: subscription.paymentMethod,
          userId: subscription.userId
        },
        message: 'Subscription activated successfully'
      });
    } catch (error) {
      console.error('Error processing wallet subscription:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to process subscription'
      });
    }
  };

  getCurrentSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.user._id;
      const subscription = await this.subscriptionService.getCurrentSubscription(userId);

      if (!subscription) {
        res.status(StatusCode.OK).json({
          success: true,
          data: null,
          message: 'No active subscription found'
        });
        return;
      }

      res.status(StatusCode.OK).json({
        success: true,
        data: {
          subscriptionId: subscription.subscriptionId,
          type: subscription.type,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
          isActive: subscription.isActive,
          paymentMethod: subscription.paymentMethod,
          amount: subscription.amount,
          userId: subscription.userId
        }
      });
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to fetch subscription'
      });
    }
  };

  cancelSubscription = async (req: Request, res: Response): Promise<void> => {
    try {
      const { subscriptionId } = req.body;
      const userId = req.user._id;

      if (!subscriptionId) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          error: 'Subscription ID is required'
        });
        return;
      }

      const result = await this.subscriptionService.cancelSubscription(userId, subscriptionId);

      res.status(StatusCode.OK).json({
        success: result.success,
        message: result.message
      });
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        error: (error as Error).message || 'Failed to cancel subscription'
      });
    }
  };

  handleWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const endpointSecret = process.env.STRIPE_SUBSCRIPTION_WEBHOOK_SECRET;

      if (!endpointSecret) {
        console.error('Missing STRIPE_SUBSCRIPTION_WEBHOOK_SECRET environment variable');
        throw new Error('STRIPE_SUBSCRIPTION_WEBHOOK_SECRET environment variable is not set');
      }

      if (!Buffer.isBuffer(req.body)) {
        console.error('Request body is not a Buffer');
        throw new Error('Webhook request body must be raw Buffer data');
      }

      const event = this.subscriptionService.constructWebhookEvent(
        req.body, 
        sig, 
        endpointSecret
      );

      await this.subscriptionService.handleStripeWebhook(event);

      res.status(StatusCode.OK).json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        error: (error as Error).message
      });
    }
  };
}