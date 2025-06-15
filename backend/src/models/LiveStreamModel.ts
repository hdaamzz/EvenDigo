import mongoose, { Schema, Document } from 'mongoose';

export interface ILiveStream extends Document {
  eventId: mongoose.Types.ObjectId;
  hostId: mongoose.Types.ObjectId;
  roomId: string;
  streamKey: string;
  rtmpUrl: string;
  status: 'active' | 'ended' | 'paused';
  startTime: Date;
  endTime?: Date;
  viewerCount: number;
  maxViewers: number;
  totalDuration: number;
  createdAt: Date;
  updatedAt: Date;
}

const LiveStreamSchema: Schema = new Schema({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  hostId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomId: {
    type: String,
    required: true,
    unique: true
  },
  streamKey: {
    type: String,
    required: true
  },
  rtmpUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'paused'],
    default: 'active'
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  viewerCount: {
    type: Number,
    default: 0
  },
  maxViewers: {
    type: Number,
    default: 0
  },
  totalDuration: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// // Index for efficient queries
// LiveStreamSchema.index({ eventId: 1, status: 1 });
// LiveStreamSchema.index({ hostId: 1, status: 1 });

export const LiveStreamModel = mongoose.model<ILiveStream>('LiveStream', LiveStreamSchema);