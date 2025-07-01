import { ServiceResponse } from "../../../models/interfaces/auth.interface";
import { inject, injectable } from "tsyringe";
import { IEventRepository } from "../../../../src/repositories/interfaces/IEvent.repository";
import { IEventsAdminService } from "../../../../src/services/interfaces/IEvents.admin.service";
import { AdminEventDTO, AdminEventListDTO } from "../../../../src/dto/admin/event/event.dto";
import { AdminEventMapper } from "../../../../src/dto/admin/event/admin-event.mapper";


@injectable()
export class AdminEventsService implements IEventsAdminService {
    constructor(
        @inject("EventRepository") private eventRepository: IEventRepository
    ) {}

    async fetchAllEvents(
    page: number = 1, 
    limit: number = 9, 
    search: string = '', 
    filter: string = 'all'
): Promise<ServiceResponse<{
    events: AdminEventListDTO[];
    total: number;
    currentPage: number;
    totalPages: number;
}>> {
    try {
        const result = await this.eventRepository.findAllEventsWithPagination(page, limit, search, filter);
        const eventDTOs = AdminEventMapper.toAdminEventListDTOArray(result.data);
        
        return {
            success: true,
            message: "Events fetched successfully",
            data: {
                events: eventDTOs,
                total: result.total,
                currentPage: result.currentPage,
                totalPages: result.totalPages
            },
        };
    } catch (error) {
        console.error('Error fetching events:', error);
        return {
            success: false,
            message: "Failed to fetch events",
        };
    }
}

    async updateEventStatus(eventId: string, status: boolean): Promise<ServiceResponse<AdminEventDTO>> {
        try {
            const updatedEvent = await this.eventRepository.updateEvent(eventId, { status });
            
            if (!updatedEvent) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            
            const eventDTO = AdminEventMapper.toAdminEventDTO(updatedEvent);
            
            return {
                success: true,
                message: `Event ${status ? 'listed' : 'unlisted'} successfully`,
                data: eventDTO,
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to update event status",
            };
        }
    }
}