import express from 'express';
const bookingRouter = express.Router();

import { protect, authorizeRoles } from '../middleware/user.middleaware';
import { bookingController } from '../controllers/booking.controller';


bookingRouter.post('/lock', protect, authorizeRoles('user', 'admin'), bookingController.lock)
bookingRouter.post('/confirm', protect, authorizeRoles('user', 'admin'), bookingController.confirm)
bookingRouter.get('/my-bookings', protect, authorizeRoles('user', 'admin'), bookingController.getUserBookings);

export { bookingRouter }