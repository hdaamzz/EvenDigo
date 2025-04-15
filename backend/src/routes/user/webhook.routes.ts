import { Router } from 'express';
import { container } from 'tsyringe';
import { ExploreController } from '../../controllers/implementation/user/explore.controller';

const stripeWebhookRouter = Router();
const exploreController = container.resolve(ExploreController);

stripeWebhookRouter.post('/', (req, res) => exploreController.handleStripeWebhook(req, res));

export default stripeWebhookRouter;