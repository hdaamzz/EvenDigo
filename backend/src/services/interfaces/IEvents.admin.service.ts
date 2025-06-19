import { ServiceResponse } from "../../models/interfaces/auth.interface";
import { AdminEventDTO, AdminEventListDTO } from "../../dto/admin/event/event.dto";

export interface IEventsAdminService {
    fetchAllEvents(page?: number, limit?: number): Promise<ServiceResponse<AdminEventListDTO[]>>;
    updateEventStatus(eventId: string, status: boolean): Promise<ServiceResponse<AdminEventDTO>>;
}