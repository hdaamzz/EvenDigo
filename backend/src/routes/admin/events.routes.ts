import {Router} from 'express';
import { AdminEventsController } from '../../controllers/implementation/admin/admin.events.controller';
import { container } from 'tsyringe';

const adminEventsController = container.resolve(AdminEventsController);
const adminEventsRouter=Router();
adminEventsRouter.get('/',(req,res)=>adminEventsController.fetchAllEvents(req,res));
adminEventsRouter.patch('/:id/status',(req,res)=>adminEventsController.updateEventStatus(req,res));


export default adminEventsRouter;