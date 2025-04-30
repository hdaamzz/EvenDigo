import { Model, Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { ISubscriptionRepository } from '../interfaces/user/ISubscription.repository';
import { ISubscription, SubscriptionStatus } from '../../../src/models/user/SubscriptionModal';


@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @inject("SubscriptionModel") private subscriptionModel: Model<ISubscription>
  ) {}

  async createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    try {
      const subscription = new this.subscriptionModel(subscriptionData);
      return await subscription.save();
    } catch (error) {
      throw new Error(`Failed to create subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionById(subscriptionId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOne({ subscriptionId }).exec();
    } catch (error) {
      throw new Error(`Failed to find subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionByStripeSessionId(sessionId: string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOne({ stripeSessionId: sessionId }).exec();
    } catch (error) {
      throw new Error(`Failed to find subscription by Stripe session ID: ${(error as Error).message}`);
    }
  }

  async findActiveSubscriptionByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOne({ 
        userId, 
        isActive: true,
        endDate: { $gt: new Date() } 
      }).exec();
    } catch (error) {
      throw new Error(`Failed to find active subscription: ${(error as Error).message}`);
    }
  }

  async updateSubscriptionStatus(subscriptionId: string, status: SubscriptionStatus): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOneAndUpdate(
        { subscriptionId },
        { status },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update subscription status: ${(error as Error).message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<ISubscription | null> {
    try {
      const now = new Date();
      return await this.subscriptionModel.findOneAndUpdate(
        { subscriptionId },
        { 
          status: SubscriptionStatus.CANCELLED,
          isActive: false,
          cancelledAt: now
        },
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
    }
  }

  async findAllSubscriptionsByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find user subscriptions: ${(error as Error).message}`);
    }
  }

  async updateSubscription(subscriptionId: string, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
    try {
      return await this.subscriptionModel.findOneAndUpdate(
        { subscriptionId },
        updateData,
        { new: true }
      ).exec();
    } catch (error) {
      throw new Error(`Failed to update subscription: ${(error as Error).message}`);
    }
  }
}