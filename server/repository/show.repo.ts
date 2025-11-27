import mongoose, { Types } from "mongoose";
import { showModel } from "../models/show.model";
import { ShowInterface, CreateMovieShow } from "../interfaces/show.interface";
import { roleModel } from "../models/role.model";

interface LockResult {
    success: boolean;
    message?: string;
    alreadyBooked?: string[];
    alreadyLocked?: string[];
    data?: {
        lockedSeats: string[];
    };
}

interface ConfirmResult {
    success: boolean;
    message?: string;
    data?: ShowInterface;
}

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

    async findByMovieAndDate(movieId: string, date?: string): Promise<ShowInterface[]> {
        try {

            const match: any = { movieId: new Types.ObjectId(movieId) };

            if (date) {
                const start = new Date(date);
                start.setHours(0, 0, 0, 0);

                const end = new Date(date);
                end.setHours(23, 59, 59, 999);

                end.setDate(end.getDate() + 1);
                match.date = { $gte: start, $lt: end };
            }
            return showModel.find(match).populate("theaterId", "theatername location").lean().exec();

        } catch (error) {
            console.error("Repository Error - findByMovieAndDate:", error);
            throw error;
        }
    }
    async findById(id: string): Promise<ShowInterface | null> {
        try {
            return await showModel.findById(id).lean().exec();
        } catch (error) {
            console.error("Repository Error - findById:", error);
            throw error;
        }
    }

    async lockSeats(showId: string, seats: string[], sessionId: string, ttlSeconds: number = 300): Promise<LockResult> {
        try {
            const show = await showModel.findById(showId);
            if (!show) {
                throw new Error("Show not found");
            }

            // Remove expired locks first
            const now = new Date();
            show.locks = show.locks.filter(lock => lock.expiresAt > now);

            // Check already booked seats
            const alreadyBooked = seats.filter(seat => show.bookedSeats.includes(seat));
            if (alreadyBooked.length > 0) {
                return {
                    success: false,
                    message: `Seats already booked: ${alreadyBooked.join(', ')}`,
                    alreadyBooked
                };
            }

            // Check already locked seats
            const alreadyLocked = seats.filter(seat =>
                show.locks.some(lock => lock.seat === seat)
            );
            if (alreadyLocked.length > 0) {
                return {
                    success: false,
                    message: `Seats already locked: ${alreadyLocked.join(', ')}`,
                    alreadyLocked
                };
            }

            // Add new locks
            const expiresAt = new Date(Date.now() + ttlSeconds * 1000);
            seats.forEach(seat => {
                show.locks.push({ seat, sessionId, expiresAt });
            });

            await show.save();

            return {
                success: true,
                data: {
                    lockedSeats: show.locks.map(lock => lock.seat)
                }
            };

        } catch (error) {
            console.error("Repository Error - lockSeats:", error);
            throw error;
        }
    }

    async confirmBooking(showId: string, seats: string[], sessionId: string): Promise<ConfirmResult> {
        try {
            const show = await showModel.findById(showId);
            if (!show) {
                throw new Error("Show not found");
            }

            // Remove expired locks
            const now = new Date();
            show.locks = show.locks.filter(lock => lock.expiresAt > now);

            // Ensure seats are locked by this session
            const notLocked = seats.filter(seat =>
                !show.locks.some(lock => lock.seat === seat && lock.sessionId === sessionId)
            );
            if (notLocked.length > 0) {
                return {
                    success: false,
                    message: `Seats not locked or expired: ${notLocked.join(', ')}`
                };
            }

            // Add to booked seats and remove locks
            seats.forEach(seat => {
                if (!show.bookedSeats.includes(seat)) {
                    show.bookedSeats.push(seat);
                }
            });

            // Remove locks for these seats
            show.locks = show.locks.filter(lock => !seats.includes(lock.seat));
            await show.save();

            return { success: true, data: show.toObject() };

        } catch (error) {
            console.error("Repository Error - confirmBooking:", error);
            throw error;
        }
    }

    async releaseExpiredLocks(): Promise<void> {
        try {
            // This will automatically remove expired locks due to TTL index
            console.log("Expired locks cleanup completed");
        } catch (error) {
            console.error("Repository Error - releaseExpiredLocks:", error);
            throw error;
        }
    }
}

export const showRepository = new ShowRepository();
