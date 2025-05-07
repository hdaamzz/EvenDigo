import { Schema } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';

import { IRevenueDistributionRepository } from '../interfaces/IRevenue.repository';
import { IRevenueDistribution } from '../../../src/models/interfaces/distribution.interface';
import { EventDocument } from '../../../src/models/interfaces/event.interface';

@injectable()
export class RevenueDistributionRepository implements IRevenueDistributionRepository {
  constructor(
    @inject("RevenueDistributionModel") private revenueDistributionModel: Model<IRevenueDistribution>,
    @inject("EventModel") private eventModel: Model<EventDocument>,
  ) { }

  async findCompletedDistributions(): Promise<IRevenueDistribution[]> {
    return this.revenueDistributionModel.find({ is_distributed: true })
      .populate('event', 'eventTitle user_id')
      .sort({ distributed_at: -1 })
      .exec();
  }

  async findDistributionByEventId(eventId: Schema.Types.ObjectId | string): Promise<IRevenueDistribution | null> {
    return this.revenueDistributionModel.findOne({ event: eventId })
      .populate('event', 'eventTitle user_id startDate endingDate')
      .exec();
  }

  async createDistribution(distributionData: Partial<IRevenueDistribution>): Promise<IRevenueDistribution> {
    const distribution = new this.revenueDistributionModel(distributionData);
    return distribution.save();
  }

  async updateDistribution(
    eventId: Schema.Types.ObjectId | string, 
    updateData: Partial<IRevenueDistribution>
  ): Promise<IRevenueDistribution | null> {
    return this.revenueDistributionModel.findOneAndUpdate(
      { event: eventId },
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async findFinishedEventsForDistribution(): Promise<EventDocument[]> {
    const currentDate = new Date();
    
    const events = await this.eventModel.find({
      endingDate: { $lt: currentDate },
      status: true
    }).exec();
    
    if (!events.length) return [];
    
const eventIds = events.map((event: EventDocument) => event._id);
    const existingDistributions = await this.revenueDistributionModel.find({
      event: { $in: eventIds }
    }).exec();
    
    const distributedEventIds = existingDistributions.map(dist => dist.event.toString());
    
    return events.filter((e:any) => !distributedEventIds.includes(e._id));
  }

  async markDistributionCompleted(eventId: Schema.Types.ObjectId | string): Promise<IRevenueDistribution | null> {
    return this.revenueDistributionModel.findOneAndUpdate(
      { event: eventId },
      { 
        $set: { 
          is_distributed: true,
          distributed_at: new Date()
        }
      },
      { new: true }
    ).exec();
  }
  async findDistributedRevenueWithPagination(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    data: IRevenueDistribution[];
    total: number;
    page: number;
    pages: number;
  }> {
    const skip = (page - 1) * limit;
    const total = await this.revenueDistributionModel.countDocuments({ is_distributed: true });
    
    const data = await this.revenueDistributionModel.find({ is_distributed: true })
      .sort({ distributed_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }
  
  async findRecentDistributedRevenue(limit: number = 5): Promise<IRevenueDistribution[]> {
    return this.revenueDistributionModel.find({ is_distributed: true })
      .sort({ distributed_at: -1 })
      .limit(limit)
      .exec();
  }
  
  async findRevenueByEventId(eventId: Schema.Types.ObjectId | string): Promise<IRevenueDistribution | null> {
    return this.revenueDistributionModel.findOne({ 
      event: eventId, 
      is_distributed: true 
    })
    .populate('event', 'eventTitle user_id')
    .exec();
  }
  async findTotalRevenue(): Promise<number> {
    const result = await this.revenueDistributionModel.aggregate([
      { $match: { is_distributed: true } },
      { $group: { _id: null, total: { $sum: "$total_revenue" } } }
    ]);
    return result.length > 0 ? Number(result[0].total) : 0;
  }
  
  async findTotalRevenueForPreviousMonth(): Promise<number> {
    const today = new Date();
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayPrevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    
    const result = await this.revenueDistributionModel.aggregate([
      { 
        $match: { 
          is_distributed: true,
          distributed_at: { 
            $gte: firstDayPrevMonth, 
            $lte: lastDayPrevMonth 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_revenue" } } }
    ]);
    
    return result.length > 0 ? Number(result[0].total) : 0;
  }
  
  async findTodayRevenue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const result = await this.revenueDistributionModel.aggregate([
      { 
        $match: { 
          is_distributed: true,
          distributed_at: { 
            $gte: today, 
            $lt: tomorrow 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_revenue" } } }
    ]);
    
    return result.length > 0 ? Number(result[0].total) : 0;
  }
  
  async findYesterdayRevenue(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = await this.revenueDistributionModel.aggregate([
      { 
        $match: { 
          is_distributed: true,
          distributed_at: { 
            $gte: yesterday, 
            $lt: today 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_revenue" } } }
    ]);
    
    return result.length > 0 ? Number(result[0].total) : 0;
  }
  
  async findCurrentMonthRevenue(): Promise<number> {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const nextMonthFirstDay = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const result = await this.revenueDistributionModel.aggregate([
      { 
        $match: { 
          is_distributed: true,
          distributed_at: { 
            $gte: firstDayOfMonth, 
            $lt: nextMonthFirstDay 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_revenue" } } }
    ]);
    
    return result.length > 0 ? Number(result[0].total) : 0;
  }
  
  async findPreviousMonthRevenue(): Promise<number> {
    const today = new Date();
    const firstDayPrevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const firstDayCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const result = await this.revenueDistributionModel.aggregate([
      { 
        $match: { 
          is_distributed: true,
          distributed_at: { 
            $gte: firstDayPrevMonth, 
            $lt: firstDayCurrentMonth 
          } 
        } 
      },
      { $group: { _id: null, total: { $sum: "$total_revenue" } } }
    ]);
    
    return result.length > 0 ? Number(result[0].total) : 0;
  }
  async findRevenueByDateRange(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 10,
    isDistributed: boolean = true
  ): Promise<{
    data: IRevenueDistribution[];
    total: number;
    page: number;
    pages: number;
  }> {
    const startDateTime = new Date(startDate);
    startDateTime.setHours(0, 0, 0, 0);
    
    const endDateTime = new Date(endDate);
    endDateTime.setHours(23, 59, 59, 999);
    
    const skip = (page - 1) * limit;
    
    const query = { 
      is_distributed: isDistributed,
      distributed_at: { 
        $gte: startDateTime, 
        $lte: endDateTime 
      } 
    };
    
    const total = await this.revenueDistributionModel.countDocuments(query);
    
    const data = await this.revenueDistributionModel.find(query)
      .sort({ distributed_at: -1 })
      .skip(skip)
      .limit(limit)
      .exec();
    
    return {
      data,
      total,
      page,
      pages: Math.ceil(total / limit)
    };
  }
}