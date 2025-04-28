import mongoose, { Document, Schema } from 'mongoose';

export interface IRevenueDistribution extends Document {
  event: Schema.Types.ObjectId;
  admin_percentage: mongoose.Types.Decimal128;
  total_revenue: mongoose.Types.Decimal128;
  total_participants: number;
  admin_amount: mongoose.Types.Decimal128;
  organizer_amount: mongoose.Types.Decimal128;
  distributed_at: Date;
  is_distributed: boolean;
  createdAt: Date;
  updatedAt: Date;
}