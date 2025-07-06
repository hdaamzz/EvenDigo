import { Schema } from 'mongoose';
import { injectable } from 'tsyringe';
import { LiveStreamModel } from '../../models/LiveStreamModel';
import { ILiveStreamRepository } from '../interfaces/ILivestream.repository';
import { ILiveStream } from '../../models/interfaces/livestream.interfaces';

@injectable()
export class LiveStreamRepository implements ILiveStreamRepository {
  async createLiveStream(liveStreamData: Partial<ILiveStream>): Promise<ILiveStream> {
    const liveStream = new LiveStreamModel(liveStreamData);
    return await liveStream.save();
  }

  async findActiveLiveStreamByEventId(eventId: Schema.Types.ObjectId | string): Promise<ILiveStream | null> {
    return await LiveStreamModel.findOne({
      eventId,
      status: 'active'
    });
  }

  async findLiveStreamByEventAndHost(
    eventId: Schema.Types.ObjectId | string, 
    hostId: Schema.Types.ObjectId | string
  ): Promise<ILiveStream | null> {
    return await LiveStreamModel.findOne({
      eventId,
      hostId,
      status: 'active'
    });
  }

  async updateLiveStream(
    liveStreamId: Schema.Types.ObjectId | string, 
    updateData: Partial<ILiveStream>
  ): Promise<ILiveStream | null> {
    return await LiveStreamModel.findByIdAndUpdate(
      liveStreamId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async incrementViewerCount(
    liveStreamId: Schema.Types.ObjectId | string, 
    currentViewerCount: number
  ): Promise<ILiveStream | null> {
    return await LiveStreamModel.findByIdAndUpdate(
      liveStreamId,
      {
        $inc: { viewerCount: 1 },
        $max: { maxViewers: currentViewerCount + 1 }
      },
      { new: true }
    );
  }

  async endLiveStream(
    liveStreamId: Schema.Types.ObjectId | string, 
    endTime: Date, 
    totalDuration: number
  ): Promise<ILiveStream | null> {
    return await LiveStreamModel.findByIdAndUpdate(
      liveStreamId,
      {
        status: 'ended',
        endTime,
        totalDuration
      },
      { new: true }
    );
  }

  async findLiveStreamById(liveStreamId: Schema.Types.ObjectId | string): Promise<ILiveStream | null> {
    return await LiveStreamModel.findById(liveStreamId);
  }

  async findAllActiveLiveStreams(): Promise<ILiveStream[]> {
    return await LiveStreamModel.find({ status: 'active' }).sort({ createdAt: -1 });
  }

  async findLiveStreamsByHostId(hostId: Schema.Types.ObjectId | string): Promise<ILiveStream[]> {
    return await LiveStreamModel.find({ hostId }).sort({ createdAt: -1 });
  }
}