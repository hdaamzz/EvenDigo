import { IAchievement } from "../../models/interfaces/achievements.interface";

export interface IAchievementAdminService {
    getAllAchievements(): Promise<IAchievement[]>;
    getAllAchievementsWithPagination(page?: number, limit?: number): Promise<{achievements: IAchievement[], totalCount: number, hasMore: boolean}>;
    getAchievementById(achievementId: string): Promise<IAchievement>;
    createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement>;
    updateAchievement(achievementId: string, updateData: Partial<IAchievement>): Promise<IAchievement | null>;
    activateAchievement(achievementId: string): Promise<IAchievement | null>;
    deactivateAchievement(achievementId: string): Promise<IAchievement | null>;
    deleteAchievement(achievementId: string): Promise<void>;
}