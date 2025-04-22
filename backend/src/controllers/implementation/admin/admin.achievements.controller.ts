import { Request, Response } from 'express';
import { inject, injectable } from 'tsyringe';
import StatusCode from '../../../types/statuscode';
import { IAchievementAdminController } from '../../../../src/controllers/interfaces/IAchievements.admin.controller';
import { IAchievementAdminService } from '../../../../src/services/interfaces/IAchievements.admin';

@injectable()
export class AchievementController implements IAchievementAdminController {
    constructor(
        @inject("AchievementService") private achievementService: IAchievementAdminService,
    ) {}

    async fetchAllAchievements(_req: Request, res: Response): Promise<void> {
        try {
            const achievements = await this.achievementService.getAllAchievements();
            res.status(StatusCode.OK).json({ success: true, data: achievements });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async fetchAllAchievementsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.achievementService.getAllAchievementsWithPagination(page, limit);
            res.status(StatusCode.OK).json({ 
                success: true, 
                data: result.achievements,
                pagination: {
                    totalCount: result.totalCount,
                    totalPages: Math.ceil(result.totalCount / limit),
                    currentPage: page,
                    hasMore: result.hasMore
                }
            });
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async getAchievementById(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const achievement = await this.achievementService.getAchievementById(achievementId);
            res.status(StatusCode.OK).json({ success: true, data: achievement });
        } catch (error) {
            res.status(StatusCode.NOT_FOUND).json({ success: false, message: (error as Error).message });
        }
    }

    async createAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementData = req.body;
            const newAchievement = await this.achievementService.createAchievement(achievementData);
            res.status(StatusCode.CREATED).json({ success: true, data: newAchievement });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async updateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updateData = req.body;
            const updatedAchievement = await this.achievementService.updateAchievement(achievementId, updateData);
            res.status(StatusCode.OK).json({ success: true, data: updatedAchievement });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async activateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this.achievementService.activateAchievement(achievementId);
            res.status(StatusCode.OK).json({ success: true, data: updatedAchievement });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async deactivateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this.achievementService.deactivateAchievement(achievementId);
            res.status(StatusCode.OK).json({ success: true, data: updatedAchievement });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }

    async deleteAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            await this.achievementService.deleteAchievement(achievementId);
            res.status(StatusCode.NO_CONTENT).send();
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ success: false, message: (error as Error).message });
        }
    }
}