export interface ILiveStreamService {
  generateLiveStreamToken(
    eventId: string, 
    userId: string, 
    role: 'host' | 'audience'
  ): Promise<{
    token: string;
    roomId: string;
    streamKey?: string;
  }>;
  
  createLiveStream(
    eventId: string, 
    hostId: string
  ): Promise<{
    roomId: string;
    streamKey: string;
    rtmpUrl: string;
  }>;
  
  joinLiveStream(
    eventId: string, 
    userId: string
  ): Promise<{
    token: string;
    roomId: string;
  }>;
  
  endLiveStream(eventId: string, hostId: string): Promise<boolean>;
  
  getLiveStreamStatus(eventId: string): Promise<{
    isLive: boolean;
    viewerCount: number;
    startTime?: Date;
  }>;
  
}