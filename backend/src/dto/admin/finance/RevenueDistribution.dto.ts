import { ObjectId, Schema } from 'mongoose';
import { IRevenueDistribution } from '../../../models/interfaces/distribution.interface';
import { RevenueStats } from './finance.input.dto';

export class RevenueDistributionDto {
  _id: string;
  event: string | Schema.Types.ObjectId;
  admin_percentage: number;
  total_revenue: number;
  total_participants: number;
  admin_amount: number;
  organizer_amount: number;
  distributed_at: Date;
  is_distributed: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: IRevenueDistribution) {
    this._id = (data._id as ObjectId).toString();
    this.event = data.event;
    this.admin_percentage = parseFloat(data.admin_percentage.toString());
    this.total_revenue = parseFloat(data.total_revenue.toString());
    this.total_participants = data.total_participants;
    this.admin_amount = parseFloat(data.admin_amount.toString());
    this.organizer_amount = parseFloat(data.organizer_amount.toString());
    this.distributed_at = data.distributed_at;
    this.is_distributed = data.is_distributed;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }

  static fromArray(data: IRevenueDistribution[]): RevenueDistributionDto[] {
    return data.map(item => new RevenueDistributionDto(item));
  }
}

export class RevenueStatsDto {
  totalRevenue: string;
  totalRevenueChange: number;
  todayRevenue: string;
  todayRevenueChange: number;
  monthlyRevenue: string;
  monthlyRevenueChange: number;

  constructor(data: RevenueStats) {
    this.totalRevenue = data.totalRevenue;
    this.totalRevenueChange = data.totalRevenueChange;
    this.todayRevenue = data.todayRevenue;
    this.todayRevenueChange = data.todayRevenueChange;
    this.monthlyRevenue = data.monthlyRevenue;
    this.monthlyRevenueChange = data.monthlyRevenueChange;
  }
}

export class PaginatedRevenueDistributionDto {
  data: RevenueDistributionDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  constructor(paginatedData: any) {
    this.data = paginatedData.data ? RevenueDistributionDto.fromArray(paginatedData.data) : [];
    this.totalCount = paginatedData.totalCount || 0;
    this.currentPage = paginatedData.currentPage || 1;
    this.totalPages = paginatedData.totalPages || 0;
    this.hasNext = paginatedData.hasNext || false;
    this.hasPrev = paginatedData.hasPrev || false;
  }
}

export class ManualDistributionResponseDto {
  processed: number;

  constructor(data: { processed: number }) {
    this.processed = data.processed;
  }
}