import { Schema } from 'mongoose';
import { EventDocument } from '../../../../models/interfaces/event.interface';
import { IBooking } from '../../../../models/interfaces/booking.interface';

export interface IEventService {
  createEvent(eventData: Partial<EventDocument>): Promise<EventDocument>;
  getEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getOrganizedEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getOngoingEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getParticipatedEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<IBooking[]>;
  getEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  verifyEventOwnership(eventId: Schema.Types.ObjectId | string, userId: Schema.Types.ObjectId | string): Promise<void>;
  updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null>;
  deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean>;
  findAllEvents(): Promise<EventDocument[]>;
   findAllEventsWithPagination(page: number, limit: number): Promise<{ data: EventDocument[]; total: number; currentPage: number; totalPages: number; }>
  findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]>;
  findDocumentCount(userId: Schema.Types.ObjectId | string): Promise<number>;
}