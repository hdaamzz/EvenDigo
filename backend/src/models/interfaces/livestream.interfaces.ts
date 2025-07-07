import mongoose, { Document } from "mongoose";

export interface ILiveStream extends Document {
  eventId:string | mongoose.Types.ObjectId;
  hostId:string | mongoose.Types.ObjectId;
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