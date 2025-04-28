import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../types/statuscode';
import { IRevenueDistributionController } from '../../../../src/controllers/interfaces/admin/IDistribution.controller';
import { IRevenueDistributionService } from '../../../../src/services/interfaces/IDistribution.service';


@injectable()
export class RevenueDistributionController implements IRevenueDistributionController {
  constructor(
    @inject("RevenueDistributionService") private revenueDistributionService: IRevenueDistributionService
  ) { }

  async triggerDistributionManually(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.revenueDistributionService.processFinishedEvents();

      if (result.success) {
        res.status(StatusCode.OK).json({
          success: true,
          message: `Processed ${result.data?.processed} events for revenue distribution`,
          data: result.data
        });
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to trigger distribution: ${(error as Error).message}`
      });
    }
  }

  async getEventDistribution(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
      const result = await this.revenueDistributionService.getDistributionByEventId(eventId);

      if (result.success) {
        res.status(StatusCode.OK).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(StatusCode.NOT_FOUND).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to fetch distribution: ${(error as Error).message}`
      });
    }
  }

  async getAllCompletedDistributions(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.revenueDistributionService.getAllCompletedDistributions();

      if (result.success) {
        res.status(StatusCode.OK).json({
          success: true,
          data: result.data
        });
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to fetch distributions: ${(error as Error).message}`
      });
    }
  }

  async distributeSpecificEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
      const result = await this.revenueDistributionService.distributeEventRevenue(eventId);

      if (result.success) {
        res.status(StatusCode.OK).json({
          success: true,
          message: "Event revenue distributed successfully",
          data: result.data
        });
      } else {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: `Failed to distribute event revenue: ${(error as Error).message}`
      });
    }
  }
}