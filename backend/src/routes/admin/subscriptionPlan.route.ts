import { Router } from 'express';
import { SubscriptionPlanController } from '../../../src/controllers/implementation/admin/subscription/admin.subscriptionPlan.controller';
import { container } from 'tsyringe';


const subscriptionPlanRouter = Router();
const subscriptionPlanController = container.resolve(SubscriptionPlanController);
subscriptionPlanRouter.post('/', (req,res)=> subscriptionPlanController.create(req,res));
subscriptionPlanRouter.get('/', (req,res)=>subscriptionPlanController.getAll(req,res));
subscriptionPlanRouter.get('/:id',(req,res)=> subscriptionPlanController.getById(req,res));
subscriptionPlanRouter.put('/:id',(req,res)=> subscriptionPlanController.update(req,res));
subscriptionPlanRouter.delete('/:id',(req,res)=> subscriptionPlanController.delete(req,res));

export default subscriptionPlanRouter;