import { Router } from 'express';
import { AdminSubscriptionController } from '../../../src/controllers/implementation/admin/subscription/admin.subscription.controller';
import { container } from 'tsyringe';


const adminSubscriptionController = container.resolve(AdminSubscriptionController);
const adminSubscriptionRoutes = Router();

adminSubscriptionRoutes.get('/', (req, res) => adminSubscriptionController.getAllSubscriptions(req, res));

adminSubscriptionRoutes.get('/stats', (req, res) => adminSubscriptionController.getSubscriptionStats(req, res));

adminSubscriptionRoutes.get('/filter-options', (req, res) => adminSubscriptionController.getFilterOptions(req, res));

adminSubscriptionRoutes.get('/:id', (req, res) => adminSubscriptionController.getSubscriptionById(req, res));

adminSubscriptionRoutes.get('/user/:userId', (req, res) => adminSubscriptionController.getUserSubscriptions(req, res));

adminSubscriptionRoutes.patch('/status', (req, res) => adminSubscriptionController.updateSubscriptionStatus(req, res));

adminSubscriptionRoutes.delete('/:id', (req, res) => adminSubscriptionController.deleteSubscription(req, res));

export default adminSubscriptionRoutes;