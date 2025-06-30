import { Schema } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';
import { EventModel } from '../../models/EventModel';
import { IEventRepository } from '../interfaces/IEvent.repository';
import { injectable } from 'tsyringe';
import { BadRequestException } from '../../../src/error/error-handlers';
import { BaseRepository } from '../BaseRepository';

@injectable()
export class EventRepository extends BaseRepository<EventDocument> implements IEventRepository {
  
  constructor() {
    super(EventModel);
  }

  async createEvent(eventData: Partial<EventDocument>): Promise<EventDocument> {
    return await this.create(eventData);
  }

  async findEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return await this.findWithSort({ user_id: userId }, { createdAt: -1 });
  }

  async findCompletedEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await this.findWithSort({
      user_id: userId,
      endingDate: { $lt: now }
    }, { createdAt: -1 });
  }

  async findOngoingEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await this.findWithSort({
      user_id: userId,
      startDate: { $lte: now },
      endingDate: { $gte: now }
    }, { createdAt: -1 });
  }

  async findNotStartedEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await this.findWithSort({
      user_id: userId,
      startDate: { $gt: now }
    }, { createdAt: -1 });
  }

  async findCurrentEventByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const now = new Date();
    return await this.findWithSort({
      user_id: userId,
      endingDate: { $gte: now }
    }, { createdAt: -1 });
  }

  async findAllEventWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return await this.findWithSort({
      user_id: { $ne: userId },
      status: true
    }, { createdAt: -1 });
  }

  async findUpcomingEventsWithoutCurrentUser(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    const currentDate = new Date();
    return await this.findWithSort({
      user_id: { $ne: userId },
      status: true,
      endingDate: { $gt: currentDate }
    }, { createdAt: -1 });
  }

  async findEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    // Use mongoose query builder for populate since BaseRepository doesn't handle it in findById
    return await this.model.findById(eventId).populate('user_id').exec();
  }

  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null> {
    return await this.updateById(eventId, updateData);
  }

  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    return await this.deleteById(eventId);
  }

  async findAllEvents(): Promise<EventDocument[]> {
    // Use mongoose query builder for populate
    return await this.model.find({}).sort({ createdAt: -1 }).populate('user_id').exec();
  }

  async findAllEventsWithPagination(page: number = 1, limit: number = 9): Promise<EventDocument[]> {
    const result = await this.findWithPagination({}, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: 'user_id'
    });
    return result.data;
  }

  async findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]> {
    // Use mongoose query builder for populate
    return await this.model.find({ _id: { $in: eventIds } }).populate('user_id').exec();
  }

  async findDocumentCount(user_id: Schema.Types.ObjectId | string): Promise<number> {
    return await this.count({ user_id });
  }

  async updateTicketQuantities(eventId: Schema.Types.ObjectId | string, tickets: { [type: string]: number }): Promise<EventDocument | null> {
    console.log('Updating ticket quantities:', tickets);
    
    const event = await this.findById(eventId);
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