import { Router } from 'express';
import { FinanceController } from '../../../src/controllers/implementation/admin/admin.revenue.controller';
import { container } from 'tsyringe';

const financeController = container.resolve(FinanceController);
const financeRouter = Router();

// Revenue endpoints
financeRouter.get('/revenue', (req, res) => financeController.getRevenueTransactions(req, res));
financeRouter.get('/stats', (req, res) => financeController.getRevenueStats(req, res));
financeRouter.get('/revenue/range', (req, res) => financeController.getRevenueByDateRange(req, res));

export default financeRouter;