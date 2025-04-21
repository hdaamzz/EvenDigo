import { Schema } from 'mongoose';
import { IAchievement, IAchievementPagination } from '../../models/interfaces/achievements.interface';

export interface IAchievementRepository {
    findAllAchievements(): Promise<IAchievement[]>;
    findAllAchievementsPagination(page?: number, limit?: number): Promise<IAchievementPagination>;
    findAchievementById(achievementId: Schema.Types.ObjectId | string): Promise<IAchievement | null>;
    findAchievementByTitle(title: string): Promise<IAchievement | null>;
    createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement>;
    updateAchievement(achievementId: Schema.Types.ObjectId | string, updateData: Partial<IAchievement>): Promise<IAchievement | null>;
    deleteAchievement(achievementId: Schema.Types.ObjectId | string): Promise<void>;
}