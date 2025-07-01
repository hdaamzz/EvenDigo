import { ServiceResponse } from "../../models/interfaces/auth.interface";
import { AdminEventDTO, AdminEventListDTO } from "../../dto/admin/event/event.dto";

export interface IEventsAdminService {
    fetchAllEvents(
    page: number , 
    limit: number, 
    search: string , 
    filter: string 
): Promise<ServiceResponse<{
    events: AdminEventListDTO[];
    total: number;
    currentPage: number;
    totalPages: number;
}>> 
    updateEventStatus(eventId: string, status: boolean): Promise<ServiceResponse<AdminEventDTO>>;
}