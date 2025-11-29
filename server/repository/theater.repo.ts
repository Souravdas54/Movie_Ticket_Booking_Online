import { roleModel } from "../models/role.model";
import { theaterModel } from "../models/theaters.model";
import { TheatersInterface, CreateTheatersInterface } from "../interfaces/theaters.interface";
import { Types } from "mongoose";

class TheaterRepositories {

    async create(theatersData: CreateTheatersInterface, userId: string, userRole: string): Promise<TheatersInterface> {
        try {
            // Check role (Admin only)
            const roleDoc = await roleModel.findOne({ name: userRole });

            if (!roleDoc) {
                throw new Error("Role not found");
            }

            if (roleDoc.name !== "admin") {
                throw new Error("Only Admin can create movies");
            }

            const theatersToCreate = {
                userId: userId,
                theatername: theatersData.theatername,
                screens: theatersData.screens,
                contact: theatersData.contact,
                assignedMovies: theatersData.assignedMovies,
                district: theatersData.district,
                state: theatersData.state,

            }

            const newTheaters = await theaterModel.create(theatersToCreate)
            return newTheaters;
        }
        catch (error) {
            console.log("Repository Error - create:", error);
            throw error;
        }
    }

    async getTheatersByMovie(movieId: string): Promise<any[]> {
        try {
            return await theaterModel.aggregate([
                {
                    $match: {
                        assignedMovies: {
                            $in: [new Types.ObjectId(movieId)]
                        }
                    }
                },
                {
                    $project: {
                        theatername: 1,
                        district: 1,
                        state: 1,
                        screens: 1,
                        contact: 1,
                        assignedMovies: 1
                    }
                }
            ]);
        } catch (error) {
            console.error("Repository Error - getTheatersByMovie:", error);
            throw error;
        }
    }

    // async getNearbyTheaters(lat: number, lng: number): Promise<TheatersInterface[]> {
    //     return await theaterModel.find({
    //         location: {
    //             $near: {
    //                 $geometry: {
    //                     type: "Point",
    //                     coordinates: [lng, lat]
    //                 },
    //                 $maxDistance: 5000 // 5 KM
    //             }
    //         }
    //     });
    // }

    // async getNearbyTheaters(movieId?: string,): Promise<any> {
    //     try {
    //         const match: any = {};
    //         if (movieId) {
    //             match.assignedMovies = { $in: [new Types.ObjectId(movieId)] };
    //         }
    //         return await theaterModel.find(match).select("theatername district state screens contact assignedMovies");
    //     }
    //     catch (error) {
    //         console.error("Repository Error - getNearbyTheaters:", error);
    //         throw error;
    //     }

    //     // const query: any = {
    //     //     location: {
    //     //         $near: {
    //     //             $geometry: {
    //     //                 type: "Point",
    //     //                 coordinates: [lng, lat]
    //     //             },
    //     //             $maxDistance: 50000 // 50 KM (increased from 5km)
    //     //         }
    //     //     }
    //     // };

    //     // if (movieId) {
    //     //     query.movieId = movieId;
    //     // }

    //     // return await theaterModel.find(query).populate('movieId');

    // }

    // async getNearbyTheaters(lat: number, lng: number, movieId?: string, maxDistance = 100000): Promise<any> {
    //     try {
    //         const geoNearStage: any = {

    //             $geoNear: {
    //                 near: {
    //                     type: "Point",
    //                     // coordinates: [lng, lat]
    //                     coordinates: [Number(lng), Number(lat)] 
    //                 },
    //                 distanceField: "distance",
    //                 maxDistance: maxDistance, // 100 KM
    //                 // maxDistance: 50000, // 50 km
    //                 // maxDistance: 150000 // 150 KM
    //                 spherical: true,
    //                 query: {}

    //             }

    //         };

    //         if (movieId && Types.ObjectId.isValid(movieId)) {
    //             geoNearStage.$geoNear.query = {
    //                 assignedMovies: {
    //                     $in: [new Types.ObjectId(movieId)]
    //                 }
    //             };
    //         }

    //         // if (movieId && Types.ObjectId.isValid(movieId)) {
    //         //     geoStage.$geoNear.query.assignedMovies = {
    //         //         assignedMovies: {
    //         //             $in: [new Types.ObjectId(movieId)]
    //         //         }
    //         //     };
    //         // }

    //         // if (movieId) {
    //         //     pipeline.push({
    //         //         $match: {
    //         //             assignedMovies: new Types.ObjectId(movieId)
    //         //         }
    //         //     });
    //         // }

    //         return await theaterModel.aggregate([geoNearStage]);

    //         //    const matchStage: any = {};

    //         // if (movieId) {
    //         //     matchStage.assignedMovies = {
    //         //         $in: [new Types.ObjectId(movieId)]
    //         //     };
    //         // }

    //         // return await theaterModel.aggregate([
    //         //     {
    //         //         $geoNear: {
    //         //             near: { type: "Point", coordinates: [lng, lat] },
    //         //             distanceField: "distance",
    //         //             maxDistance: 50000, // 50 KM (increased from 5km)
    //         //             spherical: true
    //         //         }
    //         //     },
    //         //     { $match: matchStage }
    //         // ]);
    //     } catch (error) {
    //         console.error("Repository Error - getNearbyTheaters:", error);
    //         throw error;
    //     }

    //     // const query: any = {
    //     //     location: {
    //     //         $near: {
    //     //             $geometry: {
    //     //                 type: "Point",
    //     //                 coordinates: [lng, lat]
    //     //             },
    //     //             $maxDistance: 50000 // 50 KM (increased from 5km)
    //     //         }
    //     //     }
    //     // };

    //     // if (movieId) {
    //     //     query.movieId = movieId;
    //     // }

    //     // return await theaterModel.find(query).populate('movieId');

    // }


    async getTheatersByState(state: string, movieId?: string): Promise<TheatersInterface[]> {
        try {
            const match: any = { state };

            if (movieId) {
                match.assignedMovies = { $in: [new Types.ObjectId(movieId)] };
            }

            return await theaterModel.find(match);
            // return await theaterModel.aggregate([
            //     { $match: match }
            // ]);

        } catch (error) {
            console.error("Repository Error - getTheatersByState:", error);
            throw error;
        }
    }

    async getTheatersByDistrict(district: string, movieId?: string) {
        try {
            const match: any = {
                district: { $regex: `^${district}$`, $options: "i" }
            };

            if (movieId) {
                match.assignedMovies = { $in: [new Types.ObjectId(movieId)] };
            }

            return await theaterModel.find(match);

            // return await theaterModel.aggregate([
            //     { $match: match }
            // ]);

        } catch (error) {
            console.error("Repository Error - getTheatersByDistrict:", error);
            throw error;
        }
    }

    async getTheaterById(theaterId: string): Promise<TheatersInterface | null> {
        try {
            const result = await theaterModel.aggregate([
                { $match: { _id: new Types.ObjectId(theaterId) } }
            ]);

            return result[0] || null;

        } catch (error) {
            console.error("Repository Error - getTheaterById:", error);
            throw error;
        }

    }


}

const theaterRepositories = new TheaterRepositories();
export { theaterRepositories }