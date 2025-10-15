import { inject, injectable } from 'tsyringe';
import { IAchievementRepository } from '../../../repositories/interfaces/IAchievements.repository';
import { IAchievementAdminService, ServicePaginationResult } from '../../../services/interfaces/IAchievements.admin';
import { IAchievement } from '../../../models/interfaces/achievements.interface';

@injectable()
export class AchievementService implements IAchievementAdminService {
    constructor(
        @inject("AchievementRepository") private achievementRepository: IAchievementRepository,
    ) {}

    async getAllAchievements(): Promise<IAchievement[]> {
        return await this.achievementRepository.findAllAchievements();
    }

    async getAllAchievementsWithPagination(
        page: number = 1, 
        limit: number = 10
    ): Promise<ServicePaginationResult> {
        return await this.achievementRepository.findAllAchievementsPagination(page, limit);
    }

    async getAchievementById(achievementId: string): Promise<IAchievement> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        return achievement;
    }

    async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
        if (achievementData.title) {
            const existingAchievement = await this.achievementRepository.findAchievementByTitle(achievementData.title);
            if (existingAchievement) {
                throw new Error('Achievement with this title already exists');
            }
        }
        
        return await this.achievementRepository.createAchievement(achievementData);
    }

    async updateAchievement(
        achievementId: string, 
        updateData: Partial<IAchievement>
    ): Promise<IAchievement | IAchievement[]> {
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
        
        // Ensure the repository never returns null
        const updated = await this.achievementRepository.updateAchievement(achievementId, updateData);
        if (!updated) {
            throw new Error('Failed to update achievement');
        }
        return updated;
    }

    async activateAchievement(achievementId: string): Promise<IAchievement | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        
        return await this.achievementRepository.updateAchievement(achievementId, { isActive: true });
    }

    async deactivateAchievement(achievementId: string): Promise<IAchievement | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        
        return await this.achievementRepository.updateAchievement(achievementId, { isActive: false });
    }

    async deleteAchievement(achievementId: string): Promise<void> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        await this.achievementRepository.deleteAchievement(achievementId);
    }
}
