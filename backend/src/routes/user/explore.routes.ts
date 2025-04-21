import { Router } from 'express';
import { ExploreController } from '../../controllers/implementation/user/explore.controller';
import { authMiddleware } from '../../../src/middlewares/auth.middleware';
import { container } from 'tsyringe';

const exploreController = container.resolve(ExploreController);
const exploreRoutes = Router()

exploreRoutes.get('/', authMiddleware, (req, res) => exploreController.getAllEvents(req, res));
exploreRoutes.post('/checkout', authMiddleware, (req, res) => exploreController.checkout(req, res));
exploreRoutes.post('/checkout/wallet', authMiddleware, (req, res) => exploreController.checkout(req, res));
exploreRoutes.get('/booking',authMiddleware,(req,res)=>exploreController.getBookingDetails(req,res));
exploreRoutes.get('/bookings/:bookingId/tickets', authMiddleware,(req,res)=> exploreController.downloadTickets(req,res));
exploreRoutes.get('/bookings/:bookingId/invoice', authMiddleware,(req,res)=> exploreController.downloadInvoice(req,res));


export default exploreRoutes;