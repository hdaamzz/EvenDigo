import { EventDocument } from '../../../models/interfaces/event.interface';
import { Schema } from 'mongoose';
import { inject, injectable } from 'tsyringe';
import { IDashboardService } from '../../../../src/services/interfaces/IDashboard.service';
import { IDashboardRepository } from '../../../../src/repositories/interfaces/IEvent.repository';


@injectable()
export class DashboardService implements IDashboardService{
  constructor(
    @inject("DashboardRepository") private dashboardRepository: IDashboardRepository,
  ) {}

  async createEvent(eventData: any): Promise<EventDocument> {
    return this.dashboardRepository.createEvent(eventData);
  }

  async getEventsByUserId(userId: Schema.Types.ObjectId | string): Promise<EventDocument[]> {
    return this.dashboardRepository.findEventByUserId(userId);
  }

  async getEventById(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    return this.dashboardRepository.findEventById(eventId);
  }

  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: any): Promise<EventDocument | null> {
    return this.dashboardRepository.updateEvent(eventId, updateData);
  }

  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    return this.dashboardRepository.deleteEvent(eventId);
  }
}