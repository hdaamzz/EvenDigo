import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';
import { EventModel } from '../../models/EventModel';
import { IEventRepository } from '../interfaces/IEvent.repository';
import { injectable } from 'tsyringe';
import { BadRequestException } from '../../../src/error/error-handlers';

@injectable()
export class EventRepository implements IEventRepository {
  async createEvent(eventData: Partial<EventDocument>): Promise<EventDocument> {
    const event = new EventModel(eventData);
    return await event.save();
  }

  async findEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return await EventModel.find({ user_id: userId }).sort({ createdAt: -1 });
  }

  async findCompletedEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await EventModel.find({
      user_id: userId,
      endingDate: { $lt: now }
    }).sort({ createdAt: -1 });
  }
  

  async findOngoingEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await EventModel.find({
      user_id: userId,
      startDate: { $gt: now }
    }).sort({ createdAt: -1 });
  }

  async findNotStartedEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await EventModel.find({
      user_id: userId,
      startDate: { $gt: now } 
    }).sort({ createdAt: -1 });
  }

  async findCurrentEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await EventModel.find({
      user_id: userId,
      endingDate: { $gte: now } 
    }).sort({ createdAt: -1 });
  }

  async findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return await EventModel.find({ user_id: { $ne: userId }, status: true }).sort({ createdAt: -1 });
  }
  
  async findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const currentDate = new Date();
  
    return await EventModel.find({
      user_id: { $ne: userId },
      status: true,
      endingDate: { $gt: currentDate }
    }).sort({ createdAt: -1 });
  }

  async findEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    return await EventModel.findById(eventId).populate('user_id');
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
    return EventModel.find({}).sort({ createdAt: -1 }).populate('user_id');
  }

  async findAllEventsWithPagination(page: number = 1, limit: number = 9): Promise<EventDocument[]> {
    const skip = (page - 1) * limit;
    
    return EventModel.find({})
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id');
  }
  
  async findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]> {
    return await EventModel.find({ _id: { $in: eventIds } }).populate('user_id');
  }
  
  async findDocumentCount(user_id: Schema.Types.ObjectId | string): Promise<number> {
    return await EventModel.countDocuments({ user_id }).exec();
  }

  async updateTicketQuantities(eventId: Schema.Types.ObjectId | string, tickets: { [type: string]: number }): Promise<EventDocument | null> {
    console.log('Updating ticket quantities:', tickets);
    
    const event = await EventModel.findById(eventId);
    if (!event) {
      throw new BadRequestException('Event not found');
    }

    for (const [type, quantity] of Object.entries(tickets)) {
      if (quantity !== 0) { 
        const ticket = event.tickets.find(t => t.type.toLowerCase() === type.toLowerCase());
        
        if (!ticket) {
          throw new BadRequestException(`Ticket type ${type} not found`);
        }
        
        if (quantity > 0) {
          if (ticket.quantity < quantity) {
            throw new BadRequestException(`Insufficient tickets available for ${type}. Available: ${ticket.quantity}, Requested: ${quantity}`);
          }
          ticket.quantity -= quantity;
          console.log(`Deducted ${quantity} ${type} tickets. Remaining: ${ticket.quantity}`);
        } else {
          const addQuantity = Math.abs(quantity); 
          ticket.quantity += addQuantity;
          console.log(`Restored ${addQuantity} ${type} tickets. New total: ${ticket.quantity}`);
        }
      }
    }

    return await event.save();
  }
}