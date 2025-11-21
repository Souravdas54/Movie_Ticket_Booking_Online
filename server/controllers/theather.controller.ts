import { Request, Response } from "express";
import { theatherRepositories } from "../repository/theather.repo"

class AllTheatherController {

    async create(req: Request, res: Response): Promise<any> {
        try {
            const userId = req.user?.userId;
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

            const theatherData = {
                theatername: req.body.theatername,
                location: req.body.location,
                screens: req.body.screens,
                contact: req.body.contact,
                assignedMovies: req.body.assignedMovies,
            }

            const theather = await theatherRepositories.create(theatherData, userId, userRole)

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
}

const allTheatherController = new AllTheatherController()
export { allTheatherController }