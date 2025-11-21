import express from 'express';
const showRouter = express.Router();

import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import { allShowController } from '../controllers/show.controller';

showRouter.post('/show/create',protect,authorizeRoles('admin'),allShowController.create)

export {showRouter}