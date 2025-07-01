import { Router } from 'express';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { upload } from '../../utils/helpers';
import { container } from 'tsyringe';
import { DashboardController } from '../../controllers/implementation/user/dashboard/dashboard.controller';

const dashboardController = container.resolve(DashboardController);
const dashboardRouter = Router();


dashboardRouter.post('/events', authMiddleware, upload.fields([{ name: 'mainBanner', maxCount: 1 },{ name: 'promotionalImage', maxCount: 1 }]), (req, res) => dashboardController.createEvent(req, res));

dashboardRouter.get('/events',authMiddleware,(req, res) => dashboardController.getUserEvents(req, res));
dashboardRouter.get('/events/organized',authMiddleware,(req, res) => dashboardController.getUserOrganizedEvents(req, res));
dashboardRouter.get('/events/participated',authMiddleware,(req, res) => dashboardController.getUserParticipatedEvents(req, res));
dashboardRouter.get('/events/ongoing',authMiddleware,(req, res) => dashboardController.getUserOngoingEvents(req, res));





dashboardRouter.get('/events/:eventId', authMiddleware,(req, res) => dashboardController.getEventById(req, res));

dashboardRouter.put('/events/:id',authMiddleware,upload.fields([ { name: 'mainBanner', maxCount: 1 },{ name: 'promotionalImage', maxCount: 1 }]),(req, res) => dashboardController.updateEvent(req, res));

dashboardRouter.delete('/events/:id',authMiddleware,(req, res) => dashboardController.deleteEvent(req, res));

export default dashboardRouter;