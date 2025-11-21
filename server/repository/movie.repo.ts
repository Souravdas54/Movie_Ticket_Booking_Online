import mongoose from "mongoose";
import { movieModel } from "../models/movie.model";
import { roleModel } from "../models/role.model";


class MovieRepositories {

    async create(movieData: any, userId: string, userRole: string) {
        try {
            // Check role (Admin only)
            const roleDoc = await roleModel.findOne({ name: userRole });

            if (!roleDoc) {
                throw new Error("Role not found");
            }

            if (roleDoc.name !== "admin") {
                throw new Error("Only Admin can create movies");
            }

            // Movie data object
            const movieToCreate = {
                userId: userId,
                moviename: movieData.moviename,
                genre: movieData.genre,
                language: movieData.language,
                duration: movieData.duration,
                cast: movieData.cast,
                director: movieData.director,
                releaseDate: movieData.releaseDate,
                description: movieData.description,
                poster: movieData.poster,
                rating: movieData.rating,
                votes: movieData.votes,
                likes: movieData.likes,
                promoted: movieData.promoted
            };

            const newMovie = await movieModel.create(movieToCreate);
            return newMovie;

        } catch (error) {
            console.log("Repository Error - create:", error);
            throw error;
        }
    }

    async find() {
        try {
            const getAllMovies = await movieModel.find()

            // const getAllMovies = await movieModel.aggregate([
            //     {
            //         $lookup: {
            //             from: "users",
            //             localField: "userId",
            //             foreignField: "_id",
            //             as: "createdBy"
            //         }
            //     },
            //     {
            //         $unwind: {
            //             path: "$createdBy",
            //             preserveNullAndEmptyArrays: true
            //         }
            //     },
            //     {
            //         $project: {
            //             moviename: 1,
            //             genre: 1,
            //             language: 1,
            //             duration: 1,
            //             cast: 1,
            //             director: 1,
            //             releaseDate: 1,
            //             description: 1,
            //             poster: 1,
            //             rating: 1,
            //             votes: 1,
            //             likes: 1,
            //             promoted: 1,
            //             createdAt: 1,
            //             "createdBy.name": 1,
            //             "createdBy.email": 1
            //         }
            //     },
            //     {
            //         $sort: { createdAt: -1 }
            //     }
            // ]);
           
            return getAllMovies;
        } catch (error) {
            console.log("Repository Error - find:", error);
            throw error;
        }
    }

    async findById(id: string) {
        try {
            const movie = await movieModel.aggregate([
                {
                    $match: { _id: new mongoose.Types.ObjectId(id) }
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "userId",
                        foreignField: "_id",
                        as: "createdBy"
                    }
                },
                {
                    $unwind: {
                        path: "$createdBy",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $project: {
                        moviename: 1,
                        genre: 1,
                        language: 1,
                        duration: 1,
                        cast: 1,
                        director: 1,
                        releaseDate: 1,
                        description: 1,
                        poster: 1,
                        rating: 1,
                        votes: 1,
                        likes: 1,
                        promoted: 1,
                        createdAt: 1,
                        "createdBy.name": 1,
                        "createdBy.email": 1
                    }
                }
            ]);

            return movie.length > 0 ? movie[0] : null;

        } catch (error) {
            console.log("Repository Error - findById:", error);
            throw error;
        }
    }
}
const movieRepositories = new MovieRepositories();
export { movieRepositories }