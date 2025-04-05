import { ServiceResponse } from "../../../models/interfaces/auth.interface";
import { EventDocument } from "../../../models/interfaces/event.interface";
import { inject, injectable } from "tsyringe";
import { IDashboardRepository } from "../../../../src/repositories/interfaces/IEvent.repository";

@injectable()
export class AdminEventsService {


    constructor(
        @inject("DashboardRepository") private eventRepository: IDashboardRepository

    ) {}

    async fetchAllEvents(): Promise<ServiceResponse<EventDocument[]>> {
        try {
        const events:EventDocument[] = await this.eventRepository.findAllEvents();
        return {
            success: true,
            message: "Users fetched successfully",
            data: events,
        };
        } catch (error) {
        return {
            success: false,
            message: "Failed to fetch users",
        };
        }
    }
}