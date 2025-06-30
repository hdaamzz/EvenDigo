import { Model, Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { ISubscriptionRepository } from '../interfaces/ISubscription.repository';
import { ISubscription, SubscriptionStatus } from '../../models/SubscriptionModal';
import mongoose from 'mongoose';
import { BaseRepository } from '../BaseRepository';

@injectable()
export class SubscriptionRepository extends BaseRepository<ISubscription> implements ISubscriptionRepository {
  
  constructor(
    @inject("SubscriptionModel") subscriptionModel: Model<ISubscription>
  ) {
    super(subscriptionModel);
  }

  async createSubscription(subscriptionData: Partial<ISubscription>): Promise<ISubscription> {
    try {
      return await this.create(subscriptionData);
    } catch (error) {
      throw new Error(`Failed to create subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionById(subscriptionId: string): Promise<ISubscription | null> {
    try {
      console.log(subscriptionId);
      return await this.findOne({ subscriptionId });
    } catch (error) {
      throw new Error(`Failed to find subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionByStripeSessionId(sessionId: string): Promise<ISubscription | null> {
    try {
      return await this.findOne({ stripeSessionId: sessionId });
    } catch (error) {
      throw new Error(`Failed to find subscription by Stripe session ID: ${(error as Error).message}`);
    }
  }

  async findActiveSubscriptionByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription | null> {
    try {
      return await this.findOne({
        userId,
        isActive: true,
        endDate: { $gt: new Date() }
      });
    } catch (error) {
      throw new Error(`Failed to find active subscription: ${(error as Error).message}`);
    }
  }

  async updateSubscriptionStatus(subscriptionId: string, status: SubscriptionStatus): Promise<ISubscription | null> {
    try {
      return await this.updateOne({ subscriptionId }, { status });
    } catch (error) {
      throw new Error(`Failed to update subscription status: ${(error as Error).message}`);
    }
  }

  async cancelSubscription(subscriptionId: string): Promise<ISubscription | null> {
    try {
      const now = new Date();
      return await this.updateOne(
        { subscriptionId },
        {
          status: SubscriptionStatus.CANCELLED,
          isActive: false,
          cancelledAt: now
        }
      );
    } catch (error) {
      throw new Error(`Failed to cancel subscription: ${(error as Error).message}`);
    }
  }

  async findAllSubscriptionsByUserId(userId: Schema.Types.ObjectId | string): Promise<ISubscription[]> {
    try {
      return await this.findWithSort({ userId }, { createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to find user subscriptions: ${(error as Error).message}`);
    }
  }

  async updateSubscription(subscriptionId: string, updateData: Partial<ISubscription>): Promise<ISubscription | null> {
    try {
      return await this.updateOne({ subscriptionId }, updateData);
    } catch (error) {
      throw new Error(`Failed to update subscription: ${(error as Error).message}`);
    }
  }

  async findSubscriptionByObjectId(id: string): Promise<ISubscription | null> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id) && !id.includes('ObjectId')) {
        return null;
      }

      let objectId: mongoose.Types.ObjectId;

      if (id.includes('ObjectId')) {
        const match = id.match(/ObjectId\(['"]?([0-9a-fA-F]{24})['"]?\)/);
        if (!match || !match[1]) {
          return null;
        }
        objectId = new mongoose.Types.ObjectId(match[1]);
      } else {
        objectId = new mongoose.Types.ObjectId(id);
      }

      return await this.findById(objectId as unknown as string);
    } catch (error) {
      throw new Error(`Failed to find subscription by ObjectId: ${(error as Error).message}`);
    }
  }

  async countSubscriptions(query: any): Promise<number> {
    try {
      return await this.count(query);
    } catch (error) {
      throw new Error(`Failed to count subscriptions: ${(error as Error).message}`);
    }
  }

  async findSubscriptionsWithPagination(query: any, skip: number, limit: number): Promise<ISubscription[]> {
    try {
      const page = Math.floor(skip / limit) + 1;
      const result = await this.findWithPagination(query, {
        page,
        limit,
        sort: { createdAt: -1 }
      });
      return result.data;
    } catch (error) {
      throw new Error(`Failed to find subscriptions with pagination: ${(error as Error).message}`);
    }
  }

  async findAllSubscriptions(): Promise<ISubscription[]> {
    try {
      return await this.findWithSort({}, { createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to find all subscriptions: ${(error as Error).message}`);
    }
  }

  async findAllActiveSubscriptions(): Promise<ISubscription[]> {
    try {
      return await this.findWithSort({ status: 'active' }, { createdAt: -1 });
    } catch (error) {
      throw new Error(`Failed to find all active subscriptions: ${(error as Error).message}`);
    }
  }

  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      return await this.deleteOne({ subscriptionId });
    } catch (error) {
      throw new Error(`Failed to delete subscription: ${(error as Error).message}`);
    }
  }

  async deleteAllPendingSubscriptions(): Promise<{ deletedCount: number; success: boolean }> {
    try {
      return await this.deleteMany({
        status: SubscriptionStatus.PENDING
      });
    } catch (error) {
      throw new Error(`Failed to delete pending subscriptions: ${(error as Error).message}`);
    }
  }

  async deleteAllCancelledSubscriptions(): Promise<{ deletedCount: number; success: boolean }> {
    try {
      return await this.deleteMany({
        status: SubscriptionStatus.CANCELLED
      });
    } catch (error) {
      throw new Error(`Failed to delete cancelled subscriptions: ${(error as Error).message}`);
    }
  }

  async updateExpiredSubscriptions(): Promise<{ modifiedCount: number; success: boolean }> {
    try {
      const now = new Date();
      return await this.updateMany(
        {
          endDate: { $lt: now },
          status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
          isActive: true
        },
        {
          status: SubscriptionStatus.EXPIRED,
          isActive: false
        }
      );
    } catch (error) {
      throw new Error(`Failed to update expired subscriptions: ${(error as Error).message}`);
    }
  }
}