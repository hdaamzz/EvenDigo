import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IEventsAdminService } from '../../../../../src/services/interfaces/IEvents.admin.service';
import StatusCode from '../../../../../src/types/statuscode';
import { IEventsAdminController } from '../../../../../src/controllers/interfaces/Admin/Event/IEvents.admin.controller';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { 
  BadRequestException, 
  InternalServerErrorException, 
  NotFoundException 
} from '../../../../../src/error/error-handlers';

@injectable()
export class AdminEventsController implements IEventsAdminController {
    
    constructor(
        @inject("AdminEventsService") private adminEventsService: IEventsAdminService,
    ) {}

    async fetchAllEvents(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 9;
            
            const response = await this.adminEventsService.fetchAllEvents(page, limit);
            
            if (response.success) {
                ResponseHandler.success(
                    res, 
                    response.data, 
                    'Events fetched successfully',
                    StatusCode.OK
                );
            } else {
                throw new InternalServerErrorException(response.message || 'Failed to fetch events');
            }
        } catch (error) {
            ResponseHandler.error(
                res,
                error,
                'Failed to fetch events',
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateEventStatus(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const { status } = req.body;
            
            if (status === undefined || typeof status !== 'boolean') {
                throw new BadRequestException('Status must be a boolean value');
            }
            
            const response = await this.adminEventsService.updateEventStatus(eventId, status);
            
            if (response.success) {
                ResponseHandler.success(
                    res,
                    response.data,
                    status ? 'Event activated successfully' : 'Event deactivated successfully',
                    StatusCode.OK
                );
            } else {
                if (response.message?.includes('not found')) {
                    throw new NotFoundException(response.message);
                } else {
                    throw new InternalServerErrorException(response.message || 'Failed to update event status');
                }
            }
        } catch (error) {
            if (error instanceof BadRequestException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Invalid request data',
                    StatusCode.BAD_REQUEST
                );
            } else if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res,
                    error,
                    'Event not found',
                    StatusCode.NOT_FOUND
                );
            } else {
                ResponseHandler.error(
                    res,
                    error,
                    'Failed to update event status',
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}