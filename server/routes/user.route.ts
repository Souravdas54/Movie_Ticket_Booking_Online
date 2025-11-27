import express from 'express';

const userRouter = express.Router();

import { userController } from '../controllers/user.controller';
import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import { CreateuploadFolder } from '../middleware/upload.middleware';
import { otpVerification } from '../utils/otp.verification';

const upload = CreateuploadFolder('authentication') // Create Folder name

// Public routes
userRouter.post('/signup', upload.single('profilePicture'), userController.register)
userRouter.post('/signin', userController.login)
// userRouter.get('/verify-email/:token', userController.verifyEmail);
userRouter.post('/refresh-token', refreshTokenProtect, userController.refreshToken);

userRouter.post('/verify-otp',otpVerification.verify_Otp)
userRouter.post('/resend-otp',otpVerification.resend_OTP)

// Protected routes
userRouter.get('/profile', protect, userController.getUserprofile);
userRouter.get('/profile/user/:id', protect, userController.getUserById);
userRouter.put('/profile/update/:id', protect, upload.single('profilePicture'), userController.updateProfile);
userRouter.post('/logout', protect, authorizeRoles('user'), userController.logout);

// Admin only routes
// userRouter.get('/admin/profile', protect, authorizeRoles('admin'), userController.getUserprofile);

export { userRouter };