import { Request, Response } from 'express';
import { IAchievementAdminController } from '../../../../../src/controllers/interfaces/Admin/Achievement/IAchievements.admin.controller';
import { IAchievementAdminService } from '../../../../../src/services/interfaces/IAchievements.admin';
import StatusCode from '../../../../../src/types/statuscode';
import { inject, injectable } from 'tsyringe';
import { ResponseHandler } from '../../../../../src/utils/response-handler';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '../../../../../src/error/error-handlers';


@injectable()
export class AchievementController implements IAchievementAdminController {
    constructor(
        @inject("AchievementService") private achievementService: IAchievementAdminService,
    ) {}

    async fetchAllAchievements(_req: Request, res: Response): Promise<void> {
        try {
            const achievements = await this.achievementService.getAllAchievements();
            ResponseHandler.success(res, achievements, 'Achievements fetched successfully');
        } catch (error) {
            ResponseHandler.error(
                res, 
                error, 
                'Failed to fetch achievements', 
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async fetchAllAchievementsWithPagination(req: Request, res: Response): Promise<void> {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;
            
            const result = await this.achievementService.getAllAchievementsWithPagination(page, limit);
            
            ResponseHandler.success(
                res, 
                {
                    achievements: result.achievements,
                    pagination: {
                        totalCount: result.totalCount,
                        totalPages: Math.ceil(result.totalCount / limit),
                        currentPage: page,
                        hasMore: result.hasMore
                    }
                },
                'Paginated achievements fetched successfully'
            );
        } catch (error) {
            ResponseHandler.error(
                res, 
                error, 
                'Failed to fetch paginated achievements', 
                StatusCode.INTERNAL_SERVER_ERROR
            );
        }
    }

    async getAchievementById(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const achievement = await this.achievementService.getAchievementById(achievementId);
            ResponseHandler.success(res, achievement, 'Achievement fetched successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Achievement not found', 
                    StatusCode.NOT_FOUND
                );
            } else {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Failed to fetch achievement', 
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async createAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementData = req.body;
            const newAchievement = await this.achievementService.createAchievement(achievementData);
            ResponseHandler.success(
                res, 
                newAchievement, 
                'Achievement created successfully', 
                StatusCode.CREATED
            );
        } catch (error) {
            if (error instanceof BadRequestException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Invalid achievement data', 
                    StatusCode.BAD_REQUEST
                );
            } else if (error instanceof ConflictException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Achievement already exists', 
                    StatusCode.CONFLICT
                );
            } else {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Failed to create achievement', 
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async updateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updateData = req.body;
            const updatedAchievement = await this.achievementService.updateAchievement(achievementId, updateData);
            ResponseHandler.success(res, updatedAchievement, 'Achievement updated successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Achievement not found', 
                    StatusCode.NOT_FOUND
                );
            } else if (error instanceof BadRequestException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Invalid update data', 
                    StatusCode.BAD_REQUEST
                );
            } else {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Failed to update achievement', 
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async activateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this.achievementService.activateAchievement(achievementId);
            ResponseHandler.success(res, updatedAchievement, 'Achievement activated successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Achievement not found', 
                    StatusCode.NOT_FOUND
                );
            } else {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Failed to activate achievement', 
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async deactivateAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            const updatedAchievement = await this.achievementService.deactivateAchievement(achievementId);
            ResponseHandler.success(res, updatedAchievement, 'Achievement deactivated successfully');
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Achievement not found', 
                    StatusCode.NOT_FOUND
                );
            } else {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Failed to deactivate achievement', 
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }

    async deleteAchievement(req: Request, res: Response): Promise<void> {
        try {
            const achievementId = req.params.acheivementId;
            await this.achievementService.deleteAchievement(achievementId);
            ResponseHandler.success(res, null, 'Achievement deleted successfully', StatusCode.NO_CONTENT);
        } catch (error) {
            if (error instanceof NotFoundException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Achievement not found', 
                    StatusCode.NOT_FOUND
                );
            } else if (error instanceof ForbiddenException) {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Cannot delete this achievement', 
                    StatusCode.FORBIDDEN
                );
            } else {
                ResponseHandler.error(
                    res, 
                    error, 
                    'Failed to delete achievement', 
                    StatusCode.INTERNAL_SERVER_ERROR
                );
            }
        }
    }
}