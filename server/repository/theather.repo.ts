import { roleModel } from "../models/role.model";
import { theaterModel } from "../models/theaters.model";
import { TheatersInterface, CreateTheatersInterface } from "../interfaces/theaters.interface";

class TheatherRepositories {

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
                location: theatersData.location,
                screens: theatersData.screens,
                contact: theatersData.contact,
                assignedMovies: theatersData.assignedMovies
            }

            const newTheaters = await theaterModel.create(theatersToCreate)
            return newTheaters;
        }
        catch (error) {
            console.log("Repository Error - create:", error);
            throw error;
        }
    }

}

const theatherRepositories = new TheatherRepositories();
export { theatherRepositories }