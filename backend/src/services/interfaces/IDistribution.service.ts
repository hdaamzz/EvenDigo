import { Schema } from 'mongoose';
import { ServiceResponse } from '../../models/interfaces/auth.interface';
import { IRevenueDistribution } from '../../../src/models/interfaces/distribution.interface';

export interface IRevenueDistributionService {
  processFinishedEvents(): Promise<ServiceResponse<{ processed: number }>>;
  distributeEventRevenue(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>>;
  getDistributionByEventId(eventId: Schema.Types.ObjectId | string): Promise<ServiceResponse<IRevenueDistribution | null>>;
  getAllCompletedDistributions(): Promise<ServiceResponse<IRevenueDistribution[]>>;
}

export interface IRevenueDistributionCronService {
    startCronJob(): void
  }