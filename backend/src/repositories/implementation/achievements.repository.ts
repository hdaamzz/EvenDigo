import { Schema } from 'mongoose';
import { injectable } from 'tsyringe';
import { IAchievementRepository } from '../interfaces/IAchievements.repository';
import AchievementModel from '../../models/AchievementsModel';
import { AchievementEntityDTO } from '../../mappers/admin/acheivement/achievement.mapper';
import { AchievementRepositoryPaginationResult } from '../../models/interfaces/achievements.interface';



@injectable()
export class AchievementRepository implements IAchievementRepository {
    async findAllAchievements(): Promise<AchievementEntityDTO[]> {
        const achievements = await AchievementModel.find({}).sort({ createdAt: -1 }).exec();
        return achievements.map(achievement => this.mapToEntityDTO(achievement));
    }

    async findAllAchievementsPagination(page: number = 1, limit: number = 10): Promise<AchievementRepositoryPaginationResult> {
        const skip = (page - 1) * limit;
        
        const [achievements, totalCount] = await Promise.all([
            AchievementModel.find({})
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .exec(),
            AchievementModel.countDocuments({})
        ]);
        
        const hasMore = totalCount > (skip + achievements.length);
        
        return { 
            achievements: achievements.map(achievement => this.mapToEntityDTO(achievement)), 
            totalCount, 
            hasMore 
        };
    }

    async findAchievementById(achievementId: Schema.Types.ObjectId | string): Promise<AchievementEntityDTO | null> {
        const achievement = await AchievementModel.findById(achievementId).exec();
        return achievement ? this.mapToEntityDTO(achievement) : null;
    }

    async findAchievementByTitle(title: string): Promise<AchievementEntityDTO | null> {
        const achievement = await AchievementModel.findOne({ title }).exec();
        return achievement ? this.mapToEntityDTO(achievement) : null;
    }

    async createAchievement(achievementData: Partial<AchievementEntityDTO>): Promise<AchievementEntityDTO> {
        const achievement = new AchievementModel(achievementData);
        const savedAchievement = await achievement.save();
        return this.mapToEntityDTO(savedAchievement);
    }

    async updateAchievement(achievementId: Schema.Types.ObjectId | string, updateData: Partial<AchievementEntityDTO>): Promise<AchievementEntityDTO | null> {
        const updatedAchievement = await AchievementModel.findByIdAndUpdate(
            achievementId,
            { $set: updateData },
            { new: true }
        ).exec();
        return updatedAchievement ? this.mapToEntityDTO(updatedAchievement) : null;
    }

    async deleteAchievement(achievementId: Schema.Types.ObjectId | string): Promise<void> {
        await AchievementModel.findByIdAndDelete(achievementId).exec();
    }

    private mapToEntityDTO(mongooseDoc: any): AchievementEntityDTO {
        return {
            _id: mongooseDoc._id,
            title: mongooseDoc.title,
            description: mongooseDoc.description,
            category: mongooseDoc.category,
            criteria: mongooseDoc.criteria,
            threshold: mongooseDoc.threshold,
            icon: mongooseDoc.icon,
            isActive: mongooseDoc.isActive,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt
        };
    }
}