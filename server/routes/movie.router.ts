import express from 'express';
import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import upload from '../middleware/upload.middleware';
import { movieControllers } from '../controllers/movie.controller';

const movieRouter = express.Router();

movieRouter.post('/add/movies', protect, authorizeRoles('admin'), upload.single('poster'), movieControllers.movieCreate);

export { movieRouter }