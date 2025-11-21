import { Request, Response } from "express";
import { movieRepositories } from "../repository/movie.repo";

class AllMoviesControllers {

    async movieCreate(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user?.userId;   // Middleware থেকে userId এসেছে
            const userRole = req.user?.role;   // Middleware থেকে role এসেছে

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

            // Poster upload → multer 
            const poster = req.file ? req.file.path : null;

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: "Poster image is required"
                });
            }

            const movieData = {
                moviename: req.body.moviename,
                genre: req.body.genre,
                language: req.body.language,
                duration: req.body.duration,
                cast: req.body.cast ? JSON.parse(req.body.cast) : [],
                director: req.body.director ? JSON.parse(req.body.director) : [],
                releaseDate: req.body.releaseDate,
                description: req.body.description,
                poster,
                rating: Number(req.body.rating),
                votes: Number(req.body.votes) || 0,
                likes: Number(req.body.likes) || 0,
                promoted: req.body.promoted === "true"
            };

            const movie = await movieRepositories.create(movieData, userId, userRole);

            return res.status(201).json({
                success: true,
                message: "Movie created successfully",
                data: movie
            });

        } catch (error: any) {
            console.log("Controller Error - movieCreate:", error);

            return res.status(400).json({
                success: false,
                message: error.message || "Something went wrong"
            });
        }
    }

    async getAllovies(req: Request, res: Response): Promise<any> {
        try {
            const getAllMovies = await movieRepositories.find();

            if (getAllMovies && getAllMovies.length > 0) {
                return res.status(200).json({
                    success: true,
                    message: "Get All Movies successfully",
                    total: getAllMovies.length,
                    data: getAllMovies,
                });
            } else {
                return res.status(404).json({
                    success: false,
                    message: "No users found",
                    data: []
                });
            }
        } catch (error: unknown) {
            console.log("Controller Error - get all movie:", error);

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

    async getMovieById(req: Request, res: Response): Promise<any> {
        try {
            const { id } = req.params;

            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: "Movie ID is required"
                });
            }

            const movie = await movieRepositories.findById(id);

            if (!movie) {
                return res.status(404).json({
                    success: false,
                    message: "Movie not found"
                });
            }

            return res.status(200).json({
                success: true,
                message: "Movie retrieved successfully",
                data: movie
            });
        } catch (error: unknown) {
            console.log("Controller Error - get movie by id:", error);

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
}

export const movieControllers = new AllMoviesControllers()