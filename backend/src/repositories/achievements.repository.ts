import { Schema } from 'mongoose';
import { injectable } from 'tsyringe';
import { IAchievementRepository } from './interfaces/IAchievements.repository';
import AchievementModel from '../../src/models/AchievementsModal';
import { IAchievement, IAchievementPagination } from '../../src/models/interfaces/achievements.interface';

@injectable()
export class AchievementRepository implements IAchievementRepository {
    async findAllAchievements(): Promise<IAchievement[]> {
        return AchievementModel.find({}).sort({ createdAt: -1 }).exec();
    }

    async findAllAchievementsPagination(page: number = 1, limit: number = 10): Promise<IAchievementPagination> {
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
        
        return { achievements, totalCount, hasMore };
    }

    async findAchievementById(achievementId: Schema.Types.ObjectId | string): Promise<IAchievement | null> {
        return AchievementModel.findById(achievementId).exec();
    }

    async findAchievementByTitle(title: string): Promise<IAchievement | null> {
        return AchievementModel.findOne({ title }).exec();
    }

    async createAchievement(achievementData: Partial<IAchievement>): Promise<IAchievement> {
        const achievement = new AchievementModel(achievementData);
        return achievement.save();
    }

    async updateAchievement(achievementId: Schema.Types.ObjectId | string, updateData: Partial<IAchievement>): Promise<IAchievement | null> {
        return AchievementModel.findByIdAndUpdate(
            achievementId,
            { $set: updateData },
            { new: true }
        ).exec();
    }

    async deleteAchievement(achievementId: Schema.Types.ObjectId | string): Promise<void> {
        await AchievementModel.findByIdAndDelete(achievementId).exec();
    }
    
}