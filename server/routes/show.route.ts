import express from 'express';
const showRouter = express.Router();

import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import { allShowController } from '../controllers/show.controller';

showRouter.post('/create', protect, authorizeRoles('admin'), allShowController.create)
showRouter.get("/movie/:movieId", protect, authorizeRoles('admin', 'user'), allShowController.getShowsByMovie)
showRouter.get('/:id', protect, authorizeRoles('admin', 'user'), allShowController.getShowById)

showRouter.get('/:movieId/times', protect, authorizeRoles('admin', 'user'), allShowController.getShowTimesByDate); // Filter Show Times

showRouter.get('/theater/:theaterId/movie/:movieId', protect, authorizeRoles('admin', 'user'), allShowController.getShowByTheaterMovieDateTime);

showRouter.put('/show/:id', protect, authorizeRoles('admin'), allShowController.updateShow);
showRouter.delete('/show/:id', protect, authorizeRoles('admin'), allShowController.deleteShow);

showRouter.delete('/release-expired-locks', protect, authorizeRoles('admin'), allShowController.releaseExpiredSeatLocks);


showRouter.get('/debug/all', allShowController.debugAllShows);

export { showRouter }