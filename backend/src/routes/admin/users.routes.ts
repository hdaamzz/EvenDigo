import { Router } from "express";
import { AdminUsersController } from "../../controllers/implementation/admin/user/admin.users.controller";
import { container } from 'tsyringe';
import { requireAdminRole } from "../../middlewares/rolebased.middleware";

const adminUsersController = container.resolve(AdminUsersController);
const adminUsersRouter = Router()

//Customer section
adminUsersRouter.get('/all-users', (req, res) => adminUsersController.fetchAllUsers(req, res))
adminUsersRouter.get('/search-users',requireAdminRole, (req, res) => adminUsersController.searchUsers(req, res))
adminUsersRouter.post('/get-details',requireAdminRole, (req, res) => adminUsersController.fetchUserById(req, res))
adminUsersRouter.patch('/block-user',requireAdminRole, (req, res) => adminUsersController.blockAndUnblockUser(req, res));
adminUsersRouter.patch('/unblock-user',requireAdminRole, (req, res) => adminUsersController.unblockAndUnblockUser(req, res));

//Verification section
adminUsersRouter.get('/verification-users',requireAdminRole, (req, res) => adminUsersController.fetchAllRequestedUsers(req, res));
adminUsersRouter.get('/search-verification-users',requireAdminRole, (req, res) => adminUsersController.searchVerificationUsers(req, res));
adminUsersRouter.patch('/approve-user',requireAdminRole, (req, res) => adminUsersController.approveUser(req, res));
adminUsersRouter.patch('/reject-user', requireAdminRole,(req, res) => adminUsersController.rejectUser(req, res));

export default adminUsersRouter;