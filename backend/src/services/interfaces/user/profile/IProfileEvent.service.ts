import { Schema } from 'mongoose';
import { EventDocument } from '../../../../models/interfaces/event.interface';

export interface IProfileEventService {
  getUserEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEvent(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
  updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null>;
  deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean>;
}
