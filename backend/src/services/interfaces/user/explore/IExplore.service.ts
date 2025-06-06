import { Schema } from 'mongoose';
import { EventDocument } from '../../../../models/interfaces/event.interface';

export interface IExploreService {
  getEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]>;
  getEvent(id: Schema.Types.ObjectId | string): Promise<EventDocument | null>;
}