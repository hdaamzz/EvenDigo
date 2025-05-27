// routes/user/auth.routes.ts
import { Router } from 'express';
import { AuthController } from '../../controllers/implementation/user/auth/auth.controller';
import { authMiddleware, validateFirebaseSignInRequest } from '../../middlewares/auth.middleware';
import { authRateLimit, otpRateLimit } from '../../middlewares/security.middleware';
import { container } from 'tsyringe';
import { SubscriptionPlanController } from '../../../src/controllers/implementation/admin/subscription/admin.subscriptionPlan.controller';

const authController = container.resolve(AuthController);
const subscriptionPlanController = container.resolve(SubscriptionPlanController);
const authRouter = Router();

// Public routes with rate limiting and validation
authRouter.post('/send-otp', 
  otpRateLimit, 

  (req, res) => authController.sendOTP(req, res)
);

authRouter.post('/verify-otp', 
  otpRateLimit, 

  (req, res) => authController.verifyOTP(req, res)
);

authRouter.post('/sign-in', 
  authRateLimit, 
  
  (req, res) => authController.verifyUser(req, res)
);

authRouter.post('/forgot-password', 
  authRateLimit, 
  (req, res) => authController.sendForgotPassword(req, res)
);

authRouter.post('/reset-password', 
  authRateLimit, 
  
  (req, res) => authController.resetPassword(req, res)
);

authRouter.post('/firebase-signin', 
  authRateLimit, 
  validateFirebaseSignInRequest, 
  (req, res) => authController.firebaseSignIn(req, res)
);

authRouter.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

authRouter.get('/status',authMiddleware,(req, res) => authController.isAuthenticated(req, res));
authRouter.get('/logout', (req, res) => authController.logout(req, res));
authRouter.get('/plans', (req, res) => subscriptionPlanController.getAll(req, res));

export default authRouter;