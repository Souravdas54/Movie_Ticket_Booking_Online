import mongoose from "mongoose";
import { showModel } from "../models/show.model";
import { ShowInterface, CreateMovieShow } from "../interfaces/show.interface";
import { roleModel } from "../models/role.model";

class ShowRepository {
    async create(showData: CreateMovieShow, createdBy: string, userRole: string): Promise<ShowInterface> {
        try {
            // Check role (Admin only)
            const roleDoc = await roleModel.findOne({ name: userRole });

            if (!roleDoc) {
                throw new Error("Role not found");
            }

            if (roleDoc.name !== "admin") {
                throw new Error("Only Admin can create movies");
            }

            const showtocreate = {
                movieId: showData.movieId,
                theaterId: showData.theaterId,

                room: {
                    name: showData.room.name,
                    rows: showData.room.rows,
                    columns: showData.room.columns
                },
                screenNumber: showData.screenNumber,
                showTime: showData.showTime,
                date: showData.date,
                totalSeats: showData.totalSeats,
                price: showData.price,
                bookedSeats: [],
                createdBy: createdBy,
            }

            const newShow = await showModel.create(showtocreate)
            return newShow;

        } catch (error) {
            console.log("Repository Error - create:", error);
            throw error;
        }
    }
}

export const showRepository = new ShowRepository();
