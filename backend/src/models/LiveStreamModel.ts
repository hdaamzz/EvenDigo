import mongoose, { Schema } from 'mongoose';
import { ILiveStream } from './interfaces/livestream.interfaces';

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


export const LiveStreamModel = mongoose.model<ILiveStream>('LiveStream', LiveStreamSchema);