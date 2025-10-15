import { Request, Response } from 'express';
import { IAchievementAdminController } from '../../../../controllers/interfaces/Admin/Achievement/IAchievements.admin.controller';
import { IAchievementAdminService } from '../../../../services/interfaces/IAchievements.admin';
import StatusCode from '../../../../types/statuscode';
import { inject, injectable } from 'tsyringe';
import { AchievementResponseDto } from '../../../../dto/admin/achievements/achievement-response.dto';
import { AchievementListResponseDto } from '../../../../dto/admin/achievements/achievement-list-response.dto';
import { UpdateAchievementDto } from '../../../../dto/admin/achievements/update-achievement.dto';
import { CreateAchievementDto } from '../../../../dto/admin/achievements/create-achievement.dto';
import { IAchievement } from '../../../../models/interfaces/achievements.interface';

@injectable()
export class AchievementController implements IAchievementAdminController {
    constructor(
        @inject("AchievementService") private readonly _achievementService: IAchievementAdminService,
    ) {}

    async fetchAllAchievements(_req: Request, res: Response): Promise<void> {
        try {
            const achievements = await this._achievementService.getAllAchievements();
            const response = AchievementResponseDto.success(achievements);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async fetchAllAchievementsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = this._parsePageNumber(req.query.page as string);
            const limit = this._parseLimit(req.query.limit as string);
            
            const result = await this._achievementService.getAllAchievementsWithPagination(page, limit);
            const response = AchievementListResponseDto.fromServiceResult(result, page, limit);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.INTERNAL_SERVER_ERROR);
        }
    }

    async getAchievementById(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = this._getAchievementIdFromParams(req);
            const achievement = await this._achievementService.getAchievementById(achievementId);
            const response = AchievementResponseDto.success(achievement);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.NOT_FOUND);
        }
    }

    async createAchievement(req: Request, res: Response): Promise<void> {
        try {
            const createDto = CreateAchievementDto.fromRequest(req.body);
            const achievementData = createDto.toEntity();
            const newAchievement = await this._achievementService.createAchievement(achievementData);
            const response = AchievementResponseDto.success(newAchievement);
            
            res.status(StatusCode.CREATED).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async updateAchievement(req: Request, res: Response): Promise<void> {
        try {
            
            const achievementId = req.params.acheivementId;
            const updateDto = UpdateAchievementDto.fromRequest(req.body);
            const updateData = updateDto.toEntity();
            const updatedAchievement = await this._achievementService.updateAchievement(achievementId, updateData);
            const response = AchievementResponseDto.success(updatedAchievement);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async activateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this._achievementService.activateAchievement(achievementId);

            const response = AchievementResponseDto.success(updatedAchievement as unknown as IAchievement);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async deactivateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this._achievementService.deactivateAchievement(achievementId);
            const response = AchievementResponseDto.success(updatedAchievement as unknown as IAchievement);
            
            res.status(StatusCode.OK).json(response);
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    async deleteAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            await this._achievementService.deleteAchievement(achievementId);
            
            res.status(StatusCode.NO_CONTENT).send();
        } catch (error) {
            this._handleError(res, error, StatusCode.BAD_REQUEST);
        }
    }

    private _parsePageNumber(page: string): number {
        const parsedPage = parseInt(page);
        return isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    }

    private _parseLimit(limit: string): number {
        const parsedLimit = parseInt(limit);
        return isNaN(parsedLimit) || parsedLimit < 1 ? 10 : Math.min(parsedLimit, 100); 
    }

    private _getAchievementIdFromParams(req: Request): string {
        const achievementId = req.params.achievementId;
        console.log(achievementId);
        
        
        if (!achievementId) {
            throw new Error('Achievement ID is required');
        }
        
        return achievementId;
    }

    private _handleError(res: Response, error: unknown, statusCode: number): void {
        const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
        const response = AchievementResponseDto.error(errorMessage);
        
        res.status(statusCode).json(response);
    }
}
