
import { Router } from 'express';
import { container } from 'tsyringe';
import { RevenueDistributionController } from '../../../src/controllers/implementation/admin/admin.distribution.controller';

const distributionController = container.resolve(RevenueDistributionController);
const distributionRouter = Router();

distributionRouter.get('/', (req, res) => distributionController.getDistributedRevenue(req, res));
distributionRouter.get('/recent', (req, res) => distributionController.getRecentDistributedRevenue(req, res));
distributionRouter.get('/event/:eventId', (req, res) => distributionController.getRevenueByEvent(req, res));
distributionRouter.get('/batch', (req, res) => distributionController.getEventsByIds(req, res));
distributionRouter.get('/stats', (req, res) => distributionController.getRevenueStats(req, res)); 


export default distributionRouter;