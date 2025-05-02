import { ServiceResponse } from "../../../models/interfaces/auth.interface";
import { EventDocument } from "../../../models/interfaces/event.interface";
import { inject, injectable } from "tsyringe";
import { IDashboardRepository } from "../../../../src/repositories/interfaces/IEvent.repository";
import { IEventsAdminService } from "../../../../src/services/interfaces/IEvents.admin.service";

@injectable()
export class AdminEventsService implements IEventsAdminService{
    constructor(
        @inject("DashboardRepository") private eventRepository: IDashboardRepository

    ) {}

    async fetchAllEvents(page: number = 1, limit: number = 9): Promise<ServiceResponse<EventDocument[]>> {
        try {
            const events: EventDocument[] = await this.eventRepository.findAllEventsWithPagination(page, limit);
            return {
                success: true,
                message: "Events fetched successfully",
                data: events,
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to fetch events",
            };
        }
    }

    async updateEventStatus(eventId: string, status: boolean): Promise<ServiceResponse<EventDocument>> {
        try {
            const updatedEvent = await this.eventRepository.updateEvent(eventId, { status });
            
            if (!updatedEvent) {
                return {
                    success: false,
                    message: "Event not found",
                };
            }
            
            return {
                success: true,
                message: `Event ${status ? 'listed' : 'unlisted'} successfully`,
                data: updatedEvent,
            };
        } catch (error) {
            return {
                success: false,
                message: "Failed to update event status",
            };
        }
    }
}