import express from 'express';
const showRouter = express.Router();

import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import { allShowController } from '../controllers/show.controller';

showRouter.post('/show/create', protect, authorizeRoles('admin'), allShowController.create)
showRouter.get("/show-movie/:movieId", protect, authorizeRoles('admin', 'user'), allShowController.getShowsByMovie)
showRouter.get('/show/:id', protect, authorizeRoles('admin', 'user'), allShowController.getShowById)

export { showRouter }