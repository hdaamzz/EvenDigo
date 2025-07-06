import { Schema } from 'mongoose';
import { AchievementEntityDTO } from '../../mappers/admin/acheivement/achievement.mapper';

export interface IAchievementRepositoryPaginationResult {
    achievements: AchievementEntityDTO[];
    totalCount: number;
    hasMore: boolean;
}

export interface IAchievementRepository {
    findAllAchievements(): Promise<AchievementEntityDTO[]>;
    findAllAchievementsPagination(page?: number, limit?: number): Promise<IAchievementRepositoryPaginationResult>;
    findAchievementById(achievementId: Schema.Types.ObjectId | string): Promise<AchievementEntityDTO | null>;
    findAchievementByTitle(title: string): Promise<AchievementEntityDTO | null>;
    createAchievement(achievementData: Partial<AchievementEntityDTO>): Promise<AchievementEntityDTO>;
    updateAchievement(achievementId: Schema.Types.ObjectId | string, updateData: Partial<AchievementEntityDTO>): Promise<AchievementEntityDTO | null>;
    deleteAchievement(achievementId: Schema.Types.ObjectId | string): Promise<void>;
}