import { Schema } from "mongoose";
import { EventDocument } from "../../models/interfaces/event.interface";

export interface IEventRepository {
  createEvent(eventData: Partial<EventDocument>): Promise<EventDocument>;
  findEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null>;
  deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean>;
  findAllEvents(): Promise<EventDocument[]>;
  findAllEventsWithPagination(page: number, limit: number): Promise<EventDocument[]>;
  findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]>;
  findDocumentCount(user_id: Schema.Types.ObjectId | string): Promise<number>;
}
