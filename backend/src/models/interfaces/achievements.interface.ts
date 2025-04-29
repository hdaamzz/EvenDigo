import { Schema } from 'mongoose';

export interface IAchievement {
  _id?: Schema.Types.ObjectId;
  title: string;
  description: string;
  category: 'event' | 'user' | 'sales' | 'engagement' | 'other';
  criteria: string; 
  threshold: number; 
  icon: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAchievementPagination {
  achievements: IAchievement[];
  totalCount: number;
  hasMore: boolean;
}