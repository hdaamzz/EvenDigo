export interface LiveStreamResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    roomId: string;
    streamKey?: string;
    rtmpUrl?: string;
  };
}

export interface LiveStreamStatus {
  isLive: boolean;
  viewerCount: number;
  startTime?: Date;
}