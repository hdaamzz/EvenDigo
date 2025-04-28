import { Schema } from 'mongoose';
import { injectable, inject } from 'tsyringe';
import { Model } from 'mongoose';

// import { IBooking } from '../models/interfaces/booking.interface';
import { IRevenueDistributionRepository } from './interfaces/IRevenue.repository';
import { IRevenueDistribution } from '../../src/models/interfaces/distribution.interface';
import { EventDocument } from '../../src/models/interfaces/event.interface';

@injectable()
export class RevenueDistributionRepository implements IRevenueDistributionRepository {
  constructor(
    @inject("RevenueDistributionModel") private revenueDistributionModel: Model<IRevenueDistribution>,
    @inject("EventModel") private eventModel: Model<EventDocument>,
    // @inject("BookingModel") private bookingModel: Model<IBooking>
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
}