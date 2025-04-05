import { Router } from 'express';
import { ExploreController } from '../../controllers/implementation/user/explore.controller';
import { authMiddleware } from '../../../src/middlewares/auth.middleware';
import { container } from 'tsyringe';

const exploreController = container.resolve(ExploreController);
const exploreRoutes = Router()

exploreRoutes.get('/', authMiddleware, (req, res) => exploreController.getAllEvents(req, res))
exploreRoutes.post('/checkout', authMiddleware, (req, res) => exploreController.checkout(req, res));

export default exploreRoutes;