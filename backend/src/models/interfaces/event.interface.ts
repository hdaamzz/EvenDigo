import { Document, Schema } from 'mongoose';
import { IUser } from './auth.interface';

interface Ticket {
  type: string;
  price: number;
  quantity:number;
}

export interface EventDocument extends Document {
  user_id: Schema.Types.ObjectId ;
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: Date;
  startTime: string;
  endingDate: Date;
  endingTime: string;
  eventVisibility: string;
  venueName: string;
  venueAddress: string;
  city: string;
  tickets: Ticket[];
  ageRestriction: boolean;
  mainBanner: string;
  promotionalImage: string;
  status?:boolean;
  createdAt: Date;
  updatedAt: Date;
}


export interface IEvent {
  _id: string;
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: string;
  endingDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  city: string;
  eventVisibility: string;
  promotionalImage: string;
  ageRestriction: boolean;
  tickets: Ticket[];
  user_id: string;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}

export interface IEventUserPopulated {
  _id: string;
  eventTitle: string;
  eventDescription: string;
  eventType: string;
  startDate: string;
  endingDate: string;
  startTime: string;
  endTime: string;
  venueName: string;
  city: string;
  eventVisibility: string;
  promotionalImage: string;
  ageRestriction: boolean;
  tickets: Ticket[];
  user_id: IUser;
  createdAt: string;
  updatedAt: string;
  status: boolean;
}