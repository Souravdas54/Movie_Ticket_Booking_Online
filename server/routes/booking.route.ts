import express from 'express';
const bookingRouter = express.Router();

import { protect, authorizeRoles } from '../middleware/user.middleaware';
import { bookingController } from '../controllers/booking.controller';


bookingRouter.post('/lock', protect, authorizeRoles('user', 'admin'), bookingController.lock)
bookingRouter.post('/confirm', protect, authorizeRoles('user', 'admin'), bookingController.confirm)
bookingRouter.get('/my-booking', protect, authorizeRoles('user', 'admin'), bookingController.getUserBookings);

bookingRouter.get("/:id", protect, bookingController.getBookingById);
bookingRouter.put("/:id", protect, authorizeRoles("admin"), bookingController.updateBooking);
bookingRouter.delete("/:id", protect, authorizeRoles("admin"), bookingController.deleteBooking);

// Add this route
bookingRouter.post('/release', protect, authorizeRoles('user', 'admin'), bookingController.release);


export { bookingRouter }