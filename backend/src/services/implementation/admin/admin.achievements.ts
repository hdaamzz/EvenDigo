import { IAchievement } from '../../../../src/models/interfaces/achievements.interface';
import { IAchievementRepository } from '../../../../src/repositories/interfaces/IAchievements.repository';
import { IAchievementAdminService } from '../../../../src/services/interfaces/IAchievements.admin';
import { inject, injectable } from 'tsyringe';

@injectable()
export class AchievementService implements IAchievementAdminService {
    constructor(
        @inject("AchievementRepository") private achievementRepository: IAchievementRepository,
    ) {}

    async getAllAchievements(): Promise<IAchievement[]> {
        return this.achievementRepository.findAllAchievements();
    }

    async getAllAchievementsWithPagination(page: number = 1, limit: number = 10): Promise<{achievements: IAchievement[], totalCount: number, hasMore: boolean}> {
        return this.achievementRepository.findAllAchievementsPagination(page, limit);
    }

    async getAchievementById(achievementId: string): Promise<IAchievement> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        return achievement;
    }

    async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
        const existingAchievement = await this.achievementRepository.findAchievementByTitle(achievementData.title!);
        if (existingAchievement) {
            throw new Error('Achievement with this title already exists');
        }
        return this.achievementRepository.createAchievement(achievementData);
    }

    async updateAchievement(achievementId: string, updateData: Partial<IAchievement>): Promise<IAchievement | null> {
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
        
        return this.achievementRepository.updateAchievement(achievementId, updateData);
    }

    async activateAchievement(achievementId: string): Promise<IAchievement | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        return this.achievementRepository.updateAchievement(achievementId, { isActive: true });
    }

    async deactivateAchievement(achievementId: string): Promise<IAchievement | null> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        return this.achievementRepository.updateAchievement(achievementId, { isActive: false });
    }

    async deleteAchievement(achievementId: string): Promise<void> {
        const achievement = await this.achievementRepository.findAchievementById(achievementId);
        if (!achievement) {
            throw new Error('Achievement not found');
        }
        await this.achievementRepository.deleteAchievement(achievementId);
    }
}