export interface ZegoConfig {
  appId: number;
  token: string;
  roomId: string;
  userId: string;
  userName: string;
  role: 'host' | 'audience';
}