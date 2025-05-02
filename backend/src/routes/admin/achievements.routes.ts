import { Router } from 'express';
import { AchievementController } from '../../../src/controllers/implementation/admin/achievement/admin.achievements.controller';
import { container } from 'tsyringe';

const achievementController = container.resolve(AchievementController);
const achievementRouter = Router();

achievementRouter.get('/', (req, res) => achievementController.fetchAllAchievementsWithPagination(req, res));
achievementRouter.get('/:acheivementId', (req, res) => achievementController.getAchievementById(req, res));
achievementRouter.post('/', (req, res) => achievementController.createAchievement(req, res));
achievementRouter.put('/:acheivementId', (req, res) => achievementController.updateAchievement(req, res));
achievementRouter.patch('/:acheivementId/activate', (req, res) => achievementController.activateAchievement(req, res));
achievementRouter.patch('/:acheivementId/deactivate', (req, res) => achievementController.deactivateAchievement(req, res));
achievementRouter.delete('/:acheivementId', (req, res) => achievementController.deleteAchievement(req, res));

export default achievementRouter;