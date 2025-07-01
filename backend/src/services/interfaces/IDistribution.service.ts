import { Schema } from 'mongoose';
import { ServiceResponse } from '../../models/interfaces/auth.interface';
import { IRevenueDistribution } from '../../models/interfaces/distribution.interface';

export interface IRevenueDistributionService {
  processFinishedEvents(): Promise<ServiceResponse<{ processed: number }>>;
  distributeEventRevenue(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>>;
  getDistributionByEventId(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>>;
  getAllCompletedDistributions(): Promise<ServiceResponse<IRevenueDistribution[]>>;
  getDistributedRevenue(page: number, limit: number): Promise<ServiceResponse<any>>;
  getRecentDistributedRevenue(limit: number): Promise<ServiceResponse<IRevenueDistribution[]>>;
  getRevenueByEventId(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>>;
  getEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<ServiceResponse<any>>;
  getRevenueStats(): Promise<ServiceResponse<any>>;
  getRevenueByDateRange(
      startDate: string, 
      endDate: string, 
      page: number, 
      limit: number,
      isDistributed: boolean
    ): Promise<ServiceResponse<any>> 
}

export interface IRevenueDistributionCronService {
    startCronJob(): void
  }