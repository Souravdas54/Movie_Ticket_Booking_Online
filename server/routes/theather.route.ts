import express from 'express';
import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import {allTheatherController} from "../controllers/theather.controller"

const theatherRouter = express.Router();

theatherRouter.post('/theather/create',protect,authorizeRoles('admin'),allTheatherController.create);

export {theatherRouter}