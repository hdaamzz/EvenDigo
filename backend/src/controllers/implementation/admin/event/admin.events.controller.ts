import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import { IEventsAdminService } from '../../../../services/interfaces/IEvents.admin.service';
import StatusCode from '../../../../types/statuscode';
import { IEventsAdminController } from '../../../../controllers/interfaces/Admin/Event/IEvents.admin.controller';
import { ServiceResponse } from '../../../../models/interfaces/auth.interface';
import { AdminEventDTO, AdminEventListDTO } from '../../../../dto/admin/event/event.dto';

@injectable()
export class AdminEventsController implements IEventsAdminController {

    constructor(
        @inject("AdminEventsService") private adminEventsService: IEventsAdminService,
    ) { }

    async fetchAllEvents(req: Request, res: Response): Promise<void> {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 9;
        const search = req.query.search as string || '';
        const filter = req.query.filter as string || 'all';

        const response: ServiceResponse<{
            events: AdminEventListDTO[];
            total: number;
            currentPage: number;
            totalPages: number;
        }> = await this.adminEventsService.fetchAllEvents(page, limit, search, filter);

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

            if (status === undefined || typeof status !== 'boolean') {
                res.status(StatusCode.BAD_REQUEST).json({
                    success: false,
                    message: "Status must be a boolean value"
                });
                return;
            }

            const response: ServiceResponse<AdminEventDTO> = await this.adminEventsService.updateEventStatus(eventId, status);

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