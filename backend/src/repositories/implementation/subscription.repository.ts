import { Model, Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { ISubscriptionRepository } from '../interfaces/ISubscription.repository';
import { ISubscription, SubscriptionStatus } from '../../models/SubscriptionModal';
import mongoose from 'mongoose';

@injectable()
export class SubscriptionRepository implements ISubscriptionRepository {
  constructor(
    @inject("SubscriptionModel") private subscriptionModel: Model<ISubscription>
  ) { }

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
      console.log(subscriptionId);

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

      return await this.subscriptionModel.findById(objectId).exec();
    } catch (error) {
      throw new Error(`Failed to find subscription by ObjectId: ${(error as Error).message}`);
    }
  }

  async countSubscriptions(query: any): Promise<number> {
    try {
      return await this.subscriptionModel.countDocuments(query).exec();
    } catch (error) {
      throw new Error(`Failed to count subscriptions: ${(error as Error).message}`);
    }
  }

  async findSubscriptionsWithPagination(query: any, skip: number, limit: number): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    } catch (error) {
      throw new Error(`Failed to find subscriptions with pagination: ${(error as Error).message}`);
    }
  }

  async findAllSubscriptions(): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find()
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find all subscriptions: ${(error as Error).message}`);
    }
  }

  async findAllActiveSubscriptions(): Promise<ISubscription[]> {
    try {
      return await this.subscriptionModel.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Failed to find all subscriptions: ${(error as Error).message}`);
    }
  }

  async deleteSubscription(subscriptionId: string): Promise<boolean> {
    try {
      const result = await this.subscriptionModel.deleteOne({ subscriptionId }).exec();
      return result.deletedCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete subscription: ${(error as Error).message}`);
    }
  }
  async deleteAllPendingSubscriptions(): Promise<{ deletedCount: number; success: boolean }> {
    try {
      const result = await this.subscriptionModel.deleteMany({
        status: SubscriptionStatus.PENDING
      }).exec();

      return {
        deletedCount: result.deletedCount || 0,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to delete pending subscriptions: ${(error as Error).message}`);
    }
  }
  async deleteAllCancelledSubscriptions(): Promise<{ deletedCount: number; success: boolean }> {
    try {
      const result = await this.subscriptionModel.deleteMany({
        status: SubscriptionStatus.CANCELLED
      }).exec();

      return {
        deletedCount: result.deletedCount || 0,
        success: true
      };
    } catch (error) {
      throw new Error(`Failed to delete pending subscriptions: ${(error as Error).message}`);
    }
  }
  async updateExpiredSubscriptions(): Promise<{ modifiedCount: number; success: boolean }> {
  try {
    const now = new Date();
    const result = await this.subscriptionModel.updateMany(
      {
        endDate: { $lt: now },
        status: { $in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING] },
        isActive: true
      },
      {
        $set: {
          status: SubscriptionStatus.EXPIRED,
          isActive: false
        }
      }
    ).exec();
    
    return {
      modifiedCount: result.modifiedCount || 0,
      success: true
    };
  } catch (error) {
    throw new Error(`Failed to update expired subscriptions: ${(error as Error).message}`);
  }
  }
}