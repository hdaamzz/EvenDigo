import {Router} from 'express';
import { DashboardController } from '../../controllers/implementation/user/dashboard.controller';
import {authMiddleware } from '../../../src/middlewares/auth.middleware';
import { upload } from '../../../src/utils/helpers';
import { container } from 'tsyringe';

const dashboardController = container.resolve(DashboardController);
const dashboardRouter=Router();


dashboardRouter.post('/events', authMiddleware, upload.fields([ { name: 'mainBanner', maxCount: 1 },{ name: 'promotionalImage', maxCount: 1 }]), 
    (req, res) => dashboardController.createEvent(req, res)
  );
dashboardRouter.get('/events',authMiddleware,(req,res)=>dashboardController.getUserEvents(req,res))
dashboardRouter.get('/events/:id',authMiddleware,(req,res)=>dashboardController.getEventById(req,res))
export default dashboardRouter;