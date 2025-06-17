import { injectable, inject } from 'tsyringe';
import crypto from 'crypto';
import { ILiveStreamService } from '../../../../../src/services/interfaces/user/live-stream/ILiveStreamService';
import { IEventRepository } from '../../../../../src/repositories/interfaces/IEvent.repository';
import { ILiveStreamRepository } from '../../../../../src/repositories/interfaces/ILivestream.repository';



@injectable()
export class LiveStreamService implements ILiveStreamService {
  private readonly appId: string;
  private readonly serverSecret: string;
  zegoBaseUrl: string;

  constructor(
    @inject('EventRepository') private eventRepository: IEventRepository,
    @inject('LiveStreamRepository') private liveStreamRepository: ILiveStreamRepository
  ) {
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
    // Check if event exists
    const event = await this.eventRepository.findEventById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if there's already an active stream for this event
    const existingStream = await this.liveStreamRepository.findActiveLiveStreamByEventId(eventId);
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

    const liveStreamData = {
      eventId,
      hostId,
      roomId,
      streamKey,
      rtmpUrl,
      status: 'active' as const
    };

    const liveStream = await this.liveStreamRepository.createLiveStream(liveStreamData);

    return { 
      roomId: liveStream.roomId, 
      streamKey: liveStream.streamKey, 
      rtmpUrl: liveStream.rtmpUrl 
    };
  }

  async joinLiveStream(
    eventId: string,
    userId: string
  ): Promise<{ token: string; roomId: string }> {
    // Check if there's an active live stream for this event
    const liveStream = await this.liveStreamRepository.findActiveLiveStreamByEventId(eventId);
    if (!liveStream) {
      throw new Error('No active live stream for this event');
    }

    // Generate token for audience
    const { token, roomId } = await this.generateLiveStreamToken(
      eventId,
      userId,
      'audience'
    );

    // Increment viewer count
    await this.liveStreamRepository.incrementViewerCount(
      liveStream._id as string,
      liveStream.viewerCount
    );

    return { token, roomId };
  }

  async endLiveStream(eventId: string, hostId: string): Promise<boolean> {
    // Find active live stream by event and host
    const liveStream = await this.liveStreamRepository.findLiveStreamByEventAndHost(eventId, hostId);
    if (!liveStream) {
      throw new Error('No active live stream found');
    }

    // Calculate duration
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - liveStream.startTime.getTime()) / (1000 * 60));

    // End the live stream
    await this.liveStreamRepository.endLiveStream(liveStream._id as string, endTime, duration);

    return true;
  }

  async getLiveStreamStatus(eventId: string): Promise<{
    isLive: boolean;
    viewerCount: number;
    startTime?: Date;
  }> {
    const liveStream = await this.liveStreamRepository.findActiveLiveStreamByEventId(eventId);

    if (!liveStream) {
      return { isLive: false, viewerCount: 0 };
    }

    return {
      isLive: true,
      viewerCount: liveStream.viewerCount,
      startTime: liveStream.startTime
    };
  }

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

    const signContent = JSON.stringify(payload);
    const signature = crypto.createHmac('sha1', this.serverSecret).update(signContent).digest('hex');
    console.log(signature);
    
    return this.serverSecret;
  }

  private generateStreamKey(eventId: string, userId: string): string {
    const timestamp = Date.now();
    return crypto
      .createHash('md5')
      .update(`${eventId}_${userId}_${timestamp}`)
      .digest('hex');
  }
}