import { Router } from 'express';
import { FileRequest } from '../../models/interfaces/profile.interface';
import {upload} from '../../utils/helpers'
import { authMiddleware } from '../../../src/middlewares/auth.middleware';
import { container } from 'tsyringe';
import { ProfileBookingController } from '../../../src/controllers/implementation/user/profile/profileBooking.controller';
import { ProfileEventsController } from '../../../src/controllers/implementation/user/profile/profileEvents.controller';
import { ProfileWalletController } from '../../../src/controllers/implementation/user/profile/profileWallet.controller';
import { ProfileUserController } from '../../../src/controllers/implementation/user/profile/profileUser.controller';



const profileBookingController = container.resolve(ProfileBookingController);
const profileEventsController = container.resolve(ProfileEventsController);
const profileWalletController = container.resolve(ProfileWalletController);
const profileUserController = container.resolve(ProfileUserController);



const profileRouter = Router();

//user details
profileRouter.get('/user-details', (req, res) => profileUserController.fetchUserById(req, res));
profileRouter.post('/update',(req,res)=>profileUserController.updateUserDetails(req,res));
profileRouter.post('/verification-request',(req,res)=>profileUserController.sendVerificationRequest(req,res));
profileRouter.get('/verification-request',(req,res)=>profileUserController.verificationRequestDetails(req,res));
profileRouter.post('/image',authMiddleware,upload.single('profileImage'),(req, res) => profileUserController.uploadProfileImage(req as FileRequest, res));
profileRouter.get('/badge',(req,res)=>profileUserController.fetchUserBadges(req,res))
profileRouter.post('/change-password', (req, res) => profileUserController.changePassword(req, res));



//my event section
profileRouter.get('/events', authMiddleware, (req, res) => profileEventsController.getUserEvents(req, res));
profileRouter.get('/events/:eventId', authMiddleware, (req, res) => profileEventsController.getEvent(req, res));
profileRouter.put('/events', authMiddleware, upload.fields([
  { name: 'mainBanner', maxCount: 1 },
  { name: 'promotionalImage', maxCount: 1 }
]), (req, res) => profileEventsController.updateEvent(req, res));
profileRouter.delete('/events/:eventId', authMiddleware, (req, res) => profileEventsController.deleteEvent(req, res));



//bookings section
profileRouter.get('/bookings', authMiddleware, (req, res) => profileBookingController.getUserBookings(req, res));
profileRouter.post('/events/cancel', authMiddleware, (req, res) => profileBookingController.cancelTicket(req, res));


//wallet section
profileRouter.get('/wallet', authMiddleware, (req, res) => profileWalletController.getUserWallet(req, res));



export default profileRouter;
