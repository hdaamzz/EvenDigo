import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';

export interface IDashboardService {
  createEvent(eventData: any): Promise<EventDocument>;
  getEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  updateEvent(eventId: Schema.Types.ObjectId | string, updateData: any): Promise<EventDocument | null>;
  deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean>;
}
