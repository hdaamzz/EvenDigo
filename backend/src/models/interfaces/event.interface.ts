import { Document, Schema } from 'mongoose';

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