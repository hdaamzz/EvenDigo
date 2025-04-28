import mongoose from 'mongoose';
import { IRevenueDistribution } from './interfaces/distribution.interface';

const revenueDistributionSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event', 
    required: true,
    unique: true 
  },
  admin_percentage: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  total_revenue: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  total_participants: {
    type: Number,
    required: true
  },
  admin_amount: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  organizer_amount: {
    type: mongoose.Types.Decimal128,
    required: true
  },
  distributed_at: {
    type: Date,
    default: Date.now
  },
  is_distributed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export const RevenueDistributionModel = mongoose.model<IRevenueDistribution>(
  'RevenueDistribution',
  revenueDistributionSchema
);