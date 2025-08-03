import { Schema, PipelineStage } from 'mongoose';
import { EventDocument } from '../../models/interfaces/event.interface';
import { EventModel } from '../../models/EventModel';
import { IEventRepository } from '../interfaces/IEvent.repository';
import { injectable } from 'tsyringe';
import { BadRequestException } from '../../error/error-handlers';
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

  async findCompletedEventByUserIdWithPagination(
      userId: Schema.Types.ObjectId | string, 
      page: number = 1, 
      limit: number = 10
    ): Promise<EventDocument[]> {
      const now = new Date();
      const skip = (page - 1) * limit;
      
      return await this.model
        .find({
          user_id: userId,
          endingDate: { $lt: now }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    }

    async findOngoingEventByUserIdWithPagination(
      userId: Schema.Types.ObjectId | string, 
      page: number = 1, 
      limit: number = 10
    ): Promise<EventDocument[]> {
      const now = new Date();
      const skip = (page - 1) * limit;
      
      return await this.model
        .find({
          user_id: userId,
          startDate: { $lte: now },
          endingDate: { $gte: now }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
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
    return await this.model.findById(eventId).populate('user_id').exec();
  }
  

  async findEventByIdWithoutPopulateUser(eventId: Schema.Types.ObjectId | string): Promise<EventDocument | null> {
    return await this.model.findById(eventId).exec();
  }

  async updateEvent(eventId: Schema.Types.ObjectId | string, updateData: Partial<EventDocument>): Promise<EventDocument | null> {
    return await this.updateById(eventId, updateData);
  }

  async deleteEvent(eventId: Schema.Types.ObjectId | string): Promise<boolean> {
    return await this.deleteById(eventId);
  }

  async findAllEvents(): Promise<EventDocument[]> {
    return await this.model.find({}).sort({ createdAt: -1 }).populate('user_id').exec();
  }

  async findAllEventsWithPagination(
    page: number = 1,
    limit: number = 9,
    search: string = '',
    filter: string = 'all'
  ): Promise<{
    data: EventDocument[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    let searchQuery: any = {};

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      searchQuery = {
        $or: [
          { eventTitle: searchRegex },
          { eventType: searchRegex },
          { city: searchRegex },
          { eventDescription: searchRegex },
        ]
      };
    }

    let dateFilterQuery: any = {};
    if (filter !== 'all') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (filter === 'current') {
        dateFilterQuery = {
          startDate: { $gte: currentDate }
        };
      } else if (filter === 'completed') {
        dateFilterQuery = {
          startDate: { $lt: currentDate }
        };
      }
    }

    const finalQuery = { ...searchQuery, ...dateFilterQuery };

    if (search.trim()) {
      return await this.findWithAggregationPagination(search, filter, page, limit);
    }

    const result = await this.findWithPagination(finalQuery, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: 'user_id'
    });

    return {
      data: result.data,
      total: result.total,
      currentPage: result.page,
      totalPages: result.pages
    };
  }

  private async findWithAggregationPagination(
    search: string,
    filter: string,
    page: number,
    limit: number
  ): Promise<{
    data: EventDocument[];
    total: number;
    currentPage: number;
    totalPages: number;
  }> {
    const searchRegex = new RegExp(search.trim(), 'i');
    const skip = (page - 1) * limit;

    let dateMatch: any = {};
    if (filter !== 'all') {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);

      if (filter === 'current') {
        dateMatch = { startDate: { $gte: currentDate } };
      } else if (filter === 'completed') {
        dateMatch = { startDate: { $lt: currentDate } };
      }
    }

    const pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_id'
        }
      },
      {
        $unwind: { path: '$user_id' }
      },
      {
        $match: {
          ...dateMatch,
          $or: [
            { eventTitle: searchRegex },
            { eventType: searchRegex },
            { city: searchRegex },
            { eventDescription: searchRegex },
            { 'user_id.name': searchRegex }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ];

    const totalPipeline: PipelineStage[] = [...pipeline, { $count: 'total' }];
    const totalResult = await this.model.aggregate(totalPipeline);
    const total = totalResult.length > 0 ? totalResult[0].total : 0;

    const dataPipeline: PipelineStage[] = [
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ];

    const data = await this.model.aggregate(dataPipeline);
    const totalPages = Math.ceil(total / limit);

    return {
      data: data as EventDocument[],
      total,
      currentPage: page,
      totalPages
    };
  }

  async findEventsByIds(eventIds: (Schema.Types.ObjectId | string)[]): Promise<EventDocument[]> {
    return await this.model.find({ _id: { $in: eventIds } }).populate('user_id').exec();
  }

  async findDocumentCount(user_id: Schema.Types.ObjectId | string): Promise<number> {
    return await this.count({ user_id });
  }

  async updateTicketQuantities(eventId: Schema.Types.ObjectId | string, tickets: { [type: string]: number }): Promise<EventDocument | null> {

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
        } else {
          const addQuantity = Math.abs(quantity);
          ticket.quantity += addQuantity;
        }
      }
    }

    return await event.save();
  }
  async findNotStartedEventByUserIdWithPagination(
  userId: Schema.Types.ObjectId | string,
  skip: number,
  limit: number
): Promise<EventDocument[]> {
  const now = new Date();
  return await this.model
    .find({
      user_id: userId,
      startDate: { $gt: now }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .exec();
}

async findUpcomingEventsWithoutCurrentUserPaginated(
  userId: Schema.Types.ObjectId | string,
  page: number = 1,
  limit: number = 12
): Promise<{
  events: EventDocument[];
  total: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}> {
  const currentDate = new Date();
  const skip = (page - 1) * limit;
  
  const query = {
    user_id: { $ne: userId },
    status: true,
    endingDate: { $gt: currentDate }
  };

  const [events, total] = await Promise.all([
    this.model
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id')
      .exec(),
    this.model.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    events,
    total,
    currentPage: page,
    totalPages,
    hasMore
  };
}
}