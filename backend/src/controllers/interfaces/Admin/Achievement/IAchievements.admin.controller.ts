import { Request, Response } from 'express';

export interface IAchievementAdminController {
    fetchAllAchievements(req: Request, res: Response): Promise<void>;
    fetchAllAchievementsWithPagination(req: Request, res: Response): Promise<void>;
    getAchievementById(req: Request, res: Response): Promise<void>;
    createAchievement(req: Request, res: Response): Promise<void>;
    updateAchievement(req: Request, res: Response): Promise<void>;
    activateAchievement(req: Request, res: Response): Promise<void>;
    deactivateAchievement(req: Request, res: Response): Promise<void>;
    deleteAchievement(req: Request, res: Response): Promise<void>;
}