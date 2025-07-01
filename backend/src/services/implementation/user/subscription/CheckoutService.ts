import { inject, injectable } from 'tsyringe';
import Stripe from 'stripe';
import { ICheckoutService } from '../../../../services/interfaces/user/subscription/ICheckout.service';
import { ISubscriptionRepository } from '../../../../repositories/interfaces/ISubscription.repository';
import { StripeProvider } from '../../../../utils/stripeProvider';
import { SubscriptionPayload } from '../../../../services/interfaces/user/subscription/ISubscriptionQuery.service';
import { ConflictException, InternalServerErrorException } from '../../../../error/error-handlers';
import { SubscriptionStatus, SubscriptionType } from '../../../../models/SubscriptionModal';


@injectable()
export class CheckoutService implements ICheckoutService {
  private stripe: Stripe;

  constructor(
    @inject("SubscriptionRepository") private subscriptionRepository: ISubscriptionRepository,
    @inject("StripeProvider") private stripeProvider: StripeProvider
  ) {
    this.stripe = this.stripeProvider.getInstance();
  }

  async createCheckoutSession(userId: string, payload: SubscriptionPayload): Promise<{ sessionId: string }> {
    try {
      const existingSubscription = await this.subscriptionRepository.findActiveSubscriptionByUserId(userId);
      
      if (existingSubscription) {
        throw new ConflictException('You already has an active subscription');
      }

      const subscriptionId = this.generateSubscriptionId();
      
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

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
        success_url: `${process.env.CLIENT_SERVER}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.CLIENT_SERVER}/subscription/cancel`,
        metadata: {
          paymentType: 'subscription',
          userId: userId.toString(),
          subscriptionId: subscriptionId
        },
      });

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
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new InternalServerErrorException(`Subscription creation failed: ${(error as Error).message}`);
    }
  }

  private generateSubscriptionId(): string {
    return `SUB${Date.now()}${Math.floor(Math.random() * 10000)}`;
  }
}