import { Router } from "express";
import { AdminUsersController } from "../../../src/controllers/implementation/admin/user/admin.users.controller";
import { container } from 'tsyringe';

const adminUsersController = container.resolve(AdminUsersController);
const adminUsersRouter=Router()


//Customer section
adminUsersRouter.get('/all-users',(req,res)=>adminUsersController.fetchAllUsers(req,res))
adminUsersRouter.post('/get-details',(req, res) => adminUsersController.fetchUserById(req, res))
adminUsersRouter.patch('/block-user',(req,res)=>adminUsersController.blockAndUnblockUser(req,res));
adminUsersRouter.patch('/unblock-user',(req,res)=>adminUsersController.unblockAndUnblockUser(req,res));
//Verification section
adminUsersRouter.get('/verification-users',(req,res)=>adminUsersController.fetchAllRequestedUsers(req,res));
adminUsersRouter.patch('/approve-user',(req,res)=>adminUsersController.approveUser(req,res));
adminUsersRouter.patch('/reject-user',(req,res)=>adminUsersController.rejectUser(req,res));


export default adminUsersRouter;
