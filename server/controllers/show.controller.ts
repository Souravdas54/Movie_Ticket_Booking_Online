import { Request, Response } from "express";
import { showRepository } from '../repository/show.repo';

class AllShowController {
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

            const showData = req.body;

            const newShow = await showRepository.create(
                showData,
                userId,
                userRole
            );

            return res.status(201).json({
                success: true,
                message: "Show created successfully",
                data: newShow
            });
        } catch (error: unknown) {
            console.log("Controller Error - theatherCreate:", error);

            // Proper error handling for unknown type
            let errorMessage = "Internal Server Error";
            if (error instanceof Error) {
                errorMessage = error.message;
            }

            return res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
}

const allShowController = new AllShowController()
export { allShowController }