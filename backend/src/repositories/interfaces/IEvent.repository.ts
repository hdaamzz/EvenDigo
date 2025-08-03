import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';

export interface IEventRepository {
  createEvent(eventData: Partial<EventDocument>): Promise<EventDocument>;
  findEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findCompletedEventByUserIdWithPagination(userId: Schema.Types.ObjectId | string, skip: number, limit: number): Promise<EventDocument[]>
  findOngoingEventByUserIdWithPagination(userId: Schema.Types.ObjectId | string, skip: number, limit: number): Promise<EventDocument[]>
  findNotStartedEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findCurrentEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  findEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  findEventByIdWithoutPopulateUser(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null>;
  deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean>;
  findAllEvents(): Promise<EventDocument[]>;
  findAllEventsWithPagination(
    page: number, 
    limit: number, 
    search: string , 
    filter: string
): Promise<{
    data: EventDocument[];
    total: number;
    currentPage: number;
    totalPages: number;
}>
  findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]>;
  findDocumentCount(user_id: Schema.Types.ObjectId | string): Promise<number>;
  updateTicketQuantities(eventId: Schema.Types.ObjectId | string, tickets: { [type: string]: number }): Promise<EventDocument | null>;
  findNotStartedEventByUserIdWithPagination(
  userId: Schema.Types.ObjectId | string,
  skip: number,
  limit: number
): Promise<EventDocument[]> 

findUpcomingEventsWithoutCurrentUserPaginated(
  userId: Schema.Types.ObjectId | string,
  page: number,
  limit: number
): Promise<{
  events: EventDocument[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}> 
}