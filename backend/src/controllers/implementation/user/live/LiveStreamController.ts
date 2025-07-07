// src/controllers/livestream/LiveStreamController.ts
import { Request, Response } from 'express';
import { injectable, inject } from 'tsyringe';
import StatusCode from '../../../../types/statuscode';
import { ILiveStreamService } from '../../../../services/interfaces/user/live-stream/ILiveStreamService';


@injectable()
export class LiveStreamController {
  constructor(
    @inject('LiveStreamService') private liveStreamService: ILiveStreamService
  ) {}

  async startLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const hostId = req.user.id;


      const streamData = await this.liveStreamService.createLiveStream(eventId, hostId);
      const tokenData = await this.liveStreamService.generateLiveStreamToken(
        eventId,
        hostId,
        'host'
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Live stream started successfully',
        data: {
          ...streamData,
          token: tokenData.token
        }
      });
    } catch (error) {
      console.error('Start live stream error:', error);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to start live stream'
      });
    }
  }

  async joinLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const streamData = await this.liveStreamService.joinLiveStream(eventId, userId);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Joined live stream successfully',
        data: streamData
      });
    } catch (error) {
      console.error('Join live stream error:', error);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to join live stream'
      });
    }
  }

  async endLiveStream(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const hostId = req.user.id;

      await this.liveStreamService.endLiveStream(eventId, hostId);

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Live stream ended successfully'
      });
    } catch (error) {
      console.error('End live stream error:', error);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to end live stream'
      });
    }
  }

  async getLiveStreamStatus(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;

      const status = await this.liveStreamService.getLiveStreamStatus(eventId);

      res.status(StatusCode.OK).json({
        success: true,
        data: status
      });
    } catch (error) {
      console.error('Get live stream status error:', error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to get live stream status'
      });
    }
  }

  async generateViewerToken(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const userId = req.user.id;

      const tokenData = await this.liveStreamService.generateLiveStreamToken(
        eventId,
        userId,
        'audience'
      );

      res.status(StatusCode.OK).json({
        success: true,
        message: 'Viewer token generated successfully',
        data: tokenData
      });
    } catch (error) {
      console.error('Generate viewer token error:', error);
      res.status(StatusCode.BAD_REQUEST).json({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate viewer token'
      });
    }
  }
}