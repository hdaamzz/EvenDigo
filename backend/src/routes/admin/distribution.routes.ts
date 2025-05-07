import { Router } from 'express';
import { RevenueDistributionController } from '../../../src/controllers/implementation/admin/finance/admin.distribution.controller';
import { container } from 'tsyringe';

const revenueDistributionController = container.resolve(RevenueDistributionController);
const revenueDistributionRouter = Router();

revenueDistributionRouter.post('/distribute', (req, res) => revenueDistributionController.triggerDistributionManually(req, res));
revenueDistributionRouter.get('/distributions', (req, res) => revenueDistributionController.getAllCompletedDistributions(req, res));
revenueDistributionRouter.get('/event/:eventId', (req, res) => revenueDistributionController.getEventDistribution(req, res));
revenueDistributionRouter.post('/event/:eventId/distribute', (req, res) => revenueDistributionController.distributeSpecificEvent(req, res));



export default revenueDistributionRouter;