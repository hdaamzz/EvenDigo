import { Request, Response } from 'express';
import { EventDocument } from '../../../models/interfaces/event.interface';
import { ServiceResponse } from '../../../models/interfaces/auth.interface';
import { IEventsAdminController } from '../../../../src/controllers/interfaces/IEvents.admin.controller';
import { inject, injectable } from 'tsyringe';
import { IEventsAdminService } from '../../../../src/services/interfaces/IEvents.admin.service';

@injectable()
export class AdminEventsController implements IEventsAdminController{
    
    constructor(
        @inject("AdminEventsService") private adminEventsService: IEventsAdminService,
    ) {}
    async fetchAllEvents(_req: Request, res: Response): Promise<void> {
        const response: ServiceResponse<EventDocument[]> = await this.adminEventsService.fetchAllEvents();
        if (response.success) {
            res.status(200).json(response.data);
        } else {
            res.status(500).json(response);
        }
    }

}