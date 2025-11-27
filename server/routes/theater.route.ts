import express from 'express';
import { protect, refreshTokenProtect, authorizeRoles } from '../middleware/user.middleaware';
import { allTheaterController } from "../controllers/theater.controller"

const theaterRouter = express.Router();

theaterRouter.post('/theather/create', protect, authorizeRoles('admin'), allTheaterController.create);
theaterRouter.get("/movie/:movieId", protect, authorizeRoles("user","admin"), allTheaterController.getTheatersByMovie);
// theaterRouter.get("/:theaterId", allTheaterController/.);

// theaterRouter.get("/search/nearest-theaters", protect, authorizeRoles("admin"), allTheaterController.nearby)
theaterRouter.get("/search/theaters-by-state", protect, authorizeRoles("user"), allTheaterController.getTheatersByState);
theaterRouter.get("/search/theaters-by-district", protect, authorizeRoles("user"), allTheaterController.getByDistrict);



export { theaterRouter }