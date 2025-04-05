import { Router } from 'express';
import { AuthController } from '../../controllers/implementation/user/auth.controller';
import { validateFirebaseSignInRequest,authMiddleware } from '../../middlewares/auth.middleware';
import { container } from 'tsyringe';




const authController = container.resolve(AuthController);
const authRouter = Router();

authRouter.post('/send-otp', (req, res) => authController.sendOTP(req, res));
authRouter.post('/verify-otp', (req, res) => authController.verifyOTP(req, res));
authRouter.post('/sign-in', (req, res) => authController.verifyUser(req, res));
authRouter.post('/forgot-password', (req, res) => authController.sendForgotPassword(req, res));
authRouter.post('/reset-password', (req, res) => authController.resetPassword(req, res));
authRouter.get('/status',authMiddleware,(req,res)=>authController.isAuthenticated(req,res))
authRouter.get('/logout',(req,res)=>authController.isLogout(req,res))
authRouter.post('/firebase-signin',validateFirebaseSignInRequest,(req, res) => authController.firebaseSignIn(req, res));
export default authRouter;
