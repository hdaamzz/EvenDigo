import { Router } from 'express';
import { ProfileController } from '../../controllers/implementation/user/profile.controller';
import { FileRequest } from '../../models/interfaces/profile.interface';
import {upload} from '../../utils/helpers'
import { authMiddleware } from '../../../src/middlewares/auth.middleware';
import { container } from 'tsyringe';



const profileController = container.resolve(ProfileController);
const profileRouter = Router();


profileRouter.post('/user-details', (req, res) => profileController.fetchUserById(req, res));
profileRouter.post('/update',(req,res)=>profileController.updateUserDetails(req,res));
profileRouter.post('/verification-request',(req,res)=>profileController.sendVerificationRequest(req,res));
profileRouter.get('/verification-request/:userId',(req,res)=>profileController.verificationRequestDetails(req,res));
profileRouter.post('/image',authMiddleware,upload.single('profileImage'),(req, res) => profileController.uploadProfileImage(req as FileRequest, res));
profileRouter.get('/events', authMiddleware, (req, res) => profileController.getUserEvents(req, res));
profileRouter.get('/events/:eventId', authMiddleware, (req, res) => profileController.getEvent(req, res));
profileRouter.get('/bookings', authMiddleware, (req, res) => profileController.getUserBookings(req, res));
profileRouter.post('/events/cancel', authMiddleware, (req, res) => profileController.cancelTicket(req, res));
profileRouter.get('/wallet', authMiddleware, (req, res) => profileController.getUserWallet(req, res));
profileRouter.put('/events', authMiddleware, upload.fields([
    { name: 'mainBanner', maxCount: 1 },
    { name: 'promotionalImage', maxCount: 1 }
  ]), (req, res) => profileController.updateEvent(req, res));
profileRouter.delete('/events/:eventId', authMiddleware, (req, res) => profileController.deleteEvent(req, res));


export default profileRouter;
