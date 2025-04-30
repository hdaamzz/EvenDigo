import { Router } from 'express';
import { container } from 'tsyringe';
import { SubscriptionController } from '../../../src/controllers/implementation/user/premium/subscription.controller';

const subscriptionController = container.resolve(SubscriptionController);
const subscriptionRoutes = Router();

subscriptionRoutes.post('/create-checkout', (req, res) => subscriptionController.createCheckout(req, res));
subscriptionRoutes.post('/wallet-upgrade', (req, res) => subscriptionController.walletUpgrade(req, res));
subscriptionRoutes.get('/current', (req, res) => subscriptionController.getCurrentSubscription(req, res));
subscriptionRoutes.post('/cancel', (req, res) => subscriptionController.cancelSubscription(req, res));


subscriptionRoutes.post('/webhook', (req, res) => subscriptionController.handleWebhook(req, res));


export default subscriptionRoutes;