import { IAchievement } from "src/models/interfaces/achievements.interface";

export interface ServicePaginationResult {
    achievements: IAchievement[];
    totalCount: number;
    hasMore: boolean;
}

export interface IAchievementAdminService {
    getAllAchievements(): Promise<IAchievement[]>;
    getAllAchievementsWithPagination(page: number, limit: number): Promise<ServicePaginationResult>;
    getAchievementById(achievementId: string): Promise<IAchievement>;
    createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement>;
    updateAchievement(achievementId: string, updateData: Partial<IAchievement>): Promise<IAchievement | IAchievement[]>;
    activateAchievement(achievementId: string): Promise<IAchievement | null>;
    deactivateAchievement(achievementId: string): Promise<IAchievement | null>;
    deleteAchievement(achievementId: string): Promise<void>;
}
