import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IRevenueDistributionService } from '../../../../../src/services/interfaces/IDistribution.service';
import { IRevenueDistributionController } from 'src/controllers/interfaces/Admin/Finance/IDistribution.controller';
import StatusCode from '../../../../../src/types/statuscode';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, InternalServerErrorException, NotFoundException } from '../../../../../src/error/error-handlers';

@injectable()
export class RevenueDistributionController implements IRevenueDistributionController {
  constructor(
    @inject("RevenueDistributionService") private revenueDistributionService: IRevenueDistributionService
  ) { }

  async triggerDistributionManually(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.revenueDistributionService.processFinishedEvents();

      if (result.success) {
        ResponseHandler.success(
          res, 
          result.data, 
          `Processed ${result.data?.processed} events for revenue distribution`
        );
      } else {
        throw new InternalServerErrorException(result.message || 'Failed to trigger distribution');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        `Failed to trigger distribution`, 
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getEventDistribution(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
      const result = await this.revenueDistributionService.getDistributionByEventId(eventId);

      if (result.success) {
        ResponseHandler.success(res, result.data);
      } else {
        throw new NotFoundException(result.message || 'Distribution not found');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch distribution', 
        error instanceof NotFoundException ? StatusCode.NOT_FOUND : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getAllCompletedDistributions(_req: Request, res: Response): Promise<void> {
    try {
      const result = await this.revenueDistributionService.getAllCompletedDistributions();

      if (result.success) {
        ResponseHandler.success(res, result.data);
      } else {
        throw new InternalServerErrorException(result.message || 'Failed to fetch distributions');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch distributions');
    }
  }

  async distributeSpecificEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;
      const result = await this.revenueDistributionService.distributeEventRevenue(eventId);

      if (result.success) {
        ResponseHandler.success(res, result.data, "Event revenue distributed successfully");
      } else {
        throw new BadRequestException(result.message || 'Failed to distribute event revenue');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to distribute event revenue', 
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getDistributedRevenue(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const response = await this.revenueDistributionService.getDistributedRevenue(page, limit);

      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch distributed revenue');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch distributed revenue');
    }
  }

  async getRecentDistributedRevenue(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 5;

      const response = await this.revenueDistributionService.getRecentDistributedRevenue(limit);

      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch recent distributed revenue');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch recent distributed revenue');
    }
  }

  async getRevenueByEvent(req: Request, res: Response): Promise<void> {
    try {
      const eventId = req.params.eventId;

      const response = await this.revenueDistributionService.getRevenueByEventId(eventId);

      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch revenue by event');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch revenue by event');
    }
  }

  async getEventsByIds(req: Request, res: Response): Promise<void> {
    try {
      const ids = (req.query.ids as string || '').split(',').filter(id => id);
      
      if (!ids.length) {
        throw new BadRequestException('No event IDs provided');
      }

      const response = await this.revenueDistributionService.getEventsByIds(ids);

      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch events by IDs');
      }
    } catch (error) {
      ResponseHandler.error(
        res, 
        error, 
        'Failed to fetch events by IDs', 
        error instanceof BadRequestException ? StatusCode.BAD_REQUEST : StatusCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  async getRevenueStats(_req: Request, res: Response): Promise<void> {
    try {
      const response = await this.revenueDistributionService.getRevenueStats();
  
      if (response.success) {
        ResponseHandler.success(res, response.data);
      } else {
        throw new InternalServerErrorException(response.message || 'Failed to fetch revenue statistics');
      }
    } catch (error) {
      ResponseHandler.error(res, error, 'Failed to fetch revenue statistics');
    }
  }
}