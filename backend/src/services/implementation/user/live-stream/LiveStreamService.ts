import { injectable } from 'tsyringe';
import crypto from 'crypto';
import { ILiveStreamService } from '../../../../../src/services/interfaces/user/live-stream/ILiveStreamService';
import { EventModel } from '../../../../../src/models/EventModel';
import { LiveStreamModel } from '../../../../../src/models/LiveStreamModel';


@injectable()
export class LiveStreamService implements ILiveStreamService {
  private readonly appId: string;
  private readonly serverSecret: string;
  zegoBaseUrl : string;

  constructor() {
    this.appId = process.env.ZEGO_APP_ID!;
    this.serverSecret = process.env.ZEGO_SERVER_SECRET!;
    this.zegoBaseUrl = process.env.ZEGO_SERVER || 'https://rtc-api.zego.im';
    
    if (!this.appId || !this.serverSecret) {
      throw new Error('Zego credentials not configured');
    }
  }

  async generateLiveStreamToken(
    eventId: string,
    userId: string,
    role: 'host' | 'audience'
  ): Promise<{ token: string; roomId: string; streamKey?: string }> {
    // const hasAccess = await this.validateUserAccess(eventId, userId);
    // if (!hasAccess) {
    //   throw new Error('User does not have access to this event');
    // }

    const roomId = `event_${eventId}`;
    const token = this.generateZegoToken(userId, roomId, role);
    
    const result: { token: string; roomId: string; streamKey?: string } = {
      token,
      roomId
    };

    if (role === 'host') {
      const streamKey = this.generateStreamKey(eventId, userId);
      result.streamKey = streamKey;
    }

    return result;
  }

  async createLiveStream(
    eventId: string,
    hostId: string
  ): Promise<{ roomId: string; streamKey: string; rtmpUrl: string }> {
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // if (event.organizer.toString() !== hostId) {
    //   throw new Error('Only event organizer can start live stream');
    // }

    const existingStream = await LiveStreamModel.findOne({
      eventId,
      status: 'active'
    });

    if (existingStream) {
      return {
        roomId: existingStream.roomId,
        streamKey: existingStream.streamKey,
        rtmpUrl: existingStream.rtmpUrl
      };
    }

    const roomId = `event_${eventId}`;
    const streamKey = this.generateStreamKey(eventId, hostId);
    const rtmpUrl = `${process.env.ZEGO_RTMP_URL || 'rtmp://rtmp.zego.im/live'}/${streamKey}`;

    const liveStream = new LiveStreamModel({
      eventId,
      hostId,
      roomId,
      streamKey,
      rtmpUrl,
      status: 'active'
    });

    await liveStream.save();

    return { roomId, streamKey, rtmpUrl };
  }

  async joinLiveStream(
    eventId: string,
    userId: string
  ): Promise<{ token: string; roomId: string }> {
    const liveStream = await LiveStreamModel.findOne({
      eventId,
      status: 'active'
    });

    if (!liveStream) {
      throw new Error('No active live stream for this event');
    }

    const { token, roomId } = await this.generateLiveStreamToken(
      eventId,
      userId,
      'audience'
    );

    // Increment viewer count
    await LiveStreamModel.findByIdAndUpdate(
      liveStream._id,
      {
        $inc: { viewerCount: 1 },
        $max: { maxViewers: liveStream.viewerCount + 1 }
      }
    );

    return { token, roomId };
  }

  async endLiveStream(eventId: string, hostId: string): Promise<boolean> {
    const liveStream = await LiveStreamModel.findOne({
      eventId,
      hostId,
      status: 'active'
    });

    if (!liveStream) {
      throw new Error('No active live stream found');
    }

    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - liveStream.startTime.getTime()) / (1000 * 60));

    await LiveStreamModel.findByIdAndUpdate(liveStream._id, {
      status: 'ended',
      endTime,
      totalDuration: duration
    });

    return true;
  }

  async getLiveStreamStatus(eventId: string): Promise<{
    isLive: boolean;
    viewerCount: number;
    startTime?: Date;
  }> {
    const liveStream = await LiveStreamModel.findOne({
      eventId,
      status: 'active'
    });

    if (!liveStream) {
      return { isLive: false, viewerCount: 0 };
    }

    return {
      isLive: true,
      viewerCount: liveStream.viewerCount,
      startTime: liveStream.startTime
    };
  }

//   async validateUserAccess(eventId: string, userId: string): Promise<boolean> {
//     const event = await EventModel.findById(eventId);
//     if (!event) {
//       return false;
//     }

//     if (event.organizer.toString() === userId) {
//       return true;
//     }

//     const ticket = await TicketModel.findOne({
//       eventId,
//       userId,
//       status: 'confirmed'
//     });

//     return !!ticket;
//   }

  private generateZegoToken(userId: string, roomId: string, role: 'host' | 'audience'): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const expireTime = timestamp + 7200; 
    
    const payload = {
      app_id: parseInt(this.appId),
      user_id: userId,
      room_id: roomId,
      privilege: role === 'host' ? 1 : 0, 
      expire_time: expireTime
    };

    const payloadStr = JSON.stringify(payload);
    const payloadBase64 = Buffer.from(payloadStr).toString('base64');
    
    const signature = crypto
      .createHmac('sha256', this.serverSecret)
      .update(payloadBase64)
      .digest('base64');

    return `${payloadBase64}.${signature}`;
  }

  private generateStreamKey(eventId: string, userId: string): string {
    const timestamp = Date.now();
    return crypto
      .createHash('md5')
      .update(`${eventId}_${userId}_${timestamp}`)
      .digest('hex');
  }
}