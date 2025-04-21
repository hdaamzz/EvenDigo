import { Schema } from 'mongoose';

export interface IAchievement {
    _id?: Schema.Types.ObjectId | string;
    title: string;
    description: string;
    category: string;
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