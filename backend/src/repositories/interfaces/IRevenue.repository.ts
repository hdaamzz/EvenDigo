// src/repositories/interfaces/IRevenueDistribution.repository.ts
import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';
import { IRevenueDistribution } from 'src/models/interfaces/distribution.interface';

export interface IRevenueDistributionRepository {
  findCompletedDistributions(): Promise<IRevenueDistribution[]>;
  findDistributionByEventId(eventId: Schema.Types.ObjectId | string): Promise<IRevenueDistribution | null>;
  createDistribution(distributionData: Partial<IRevenueDistribution>): Promise<IRevenueDistribution>;
  updateDistribution(
    eventId: Schema.Types.ObjectId | string, 
    updateData: Partial<IRevenueDistribution>
  ): Promise<IRevenueDistribution | null>;
  findFinishedEventsForDistribution(): Promise<EventDocument[]>;
  markDistributionCompleted(eventId: Schema.Types.ObjectId | string): Promise<IRevenueDistribution | null>;
  findDistributedRevenueWithPagination(
      page: number,
      limit: number 
    ): Promise<{
      data: IRevenueDistribution[];
      total: number;
      page: number;
      pages: number;
    }> ;
    findRecentDistributedRevenue(limit: number): Promise<IRevenueDistribution[]> ;
    findRevenueByEventId(eventId: Schema.Types.ObjectId | string): Promise<IRevenueDistribution | null>;
    findTotalRevenue(): Promise<number>;
    findTotalRevenueForPreviousMonth(): Promise<number>;
    findTodayRevenue(): Promise<number>;
    findYesterdayRevenue(): Promise<number>;
    findCurrentMonthRevenue(): Promise<number>;
    findPreviousMonthRevenue(): Promise<number>;
}