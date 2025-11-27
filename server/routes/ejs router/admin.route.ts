import express from 'express';
import { adminController } from '../../controllers/Ejs/admim.ejs.controller';
import { userController } from '../../controllers/user.controller';

const adminRouter = express.Router();

import { protect, authorizeRoles } from '../../middleware/user.middleaware';



// Admin routes
adminRouter.get('/dashboard', adminController.admin_dashboard);

adminRouter.get('/login', adminController.login);

// Post Api
adminRouter.post('/signin',userController.login)

export { adminRouter };