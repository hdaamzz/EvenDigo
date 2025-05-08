import { Router } from 'express';
import { SubscriptionController } from '../../../src/controllers/implementation/user/premium/subscription.controller';
import { container } from 'tsyringe';


const router = Router();
const subscriptionController = container.resolve(SubscriptionController);

router.post('/create-checkout', subscriptionController.createCheckout);
router.post('/wallet-upgrade', subscriptionController.walletUpgrade);
router.get('/current', subscriptionController.getCurrentSubscription);
router.post('/cancel', subscriptionController.cancelSubscription);
router.get('/confirm/:sessionId', subscriptionController.getSubscriptionDetails);


export default router;