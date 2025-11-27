import { Request, Response } from "express";
import { showRepository } from '../repository/show.repo';
import { bookingModel } from "../models/booking.model";
import { ConfirmBookingRequest, LockSeatRequest } from "../interfaces/booking.interface";
import { Types } from "mongoose";

class BookingController {
    async lock(req: Request, res: Response): Promise<Response> {
        try {
            const { showId, seats, sessionId, ttlSeconds }: LockSeatRequest = req.body;

            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: User authentication required"
                });
            }


            if (!showId || !seats || !sessionId) {
                return res.status(400).json({
                    success: false,
                    message: "Missing fields"
                });
            }

            if (seats.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "At least one seat must be selected"
                });
            }


            const result = await showRepository.lockSeats(showId, seats, sessionId, ttlSeconds || 300);

            return res.status(200).json({
                success: true,
                message: "Seats locked successfully",
                data: result.data
            });

        } catch (error: unknown) {
            console.error("Controller Error - lock:", error);

            const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
            return res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }

    async confirm(req: Request, res: Response): Promise<Response> {
        try {
            const { showId, seats, totalAmount, sessionId }: ConfirmBookingRequest = req.body;

            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: User authentication required"
                });
            }

            if (!showId || !seats || !totalAmount || !sessionId || !Array.isArray(seats)) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields"
                });
            }

            const confirmResult = await showRepository.confirmBooking(showId, seats, sessionId);

            if (!confirmResult.success) {
                return res.status(409).json(confirmResult);
            }

            // Get show details to get movieId and theaterId
            const show = await showRepository.findById(showId);
            if (!show) {
                return res.status(404).json({
                    success: false,
                    message: "Show not found"
                });
            }


            // create booking doc
            const booking = await bookingModel.create({
                userId: new Types.ObjectId(userId),
                movieId: show.movieId,
                theaterId: show.theaterId,
                showId: new Types.ObjectId(showId),
                seats,
                totalAmount,
                status: "Confirmed" as const,
                paymentStatus: "Paid" as const,
                bookedAt: new Date()
            });

            return res.status(201).json({
                success: true,
                message: "Booking confirmed successfully",
                data: booking
            });

        } catch (error: unknown) {
            console.error("Controller Error - confirm:", error);

            const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
            return res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }

    async getUserBookings(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.userId;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized: User authentication required"
                });
            }

            const bookings = await bookingModel
                .find({ userId: new Types.ObjectId(userId) })
                .populate("movieId", "moviename poster")
                .populate("theaterId", "theatername location")
                .populate("showId", "date showTime room")
                .sort({ createdAt: -1 })
                .exec();

            return res.json({
                success: true,
                data: bookings
            });

        } catch (error: unknown) {
            console.error("Controller Error - getUserBookings:", error);

            const errorMessage = error instanceof Error ? error.message : "Internal Server Error";
            return res.status(500).json({
                success: false,
                message: errorMessage
            });
        }
    }
}

export const bookingController = new BookingController();
