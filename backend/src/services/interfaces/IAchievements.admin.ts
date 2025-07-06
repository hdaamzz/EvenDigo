import { 
  AchievementResponseDTO, 
  CreateAchievementDTO, 
  UpdateAchievementDTO, 
  AchievementPaginationResponseDTO 
} from '../../mappers/admin/acheivement/achievement.mapper';

export interface IAchievementAdminService {
    getAllAchievements(): Promise<AchievementResponseDTO[]>;
    getAllAchievementsWithPagination(page?: number, limit?: number): Promise<AchievementPaginationResponseDTO>;
    getAchievementById(achievementId: string): Promise<AchievementResponseDTO>;
    createAchievement(achievementData: CreateAchievementDTO): Promise<AchievementResponseDTO>;
    updateAchievement(achievementId: string, updateData: UpdateAchievementDTO): Promise<AchievementResponseDTO | null>;
    activateAchievement(achievementId: string): Promise<AchievementResponseDTO | null>;
    deactivateAchievement(achievementId: string): Promise<AchievementResponseDTO | null>;
    deleteAchievement(achievementId: string): Promise<void>;
}