import express from 'express';
const movieRouter = express.Router();

import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import { movieControllers } from '../controllers/movie.controller';

import { CreateuploadFolder } from '../middleware/upload.middleware';
const upload = CreateuploadFolder('movies') // Create Folder name


movieRouter.post('/create', protect, authorizeRoles('admin'), upload.single('poster'), movieControllers.movieCreate);

movieRouter.get('/get/all-movies',movieControllers.getAllovies)

movieRouter.get('/movie-get/:id',protect,authorizeRoles('admin','user'),movieControllers.getMovieById)

export { movieRouter }