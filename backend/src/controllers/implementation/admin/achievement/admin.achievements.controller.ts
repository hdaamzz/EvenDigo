import { Request, Response } from 'express';
import { IAchievementAdminController } from '../../../../../src/controllers/interfaces/Admin/Achievement/IAchievements.admin.controller';
import { IAchievementAdminService } from '../../../../../src/services/interfaces/IAchievements.admin';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';
import { AchievementResponseDto } from '../../../../../src/dto/admin/achievements/achievement-response.dto';
import { AchievementListResponseDto } from '../../../../../src/dto/admin/achievements/achievement-list-response.dto';
import { UpdateAchievementDto } from '../../../../../src/dto/admin/achievements/update-achievement.dto';
import { CreateAchievementDto } from '../../../../../src/dto/admin/achievements/create-achievement.dto';


@injectable()
export class AchievementController implements IAchievementAdminController {
    constructor(
        @inject("AchievementService") private achievementService: IAchievementAdminService,
    ) {}

    async fetchAllAchievements(_req: Request, res: Response): Promise<void> {
        try {
            const achievements = await this.achievementService.getAllAchievements();
            const response = AchievementResponseDto.success(achievements);
            console.log(response);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async fetchAllAchievementsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.achievementService.getAllAchievementsWithPagination(page, limit);
            const response = AchievementListResponseDto.fromServiceResult(result, page, limit);
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ success: false, message: (error as Error).message });
        }
    }

    async getAchievementById(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const achievement = await this.achievementService.getAchievementById(achievementId);
            const response = AchievementResponseDto.success(achievement);
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            const response = AchievementResponseDto.error((error as Error).message);
            res.status(StatusCode.NOT_FOUND).json(response);
        }
    }

    async createAchievement(req: Request, res: Response): Promise<void> {
        try {
            const createDto = CreateAchievementDto.fromRequest(req.body);
            const achievementData = createDto.toEntity();
            const newAchievement = await this.achievementService.createAchievement(achievementData);
            const response = AchievementResponseDto.success(newAchievement);
            res.status(StatusCode.CREATED).json(response);
        } catch (error) {
            const response = AchievementResponseDto.error((error as Error).message);
            res.status(StatusCode.BAD_REQUEST).json(response);
        }
    }

    async updateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updateDto = UpdateAchievementDto.fromRequest(req.body);
            const updateData = updateDto.toEntity();
            const updatedAchievement = await this.achievementService.updateAchievement(achievementId, updateData);
            const response = AchievementResponseDto.success(updatedAchievement);
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            const response = AchievementResponseDto.error((error as Error).message);
            res.status(StatusCode.BAD_REQUEST).json(response);
        }
    }

    async activateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this.achievementService.activateAchievement(achievementId);
            const response = AchievementResponseDto.success(updatedAchievement);
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            const response = AchievementResponseDto.error((error as Error).message);
            res.status(StatusCode.BAD_REQUEST).json(response);
        }
    }

    async deactivateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this.achievementService.deactivateAchievement(achievementId);
            const response = AchievementResponseDto.success(updatedAchievement);
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            const response = AchievementResponseDto.error((error as Error).message);
            res.status(StatusCode.BAD_REQUEST).json(response);
        }
    }

    async deleteAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            await this.achievementService.deleteAchievement(achievementId);
            res.status(StatusCode.NO_CONTENT).send();
        } catch (error) {
            const response = AchievementResponseDto.error((error as Error).message);
            res.status(StatusCode.BAD_REQUEST).json(response);
        }
    }
}