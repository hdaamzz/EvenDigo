import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IRevenueDistributionService } from '../../../../services/interfaces/IDistribution.service';
import { IRevenueDistributionController } from 'src/controllers/interfaces/Admin/Finance/IDistribution.controller';
import StatusCode from '../../../../types/statuscode';
import { 
  RevenueDistributionDto, 
  RevenueStatsDto, 
  PaginatedRevenueDistributionDto,
  ManualDistributionResponseDto 
} from '../../../../dto/admin/finance/RevenueDistribution.dto';

@injectable()
export class RevenueDistributionController implements IRevenueDistributionController {
  constructor(
    @inject("RevenueDistributionService") private revenueDistributionService: IRevenueDistributionService
  ) { }

  async triggerDistributionManually(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.revenueDistributionService.processFinishedEvents();

      if (result.success) {
        const responseData = new ManualDistributionResponseDto(result.data!);
        res.status(StatusCode.OK).json({
          success: true,
          message: `Processed ${result.data?.processed} events for revenue distribution`,
          data: responseData
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
        const responseData = result.data ? new RevenueDistributionDto(result.data) : null;
        res.status(StatusCode.OK).json({
          success: true,
          data: responseData
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
        const responseData = RevenueDistributionDto.fromArray(result.data!);
        res.status(StatusCode.OK).json({
          success: true,
          data: responseData
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
        const responseData = result.data ? new RevenueDistributionDto(result.data) : null;
        res.status(StatusCode.OK).json({
          success: true,
          message: "Event revenue distributed successfully",
          data: responseData
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

  async getDistributedRevenue(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const response = await this.revenueDistributionService.getDistributedRevenue(page, limit);

      if (response.success) {
        const responseData = new PaginatedRevenueDistributionDto(response.data);
        res.status(StatusCode.OK).json(responseData);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch distributed revenue"
      });
    }
  }

  async getRecentDistributedRevenue(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const response = await this.revenueDistributionService.getRecentDistributedRevenue(limit);

      if (response.success) {
        const responseData = RevenueDistributionDto.fromArray(response.data!);
        res.status(StatusCode.OK).json(responseData);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch recent distributed revenue"
      });
    }
  }

  async getRevenueByEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;

      const response = await this.revenueDistributionService.getRevenueByEventId(eventId);

      if (response.success) {
        const responseData = response.data ? new RevenueDistributionDto(response.data) : null;
        res.status(StatusCode.OK).json(responseData);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch revenue by event"
      });
    }
  }

  async getEventsByIds(req: Request, res: Response): Promise<void> {
    try {
      const ids = (req.query.ids as string || '').split(',').filter(id => id);
      
      if (!ids.length) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "No event IDs provided"
        });
        return;
      }

      const response = await this.revenueDistributionService.getEventsByIds(ids);

      if (response.success) {
        // Since this returns events, not revenue distributions, we keep the original response
        res.status(StatusCode.OK).json(response.data);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch events by IDs"
      });
    }
  }

  async getRevenueStats(_req: Request, res: Response): Promise<void> {
    try {
      const response = await this.revenueDistributionService.getRevenueStats();
  
      if (response.success) {
        const responseData = new RevenueStatsDto(response.data);
        res.status(StatusCode.OK).json(responseData);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch revenue statistics"
      });
    }
  }

  async getRevenueByDateRange(req: Request, res: Response): Promise<void> {
    try {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const isDistributed = req.query.is_distributed === 'true';
      
      if (!startDate || !endDate) {
        res.status(StatusCode.BAD_REQUEST).json({
          success: false,
          message: "Start date and end date are required"
        });
        return;
      }
  
      const response = await this.revenueDistributionService.getRevenueByDateRange(
        startDate, 
        endDate, 
        page, 
        limit,
        isDistributed
      );
  
      if (response.success) {
        const responseData = new PaginatedRevenueDistributionDto(response.data);
        res.status(StatusCode.OK).json(responseData);
      } else {
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
          success: false,
          message: response.message
        });
      }
    } catch (error) {
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: "Failed to fetch revenue by date range"
      });
    }
  }
}