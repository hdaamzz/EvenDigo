import { ServiceResponse } from "../../models/interfaces/auth.interface";
import { EventDocument } from "../../models/interfaces/event.interface";

export interface IEventsAdminService {
  fetchAllEvents(): Promise<ServiceResponse<EventDocument[]>>;
}
