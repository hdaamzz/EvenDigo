import { Router } from 'express';
import { AdminAuthController } from '../../../src/controllers/implementation/admin/auth/admin.auth.controller';
import { container } from 'tsyringe';

const AuthController = container.resolve(AdminAuthController);
const adminAuthRouter = Router();


adminAuthRouter.post('/sign-in', (req, res) => AuthController.verifyAdmin(req, res));


export default adminAuthRouter;
