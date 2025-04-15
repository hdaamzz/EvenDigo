import { ServiceResponse } from "../../models/interfaces/auth.interface";
import { EventDocument } from "../../models/interfaces/event.interface";

export interface IEventsAdminService {
  fetchAllEvents(page: number, limit: number): Promise<ServiceResponse<EventDocument[]>> 
  updateEventStatus(eventId: string, status: boolean): Promise<ServiceResponse<EventDocument>>;

}
