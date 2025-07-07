import { Schema } from 'mongoose';
import { ILiveStream } from '../../models/interfaces/livestream.interfaces';

export interface ILiveStreamRepository {
  createLiveStream(liveStreamData: Partial<ILiveStream>): Promise<ILiveStream>;
  findActiveLiveStreamByEventId(eventId: Schema.Types.ObjectId | string): Promise<ILiveStream | null>;
  findLiveStreamByEventAndHost(eventId: Schema.Types.ObjectId | string, hostId: Schema.Types.ObjectId | string): Promise<ILiveStream | null>;
  updateLiveStream(liveStreamId: Schema.Types.ObjectId | string, updateData: Partial<ILiveStream>): Promise<ILiveStream | null>;
  incrementViewerCount(liveStreamId: Schema.Types.ObjectId | string, currentViewerCount: number): Promise<ILiveStream | null>;
  endLiveStream(liveStreamId: Schema.Types.ObjectId | string, endTime: Date, totalDuration: number): Promise<ILiveStream | null>;
  findLiveStreamById(liveStreamId: Schema.Types.ObjectId | string): Promise<ILiveStream | null>;
  findAllActiveLiveStreams(): Promise<ILiveStream[]>;
  findLiveStreamsByHostId(hostId: Schema.Types.ObjectId | string): Promise<ILiveStream[]>;
}