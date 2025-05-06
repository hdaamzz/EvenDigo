import { inject, injectable } from 'tsyringe';
import { ISubscription } from '../../../../models/SubscriptionModal';
import Stripe from 'stripe';
import { SubscriptionStatus } from '../../../../models/SubscriptionModal';
import { ISubscriptionQueryService } from '../../../../../src/services/interfaces/user/subscription/ISubscriptionQuery.service';
import { ISubscriptionRepository } from '../../../../../src/repositories/interfaces/ISubscription.repository';
import { StripeProvider } from '../../../../../src/utils/stripeProvider';
import { ForbiddenException, NotFoundException } from '../../../../../src/error/error-handlers';

@injectable()
export class SubscriptionQueryService implements ISubscriptionQueryService {
  private stripe: Stripe;

  constructor(
    @inject("SubscriptionRepository") private subscriptionRepository: ISubscriptionRepository,
    @inject("StripeProvider") private stripeProvider: StripeProvider
  ) {
    this.stripe = this.stripeProvider.getInstance();
  }
  constructWebhookEvent(rawBody: any, signature: string, endpointSecret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(rawBody, signature, endpointSecret);
  }

  async getCurrentActiveSubscription(userId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
    } catch (error) {
      throw new Error(`Failed to fetch subscription: ${(error as Error).message}`);
    }
  }

  async cancelUserSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {

      const subscription = await this.subscriptionRepository.findSubscriptionById(subscriptionId);
      
      if (!subscription) {
        throw new NotFoundException('Subscription not found');
      }
      
      if (subscription.userId.toString() !== userId.toString()) {
        throw new ForbiddenException('Not authorized to cancel this subscription');
      }
      
      if (subscription.status === 'cancelled') {
        return { success: true, message: 'Subscription is already cancelled' };
      }
      
      // // If it's a Stripe subscription, cancel it through Stripe
      // if (subscription.stripeSubscriptionId) {
      //   await this.cancelStripeSubscription(subscription.stripeSubscriptionId);
      // }
      
      // Update the subscription in our database
      await this.subscriptionRepository.cancelSubscription(subscriptionId);
      
      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }
      
      throw new Error(`Subscription cancellation failed: ${(error as Error).message}`);
    }
  }

  async verifyUserHasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
      return Boolean(subscription && subscription.isActive && new Date() < subscription.endDate);
    } catch (error) {
      console.error('Error verifying subscription status:', error);
      return false;
    }
  }

  // private async cancelStripeSubscription(stripeSubscriptionId: string): Promise<void> {
  //   await this.stripe.subscriptions.cancel(stripeSubscriptionId);
  // }

  async handleSubscriptionWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed':
          await this.handleCheckoutSessionCompleted(event);
          break;
        
        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event);
          break;
        
        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event);
          break;
      }
    } catch (error) {
      throw new Error(`Webhook handling failed: ${(error as Error).message}`);
    }
  }

  private async handleCheckoutSessionCompleted(event: Stripe.Event): Promise<void> {
    const session = event.data.object as Stripe.Checkout.Session;
    
    const subscription = await this.subscriptionRepository.findSubscriptionByStripeSessionId(session.id);
    if (!subscription) {
      console.log(`No subscription found with session ID: ${session.id}`);
      return;
    }
    
    await this.subscriptionRepository.updateSubscription(subscription.subscriptionId, {
      status: SubscriptionStatus.ACTIVE,
      isActive: true,
      stripeCustomerId: session.customer as string,
      stripeSubscriptionId: session.subscription as string
    });
  }

  private async handleSubscriptionDeleted(event: Stripe.Event): Promise<void> {
    const stripeSubscription = event.data.object as Stripe.Subscription;
    
    const subscriptions = await this.subscriptionRepository.findAllSubscriptionsByUserId(stripeSubscription.metadata.userId);
    const subscription = subscriptions.find((s:ISubscription)  => s.stripeSubscriptionId === stripeSubscription.id);
    
    if (subscription) {
      await this.subscriptionRepository.cancelSubscription(subscription.subscriptionId);
    }
  }

  private async handleInvoicePaymentFailed(event: Stripe.Event): Promise<void> {
    const invoice = event.data.object as Stripe.Invoice;
    if (!invoice.subscription) return;
    
    const stripeSubscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
    
    if (!stripeSubscription.metadata.userId) return;
    
    const subscriptions = await this.subscriptionRepository.findAllSubscriptionsByUserId(stripeSubscription.metadata.userId);
    const subscription = subscriptions.find((s:ISubscription) => s.stripeSubscriptionId === stripeSubscription.id);
    
    if (subscription) {
      await this.subscriptionRepository.updateSubscription(subscription.subscriptionId, {
        status: SubscriptionStatus.EXPIRED,
        isActive: false
      });
    }
  }
}