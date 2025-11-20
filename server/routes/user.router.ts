import express from 'express';
import { userController } from '../controllers/user.controller';
import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import upload from '../middleware/upload.middleware';

const userRouter = express.Router();

// Public routes
userRouter.post('/signup', upload.single('profilePicture'), userController.register)
userRouter.post('/signin', userController.login)
// userRouter.get('/verify-email/:token', userController.verifyEmail);
userRouter.post('/refresh-token', refreshTokenProtect, userController.refreshToken);

// Protected routes
userRouter.get('/profile', protect, userController.getUserprofile);
userRouter.get('/profile/user/:id', protect, userController.getUserById);
userRouter.put('/profile/update/:id', protect, upload.single('profilePicture'), userController.updateProfile);
userRouter.post('/logout', protect, authorizeRoles('user'), userController.logout);

// Admin only routes
userRouter.get('/admin/profile', protect, authorizeRoles('admin'), userController.getUserprofile);

export { userRouter };