import { Schema } from 'mongoose';
import { EventDocument } from '../models/interfaces/event.interface';
import { EventModel } from '../models/EventModel';
import { IDashboardRepository } from './interfaces/IEvent.repository';
import { injectable } from 'tsyringe';


@injectable()
export class DashboardRepository implements IDashboardRepository {
  async createEvent(eventData: Partial<EventDocument>): Promise<EventDocument> {
    const event = new EventModel(eventData);
    return await event.save();
  }

  async findEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return await EventModel.find({ user_id: userId }).sort({ createdAt: -1 });
  }

  async findAllEventWithoutCurrentUser(eventId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return await EventModel.find({ user_id: { $ne: eventId },status:true }).sort({ createdAt: -1 });
  }

  async findEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    return await EventModel.findById({ _id: eventId }).populate('user_id');
  }

  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null> {    
    return await EventModel.findByIdAndUpdate(
      eventId,
      updateData,
      { new: true, runValidators: true }
    );
  }

  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    const result = await EventModel.findByIdAndDelete(eventId);
    return !!result;
  }
  async findAllEvents(): Promise<EventDocument[]> {
    return EventModel.find({}).sort({ createdAt: -1 }).populate('user_id')
  }

  async findAllEventsWithPagination(page: number = 1, limit: number = 9): Promise<EventDocument[]> {
    const skip = (page - 1) * limit;
    
    return EventModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id');
  }
}