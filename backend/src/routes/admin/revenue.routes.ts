import { Router } from 'express';
import { FinanceController } from '../../../src/controllers/implementation/admin/admin.revenue.controller';
import { container } from 'tsyringe';
import revenueDistributionRouter from './distribution.routes';

const financeController = container.resolve(FinanceController);
const financeRouter = Router();

financeRouter.get('/revenue', (req, res) => financeController.getRevenueTransactions(req, res));
financeRouter.get('/stats', (req, res) => financeController.getRevenueStats(req, res));
financeRouter.get('/revenue/range', (req, res) => financeController.getTransactionByDateRange(req, res));


financeRouter.get('/refunds', (req, res) => financeController.getRefundTransactions(req, res));
financeRouter.get('/refunds/range', (req, res) => financeController.getRefundsByDateRange(req, res));

financeRouter.use('/distribution', revenueDistributionRouter);

export default financeRouter;