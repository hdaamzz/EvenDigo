import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { ISubscriptionQueryService } from '../../../../services/interfaces/user/subscription/ISubscriptionQuery.service';
import { ISubscriptionRepository } from '../../../../repositories/interfaces/ISubscription.repository';
import { StripeProvider } from '../../../../utils/stripeProvider';
import { ForbiddenException, NotFoundException } from '../../../../error/error-handlers';
import { TransactionType } from '../../../../models/interfaces/wallet.interface';
import { IWalletRepository } from '../../../../repositories/interfaces/IWallet.repository';
import { ISubscription, SubscriptionStatus } from '../../../../models/interfaces/subscription.interface';

@injectable()
export class SubscriptionQueryService implements ISubscriptionQueryService {
  private stripe: Stripe;

  constructor(
    @inject("SubscriptionRepository") private subscriptionRepository: ISubscriptionRepository,
    @inject("StripeProvider") private stripeProvider: StripeProvider,
    @inject("WalletRepository") private walletRepository: IWalletRepository

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

      const refundAmount = this.calculateRefundAmount(subscription);

      if (refundAmount > 0) {
        await this.addRefundToWallet(userId, refundAmount, subscription);
      }

      await this.subscriptionRepository.cancelSubscription(subscriptionId);

      return {
        success: true,
        message: refundAmount > 0
          ? `Subscription cancelled successfully. ${refundAmount} added to your wallet.`
          : 'Subscription cancelled successfully'
      };
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
    const subscription = subscriptions.find((s: ISubscription) => s.stripeSubscriptionId === stripeSubscription.id);

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
    const subscription = subscriptions.find((s: ISubscription) => s.stripeSubscriptionId === stripeSubscription.id);

    if (subscription) {
      await this.subscriptionRepository.updateSubscription(subscription.subscriptionId, {
        status: SubscriptionStatus.EXPIRED,
        isActive: false
      });
    }
  }

  calculateRefundAmount(subscription: ISubscription): number {
    if (subscription.paymentMethod !== 'wallet' && subscription.paymentMethod !== 'card') {
      return 0;
    }

    const now = new Date();
    const endDate = new Date(subscription.endDate);

    if (now >= endDate) {
      return 0;
    }

    const totalDays = (endDate.getTime() - new Date(subscription.startDate).getTime()) / (1000 * 60 * 60 * 24);
    const remainingDays = (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);


    const refundAmount = Math.round((remainingDays / totalDays) * subscription.amount);

    return refundAmount;
  }

  async addRefundToWallet(
    userId: string,
    amount: number,
    subscription: ISubscription
  ): Promise<void> {

    await this.walletRepository.addTransaction(
      userId,
      {
        amount: amount,
        type: TransactionType.REFUND,
        description: `Refund for cancelled subscription #${subscription.subscriptionId}`,
        metadata: {
          subscriptionId: subscription.subscriptionId,
          refundReason: 'subscription_cancellation'
        }
      }
    );
  }

  async deleteAllPendingSubscriptions(): Promise<{ deletedCount: number; success: boolean; message: string }> {
    try {
      const result = await this.subscriptionRepository.deleteAllPendingSubscriptions();

      return {
        deletedCount: result.deletedCount,
        success: true,
        message: result.deletedCount > 0
          ? `Successfully deleted ${result.deletedCount} pending subscription(s)`
          : 'No pending subscriptions found to delete'
      };
    } catch (error) {
      throw new Error(`Failed to delete pending subscriptions: ${(error as Error).message}`);
    }
  }

  async deleteAllCancelledSubscriptions(): Promise<{ deletedCount: number; success: boolean; message: string }> {
    try {
      const result = await this.subscriptionRepository.deleteAllCancelledSubscriptions();

      return {
        deletedCount: result.deletedCount,
        success: true,
        message: result.deletedCount > 0
          ? `Successfully deleted ${result.deletedCount} pending subscription(s)`
          : 'No pending subscriptions found to delete'
      };
    } catch (error) {
      throw new Error(`Failed to delete pending subscriptions: ${(error as Error).message}`);
    }
  }
  async updateExpiredSubscriptions(): Promise<{ modifiedCount: number; success: boolean; message: string }> {
    try {
      const result = await this.subscriptionRepository.updateExpiredSubscriptions();

      return {
        modifiedCount: result.modifiedCount,
        success: true,
        message: result.modifiedCount > 0
          ? `Successfully updated ${result.modifiedCount} expired subscription(s)`
          : 'No subscriptions found to expire'
      };
    } catch (error) {
      throw new Error(`Failed to update expired subscriptions: ${(error as Error).message}`);
    }
  }
}