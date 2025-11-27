import { Request, Response } from "express";
import { theaterRepositories } from "../repository/theater.repo"
import { CreateTheatersInterface } from "../interfaces/theaters.interface";

class AllTheaterController {

    async create(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user?.userId;
            // const movieId = req.body.movieId;
            const userRole = req.user?.role;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: User ID missing"
                });
            }

            if (!userRole) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: Role missing"
                });
            }

            // if (!movieId) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Movie ID is required"
            //     });
            // }
            const theatherData: CreateTheatersInterface = {
                theatername: req.body.theatername,
                // location: {
                //     type: "Point",
                //     coordinates: [
                //         Number(req.body.longitude),
                //         Number(req.body.latitude)
                //     ]
                // },
                screens: req.body.screens,
                contact: req.body.contact,
                assignedMovies: req.body.assignedMovies,
                district: req.body.district,
                state: req.body.state || "West Bengal",
                showTimes: req.body.showTimes || ["10:00 AM", "1:30 PM", "4:45 PM", "8:00 PM", "11:15 PM"]
            }

            const theather = await theaterRepositories.create(theatherData, userId, userRole)

            return res.status(201).json({
                success: true,
                message: "Movie created successfully",
                data: theather
            });

        } catch (error: unknown) {
            console.log("Controller Error - theatherCreate:", error);

            // Proper error handling for unknown type
            let errorMessage = "Something went wrong";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            return res.status(400).json({
                success: false,
                message: errorMessage
            });
        }
    }

    async getTheatersByMovie(req: Request, res: Response) {
        try {
            const { movieId } = req.params;

            if (!movieId) {
                return res.status(400).json({
                    success: false,
                    message: "Movie ID is required"
                });
            }

            const theaters = await theaterRepositories.getTheatersByMovie(movieId);

            res.status(200).json({
                success: true,
                count: theaters.length,
                data: theaters
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Failed to fetch theaters for this movie"
            });
        }
    }

    // async nearby(req: Request, res: Response) {
    //     try {
    //         const {movieId, } = req.query;

    //         if (!movieId) {
    //             return res.status(400).json({
    //                 success: false,
    //                 message: "movieID are required"
    //             });
    //         }

            // const lat = Number(latitude);
            // const lng = Number(longitude);

            // const lat = parseFloat(latitude as string);
            // const lng = parseFloat(longitude as string);

            // if (isNaN(lat) || isNaN(lng)) {
            //     return res.status(400).json({
            //         success: false,
            //         message: "Invalid coordinates"
            //     });
            // }
            // console.log(`Searching theaters near: [${lat}, ${lng}], movieId: ${movieId}`)

            // const theaters = await theaterRepositories.getNearbyTheaters(
            //     movieId ? String(movieId) : undefined,
                // lat, lng,
                // maxDistance ? Number(maxDistance) : 100000
                // movieId?.toString(),
                //  movieId as string
            // );

    //         res.status(200).json({
    //             success: true,
    //             count: theaters.length,
    //             data: theaters,
    //             message: theaters.length === 0 ? "No theaters found in your area" : "Theaters found successfully"
    //         });

    //     } catch (error) {
    //         res.status(500).json({
    //             success: false,
    //             message: "Failed to fetch nearby theaters"
    //         });
    //     }
    // }

    async getTheatersByState(req: Request, res: Response) {
        try {
            const { state, movieId } = req.query;

            if (!state) {
                return res.status(400).json({
                    success: false,
                    message: "State is required"
                });
            }

            const data = await theaterRepositories.getTheatersByState(
                // String(state),
                state as string,
                movieId as string);

            res.status(200).json({
                success: true,
                data
            });
        } catch (error) {
            res.status(500).json({ success: false, message: "Error fetching theaters" });
        }
    }

    async getByDistrict(req: Request, res: Response) {
        try {
            const { district, movieId } = req.query;

            if (!district) {
                return res.status(400).json({
                    success: false,
                    message: "District is required"
                });
            }

            const data = await theaterRepositories.getTheatersByDistrict(
                district as string,
                movieId as string
            );

            res.status(200).json({
                success: true,
                total: data.length,
                data
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "Server Error"
            });
        }
    }


}

const allTheaterController = new AllTheaterController()
export { allTheaterController }