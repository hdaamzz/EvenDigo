import { Router } from 'express';
import { SubscriptionController } from '../../../src/controllers/implementation/user/premium/subscription.controller';
import { container } from 'tsyringe';
import { SubscriptionPlanController } from '../../../src/controllers/implementation/admin/subscription/admin.subscriptionPlan.controller';


const router = Router();
const subscriptionController = container.resolve(SubscriptionController);
const subscriptionPlanController = container.resolve(SubscriptionPlanController);


router.post('/create-checkout', subscriptionController.createCheckout);
router.post('/wallet-upgrade', subscriptionController.walletUpgrade);
router.get('/current', subscriptionController.getCurrentSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/confirm/:sessionId', subscriptionController.getSubscriptionDetails);
router.get('/type/:planType', (req,res)=>subscriptionPlanController.getByPlanType(req,res));


export default router;