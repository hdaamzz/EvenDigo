import { inject, injectable } from 'tsyringe';
import { IAchievementRepository } from '../../../repositories/interfaces/IAchievements.repository';
import { IAchievementAdminService } from '../../../services/interfaces/IAchievements.admin';
import { 
  AchievementMapper, 
  AchievementResponseDTO, 
  CreateAchievementDTO, 
  UpdateAchievementDTO, 
  AchievementPaginationResponseDTO 
} from '../../../mappers/admin/acheivement/achievement.mapper';

@injectable()
export class AchievementService implements IAchievementAdminService {
    constructor(
        @inject("AchievementRepository") private achievementRepository: IAchievementRepository,
    ) {}

    async getAllAchievements(): Promise<AchievementResponseDTO[]> {
        const achievements = await this.achievementRepository.findAllAchievements();
        return AchievementMapper.toResponseDTOList(achievements);
    }

    async getAllAchievementsWithPagination(
        page: number = 1, 
        limit: number = 10
    ): Promise<AchievementPaginationResponseDTO> {
        const result = await this.achievementRepository.findAllAchievementsPagination(page, limit);
        return AchievementMapper.toPaginationResponseDTO(
            result.achievements, 
            result.totalCount, 
            result.hasMore, 
            page, 
            limit
        );
    }

    async getAchievementById(achievementId: string): Promise<AchievementResponseDTO> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        return AchievementMapper.toResponseDTO(achievement);
    }

    async createAchievement(achievementData: CreateAchievementDTO): Promise<AchievementResponseDTO> {
        const existingAchievement = await this.achievementRepository.findAchievementByTitle(achievementData.title);
        if (existingAchievement) {
            throw new Error('Achievement with this title already exists');
        }
        
        const entityData = AchievementMapper.toEntity(achievementData);
        const createdAchievement = await this.achievementRepository.createAchievement(entityData);
        return AchievementMapper.toResponseDTO(createdAchievement);
    }

    async updateAchievement(
        achievementId: string, 
        updateData: UpdateAchievementDTO
    ): Promise<AchievementResponseDTO | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        
        if (updateData.title && updateData.title !== achievement.title) {
            const existingWithTitle = await this.achievementRepository.findAchievementByTitle(updateData.title);
            if (existingWithTitle && existingWithTitle._id!.toString() !== achievementId) {
                throw new Error('Achievement with this title already exists');
            }
        }
        
        const entityUpdateData = AchievementMapper.toUpdateEntity(updateData);
        const updatedAchievement = await this.achievementRepository.updateAchievement(achievementId, entityUpdateData);
        
        return updatedAchievement ? AchievementMapper.toResponseDTO(updatedAchievement) : null;
    }

    async activateAchievement(achievementId: string): Promise<AchievementResponseDTO | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        
        const updatedAchievement = await this.achievementRepository.updateAchievement(achievementId, { isActive: true });
        return updatedAchievement ? AchievementMapper.toResponseDTO(updatedAchievement) : null;
    }

    async deactivateAchievement(achievementId: string): Promise<AchievementResponseDTO | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        
        const updatedAchievement = await this.achievementRepository.updateAchievement(achievementId, { isActive: false });
        return updatedAchievement ? AchievementMapper.toResponseDTO(updatedAchievement) : null;
    }

    async deleteAchievement(achievementId: string): Promise<void> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        await this.achievementRepository.deleteAchievement(achievementId);
    }
}