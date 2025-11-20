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
}
const movieRepositories = new MovieRepositories();
export { movieRepositories }