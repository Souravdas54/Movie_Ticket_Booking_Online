import { Request, Response } from "express";
import { Types } from "mongoose";
import { bookingRepository } from "../repository/booking.repo";
import { showRepository } from "../repository/show.repo"; // you already have this for lockSeats
import { LockSeatRequest, ConfirmBookingRequest } from "../interfaces/booking.interface";

class BookingController {
    // Lock seats (calls showRepository.lockSeats)
    async lock(req: Request, res: Response): Promise<Response> {
        try {
            const payload: LockSeatRequest = req.body;
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }

            if (!payload.showId || !payload.seats || !payload.sessionId) {
                return res.status(400).json({ success: false, message: "Missing fields" });
            }

            const result = await showRepository.lockSeats(payload.showId, payload.seats, payload.sessionId, payload.ttlSeconds || 300);

            return res.status(200).json({ success: true, message: "Seats locked", data: result.data });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ success: false, message: msg });
        }
    }

    // Confirm booking: atomic update on show + create booking document
    async confirm(req: Request, res: Response): Promise<Response> {
        try {
            const payload: ConfirmBookingRequest = req.body;
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

            if (!payload.showId || !payload.seats || !payload.sessionId || typeof payload.totalAmount !== "number") {
                return res.status(400).json({ success: false, message: "Missing required fields" });
            }

            // confirm & create booking (atomic)
            const booking = await bookingRepository.confirmAndCreateBooking({
                showId: payload.showId,
                seats: payload.seats,
                sessionId: payload.sessionId,
                userId: userId,
                totalAmount: payload.totalAmount
            });

            return res.status(201).json({ success: true, message: "Booking confirmed", data: booking });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Server error";
            // handle common conflict messages with 409
            if (typeof msg === "string" && msg.includes("already booked") || msg.includes("not locked")) {
                return res.status(409).json({ success: false, message: msg });
            }
            return res.status(500).json({ success: false, message: msg });
        }
    }

    // Get bookings for current user (pagination optional)
    async getUserBookings(req: Request, res: Response): Promise<Response> {
        try {
            const userId = req.user?.userId;
            if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

            const limit = typeof req.query.limit === "string" ? parseInt(req.query.limit, 10) : 50;
            const skip = typeof req.query.skip === "string" ? parseInt(req.query.skip, 10) : 0;

            const bookings = await bookingRepository.getBookingsByUser(userId, limit, skip);
            return res.json({ success: true, data: bookings });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ success: false, message: msg });
        }
    }

    // Get booking by id
    async getBookingById(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const booking = await bookingRepository.getBookingById(id);
            if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });
            return res.json({ success: true, data: booking });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ success: false, message: msg });
        }
    }

    // Admin or user update booking (status/payment)
    async updateBooking(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            const payload = req.body;
            const updated = await bookingRepository.updateBooking(id, payload, req.user?.userId);
            return res.json({ success: true, message: "Booking updated", data: updated });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ success: false, message: msg });
        }
    }

    // Delete booking (admin or owner)
    async deleteBooking(req: Request, res: Response): Promise<Response> {
        try {
            const { id } = req.params;
            // permission check may be added here (admin or owner)
            await bookingRepository.deleteBooking(id);
            return res.json({ success: true, message: "Booking deleted" });
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Server error";
            return res.status(500).json({ success: false, message: msg });
        }
    }

    // Add this to your booking controller
async release(req: Request, res: Response): Promise<Response> {
    try {
        const { showId, seats, sessionId } = req.body;
        const userId = req.user?.userId;
        
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        if (!showId || !seats || !sessionId) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        // You need to add this method to bookingRepository
        const result = await bookingRepository.releaseSeats(showId, seats, sessionId);
        
        return res.status(200).json({ success: true, message: "Seats released", data: result });
    } catch (err) {
        const msg = err instanceof Error ? err.message : "Server error";
        return res.status(500).json({ success: false, message: msg });
    }
}
}

const bookingController = new BookingController();
export {bookingController}
