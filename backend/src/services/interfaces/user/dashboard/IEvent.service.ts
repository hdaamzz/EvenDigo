import { Schema } from 'mongoose';
import { EventDocument } from '../../../../../src/models/interfaces/event.interface';

export interface IEventService {
  createEvent(eventData: Partial<EventDocument>): Promise<EventDocument>;
  getEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  verifyEventOwnership(eventId: Schema.Types.ObjectId | string, userId: Schema.Types.ObjectId | string): Promise<void>;
  updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null>;
  deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean>;
  findAllEvents(): Promise<EventDocument[]>;
  findAllEventsWithPagination(page: number, limit: number): Promise<EventDocument[]>;
  findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]>;
  findDocumentCount(userId: Schema.Types.ObjectId | string): Promise<number>;
}