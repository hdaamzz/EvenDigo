import { Router } from 'express';
import { container } from 'tsyringe';
import revenueDistributionRouter from './distribution.routes';
import { FinanceController } from '../../../src/controllers/implementation/admin/finance/admin.revenue.controller';

const financeController = container.resolve(FinanceController);
const financeRouter = Router();

financeRouter.get('/revenue', (req, res) => financeController.getRevenueTransactions(req, res));
financeRouter.get('/stats', (req, res) => financeController.getRevenueStats(req, res));
financeRouter.get('/revenue/range', (req, res) => financeController.getTransactionByDateRange(req, res));
financeRouter.get('/refunds', (req, res) => financeController.getRefundTransactions(req, res));
financeRouter.get('/refunds/range', (req, res) => financeController.getRefundsByDateRange(req, res));
financeRouter.use('/distribution', revenueDistributionRouter);
financeRouter.get('/revenue/user', (req, res) => financeController.getTransactionsByUser(req, res));


export default financeRouter;