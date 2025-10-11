import { Schema } from 'mongoose';
import { AchievementEntityDTO } from '../../mappers/admin/acheivement/achievement.mapper';

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

export interface PaginationInfo {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
}

export interface AchievementRepositoryPaginationResult {
  achievements: AchievementEntityDTO[];
  totalCount: number;
  hasMore: boolean;
}