import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
// import { v4 as uuidv4 } from 'uuid';
import { ISubscriptionService, SubscriptionPayload } from '../../../../../src/services/interfaces/ISubscription.service';
import { ISubscriptionRepository } from '../../../../../src/repositories/interfaces/user/ISubscription.repository';
import { IWalletRepository } from '../../../../../src/repositories/interfaces/IWallet.repository';
import { ISubscription, SubscriptionStatus, SubscriptionType } from '../../../../../src/models/user/SubscriptionModal';
import { TransactionType } from '../../../../../src/models/interfaces/wallet.interface';


@injectable()
export class SubscriptionService implements ISubscriptionService {
  private stripe: Stripe;

  constructor(
    @inject("SubscriptionRepository") private subscriptionRepository: ISubscriptionRepository,
    @inject("WalletRepository") private walletRepository: IWalletRepository
  ) {
    const stripeKey = process.env.STRIPE_KEY;
    if (!stripeKey) {
      throw new Error('STRIPE_KEY environment variable is not set');
    }
    this.stripe = new Stripe(stripeKey, { apiVersion: '2025-02-24.acacia' });
  }
  constructWebhookEvent(rawBody: any, signature: string, endpointSecret: string): Stripe.Event {
    return this.stripe.webhooks.constructEvent(
      rawBody,
      signature,
      endpointSecret
    );
  }

  async createStripeSubscription(userId: string, payload: SubscriptionPayload): Promise<{ sessionId: string }> {
    try {
      // First check if user already has an active subscription
      const existingSubscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      const subscriptionId = `SUB${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      // Calculate subscription end date (1 month from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Create Stripe checkout session
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: `${payload.planType.toUpperCase()} Subscription`,
                description: '1-month subscription',
              },
              unit_amount: Math.round(payload.amount * 100),
              recurring: {
                interval: 'month',
              },
            },
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${payload.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: payload.cancelUrl,
        metadata: { 
          userId: userId.toString(),
          subscriptionId,
          planType: payload.planType,
        },
      });

      // Create pending subscription record
      await this.subscriptionRepository.createSubscription({
        userId,
        subscriptionId,
        type: payload.planType === 'premium' ? SubscriptionType.PREMIUM : SubscriptionType.STANDARD,
        amount: payload.amount,
        status: SubscriptionStatus.PENDING,
        startDate,
        endDate,
        isActive: false,
        paymentMethod: 'card',
        stripeSessionId: session.id,
      });

      return { sessionId: session.id };
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      throw new Error(`Subscription creation failed: ${(error as Error).message}`);
    }
  }

  async processWalletSubscription(userId: string, payload: SubscriptionPayload): Promise<ISubscription> {
    try {
      // First check if user already has an active subscription
      const existingSubscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
      if (existingSubscription) {
        throw new Error('User already has an active subscription');
      }

      // Check if user has sufficient balance
      const wallet = await this.walletRepository.findWalletById(userId);
      if (!wallet) {
        throw new Error('Wallet not found for this user');
      }
      
      if (wallet.walletBalance < payload.amount) {
        throw new Error('Insufficient wallet balance for subscription');
      }

      const subscriptionId = `SUB${Date.now()}${Math.floor(Math.random() * 10000)}`;
      
      // Calculate subscription end date (1 month from now)
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      // Create the subscription record
      const subscription = await this.subscriptionRepository.createSubscription({
        userId,
        subscriptionId,
        type: payload.planType === 'premium' ? SubscriptionType.PREMIUM : SubscriptionType.STANDARD,
        amount: payload.amount,
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
        isActive: true,
        paymentMethod: 'wallet'
      });

      // Process the wallet payment
      await this.walletRepository.addTransaction(
        userId,
        {
          amount: payload.amount,
          type: TransactionType.DEBIT,
          description: `Payment for ${payload.planType} subscription #${subscriptionId}`,
          metadata: {
            subscriptionId,
            planType: payload.planType
          }
        }
      );

      return subscription;
    } catch (error) {
      console.error('Error processing wallet subscription:', error);
      throw new Error(`Wallet subscription failed: ${(error as Error).message}`);
    }
  }

  async getCurrentSubscription(userId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
    } catch (error) {
      console.error('Error fetching current subscription:', error);
      throw new Error(`Failed to fetch subscription: ${(error as Error).message}`);
    }
  }

  async cancelSubscription(userId: string, subscriptionId: string): Promise<{ success: boolean; message: string }> {
    try {
      const subscription = await this.subscriptionRepository.findSubscriptionById(subscriptionId);
      
      if (!subscription) {
        throw new Error('Subscription not found');
      }
      
      if (subscription.userId.toString() !== userId.toString()) {
        throw new Error('Not authorized to cancel this subscription');
      }
      
      if (subscription.status === SubscriptionStatus.CANCELLED) {
        return { success: true, message: 'Subscription is already cancelled' };
      }
      
      // If it's a Stripe subscription, cancel it in Stripe as well
      if (subscription.stripeSubscriptionId) {
        await this.stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
      }
      
      // Update the subscription in our database
      await this.subscriptionRepository.cancelSubscription(subscriptionId);
      
      return { success: true, message: 'Subscription cancelled successfully' };
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      throw new Error(`Subscription cancellation failed: ${(error as Error).message}`);
    }
  }

  async handleStripeWebhook(event: Stripe.Event): Promise<void> {
    try {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          
          // Find the subscription using the session ID
          const subscription = await this.subscriptionRepository.findSubscriptionByStripeSessionId(session.id);
          if (!subscription) {
            console.log(`No subscription found with session ID: ${session.id}`);
            return;
          }
          
          // Update subscription status
          await this.subscriptionRepository.updateSubscription(subscription.subscriptionId, {
            status: SubscriptionStatus.ACTIVE,
            isActive: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string
          });
          break;
        }
        
        case 'customer.subscription.deleted': {
          const stripeSubscription = event.data.object as Stripe.Subscription;
          
          // Find all subscriptions with this Stripe subscription ID
          const subscriptions = await this.subscriptionRepository.findAllSubscriptionsByUserId(stripeSubscription.metadata.userId);
          const subscription = subscriptions.find(s => s.stripeSubscriptionId === stripeSubscription.id);
          
          if (subscription) {
            await this.subscriptionRepository.cancelSubscription(subscription.subscriptionId);
          }
          break;
        }
        
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.subscription) {
            const stripeSubscription = await this.stripe.subscriptions.retrieve(invoice.subscription as string);
            
            // Find the subscription in our database
            const subscriptions = await this.subscriptionRepository.findAllSubscriptionsByUserId(stripeSubscription.metadata.userId);
            const subscription = subscriptions.find(s => s.stripeSubscriptionId === stripeSubscription.id);
            
            if (subscription) {
              // Mark subscription as inactive due to payment failure
              await this.subscriptionRepository.updateSubscription(subscription.subscriptionId, {
                status: SubscriptionStatus.EXPIRED,
                isActive: false
              });
            }
          }
          break;
        }
      }
    } catch (error) {
      console.error('Error handling Stripe webhook:', error);
      throw new Error(`Webhook handling failed: ${(error as Error).message}`);
    }
  }

  async verifyUserHasActiveSubscription(userId: string): Promise<boolean> {
    try {
      const subscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
      return !!subscription && subscription.isActive && new Date() < subscription.endDate;
    } catch (error) {
      console.error('Error verifying subscription status:', error);
      return false;
    }
  }
}