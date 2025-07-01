import { Schema } from 'mongoose';
import { NotFoundException } from '../../../../error/error-handlers';
import { EventDocument } from '../../../../models/interfaces/event.interface';
import { IEventRepository } from '../../../../repositories/interfaces/IEvent.repository';
import { IProfileEventService } from '../../../../services/interfaces/user/profile/IProfileEvent.service';
import { inject, injectable } from 'tsyringe';


@injectable()
export class ProfileEventService implements IProfileEventService {
  constructor(
    @inject("EventRepository") private eventRepository: IEventRepository,
  ) {}

  async getUserEvents(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    try {
      const events = await this.eventRepository.findNotStartedEventByUserId(userId);      
      return events;
    } catch (error) {
      throw new Error(`Failed to fetch user events: ${(error as Error).message}`);
    }
  }

  async getEvent(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    try {
      const event = await this.eventRepository.findEventById(eventId);
      
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
      
      return event;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to fetch event: ${(error as Error).message}`);
    }
  }

  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null> {
    try {
      const existingEvent = await this.eventRepository.findEventById(eventId);
      
      if (!existingEvent) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
      
      const updatedEvent = await this.eventRepository.updateEvent(eventId, updateData);
      return updatedEvent;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to update event: ${(error as Error).message}`);
    }
  }
  
  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    try {
      const existingEvent = await this.eventRepository.findEventById(eventId);
      
      if (!existingEvent) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }
      
      const result = await this.eventRepository.deleteEvent(eventId);
      return result;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to delete event: ${(error as Error).message}`);
    }
  }
}
