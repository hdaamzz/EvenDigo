import { Request, Response } from 'express';
import { EventDocument } from '../../../models/interfaces/event.interface';
import { ServiceResponse } from '../../../models/interfaces/auth.interface';
import { IEventsAdminController } from '../../../../src/controllers/interfaces/IEvents.admin.controller';
import { inject, injectable } from 'tsyringe';
import { IEventsAdminService } from '../../../../src/services/interfaces/IEvents.admin.service';
import StatusCode from '../../../../src/types/statuscode';

@injectable()
export class AdminEventsController implements IEventsAdminController{
    
    constructor(
        @inject("AdminEventsService") private adminEventsService: IEventsAdminService,
    ) {}
    async fetchAllEvents(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;
        
        const response: ServiceResponse<EventDocument[]> = await this.adminEventsService.fetchAllEvents(page, limit);
        if (response.success) {
            res.status(StatusCode.OK).json(response.data);
        } else {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
        }
    }

    async updateEventStatus(req: Request, res: Response): Promise<void> {
        try {
            const eventId = req.params.eventId;
            const { status } = req.body;
            
            // Validate input
            if (status === undefined || typeof status !== 'boolean') {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Status must be a boolean value"
                });
                return;
            }
            
            const response = await this.adminEventsService.updateEventStatus(eventId, status);
            
            if (response.success) {
                res.status(StatusCode.OK).json(response);
            } else {
                res.status(StatusCode.INTERNAL_SERVER_ERROR).json(response);
            }
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Failed to update event status"
            });
        }
    }

}