import mongoose, { ClientSession, Types } from "mongoose";
import { BookingInterfaace, CreateBooking } from "../interfaces/booking.interface";
import { bookingModel } from "../models/booking.model";
import { showModel } from "../models/show.model";


class BookingRepositories {

    async confirmAndCreateBooking(params: {
        showId: string;
        seats: string[];           // seat identifiers e.g. ["A1","A2"]
        sessionId: string;         // lock session id
        userId: string;            // user making booking
        totalAmount: number;
    }): Promise<BookingInterfaace> {
        const { showId, seats, sessionId, userId, totalAmount } = params;

        const session: ClientSession = await mongoose.startSession();
        try {
            session.startTransaction();

            // load show doc in transaction
            const show = await showModel.findById(new Types.ObjectId(showId)).session(session);
            if (!show) {
                throw new Error("Show not found");
            }

            // remove expired locks from memory view (not persisted yet)
            const now = new Date();
            show.locks = show.locks.filter(lock => lock.expiresAt > now);

            // Check seats already booked
            const alreadyBooked = seats.filter((s) => show.bookedSeats.includes(s));
            if (alreadyBooked.length > 0) {
                throw new Error(`Seats already booked: ${alreadyBooked.join(", ")}`);
            }

            // Debug: Log current locks and seats
            console.log('🔍 Current locks:', show.locks);
            console.log('🔍 Requested seats:', seats);
            console.log('🔍 Session ID:', sessionId);

            // Ensure seats are locked by this session
            const notLocked = seats.filter(s =>
                // !show.locks.some(lock => lock.seat === s && lock.sessionId === sessionId)
                !show.locks.some(lock =>
                    lock.seat === s &&
                    lock.sessionId === sessionId &&
                    new Date(lock.expiresAt) > now
                )
            );
            if (notLocked.length > 0) {
                throw new Error(`Seats not locked or lock expired: ${notLocked.join(", ")}`);
            }

            // Update show: push bookedSeats & remove locks for these seats
            await showModel.updateOne(
                { _id: show._id },
                {
                    $addToSet: { bookedSeats: { $each: seats } },
                    $pull: { locks: { seat: { $in: seats } } }
                },
                { session }
            );

            // Create booking doc
            const bookingDoc = await bookingModel.create(
                [
                    {
                        userId: new Types.ObjectId(userId),
                        movieId: show.movieId,
                        theaterId: show.theaterId,
                        showId: new Types.ObjectId(showId),
                        seats,
                        totalAmount,
                        status: "Confirmed",
                        paymentStatus: "Paid",
                        bookedAt: new Date()
                    }
                ],
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            // bookingDoc is array from create([...])
            return bookingDoc[0] as unknown as BookingInterfaace;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async createBooking(adminPayload: {
        userId: string; movieId: string; theaterId: string; showId: string;
        seats: string[]; totalAmount: number;
        status?: "Confirmed" | "Cancelled" | "Pending"; paymentStatus?: "Paid" | "Unpaid";
    }): Promise<BookingInterfaace> {

        const doc = await bookingModel.create({
            userId: new Types.ObjectId(adminPayload.userId),
            movieId: new Types.ObjectId(adminPayload.movieId),
            theaterId: new Types.ObjectId(adminPayload.theaterId),
            showId: new Types.ObjectId(adminPayload.showId),
            seats: adminPayload.seats.map(s => typeof s === "string" ? s : String(s)),
            totalAmount: adminPayload.totalAmount,
            status: adminPayload.status ?? "Confirmed",
            paymentStatus: adminPayload.paymentStatus ?? "Paid",
            bookedAt: new Date()
        });

        return doc.toObject() as BookingInterfaace;
    }

    async getBookingById(bookingId: string) {
        const objId = new Types.ObjectId(bookingId);
        const data = await bookingModel.aggregate([
            { $match: { _id: objId } },
            {
                $lookup: {
                    from: "movies",
                    localField: "movieId",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "theaters",
                    localField: "theaterId",
                    foreignField: "_id",
                    as: "theater"
                }
            },
            { $unwind: { path: "$theater", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "shows",
                    localField: "showId",
                    foreignField: "_id",
                    as: "show"
                }
            },
            { $unwind: { path: "$show", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1,
                    seats: 1,
                    totalAmount: 1,
                    status: 1,
                    paymentStatus: 1,
                    bookedAt: 1,
                    createdAt: 1,
                    movie: { _id: "$movie._id", moviename: "$movie.moviename", poster: "$movie.poster" },
                    theater: { _id: "$theater._id", theatername: "$theater.theatername", district: "$theater.district" },
                    show: { _id: "$show._id", date: "$show.date", room: "$show.room", timeSlots: "$show.timeSlots" }
                }
            }
        ]);

        return data[0] ?? null;
    }

    async getBookingsByUser(userId: string, limit = 50, skip = 0) {
        const userObj = new Types.ObjectId(userId);

        const data = await bookingModel.aggregate([

            { $match: { userId: userObj } },
            { $sort: { createdAt: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $lookup: {
                    from: "movies",
                    localField: "movieId",
                    foreignField: "_id",
                    as: "movie"
                }
            },
            { $unwind: { path: "$movie", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "theaters",
                    localField: "theaterId",
                    foreignField: "_id",
                    as: "theater"
                }
            },
            { $unwind: { path: "$theater", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    userId: 1,
                    seats: 1,
                    totalAmount: 1,
                    status: 1,
                    paymentStatus: 1,
                    bookedAt: 1,
                    createdAt: 1,
                    movie: { _id: "$movie._id", moviename: "$movie.moviename", poster: "$movie.poster" },
                    theater: { _id: "$theater._id", theatername: "$theater.theatername", district: "$theater.district" }
                }
            }
        ]);

        return data;
    }

    async updateBooking(bookingId: string, payload: Partial<CreateBooking> & { status?: string; paymentStatus?: string; }, currentUserId?: string) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const booking = await bookingModel.findById(bookingId).session(session);
            if (!booking) {
                throw new Error("Booking not found");
            }

            // If cancelling and booking was Confirmed -> free seats
            if (payload.status === "Cancelled" && booking.status === "Confirmed") {
                // remove booked seats from show
                await showModel.updateOne(
                    { _id: booking.showId },
                    { $pull: { bookedSeats: { $in: booking.seats } } },
                    { session }
                );
            }

            // apply updates to booking
            if (payload.totalAmount !== undefined) booking.totalAmount = payload.totalAmount;
            if (payload.status !== undefined) booking.status = payload.status as any;
            if (payload.paymentStatus !== undefined) booking.paymentStatus = payload.paymentStatus as any;

            await booking.save({ session });

            await session.commitTransaction();
            session.endSession();

            return booking.toObject();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    async deleteBooking(bookingId: string) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const booking = await bookingModel.findById(bookingId).session(session);
            if (!booking) {
                throw new Error("Booking not found");
            }

            if (booking.status === "Confirmed") {
                await showModel.updateOne(
                    { _id: booking.showId },
                    { $pull: { bookedSeats: { $in: booking.seats } } },
                    { session }
                );
            }

            await bookingModel.deleteOne({ _id: bookingId }).session(session);

            await session.commitTransaction();
            session.endSession();
            return true;
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }

    // Add this to your show repository
    async releaseSeats(showId: string, seats: string[], sessionId: string) {
        const session = await mongoose.startSession();
        try {
            session.startTransaction();

            const show = await showModel.findById(new Types.ObjectId(showId)).session(session);
            if (!show) {
                throw new Error("Show not found");
            }

            // Remove locks for these seats with this sessionId
            await showModel.updateOne(
                { _id: show._id },
                {
                    $pull: {
                        locks: {
                            seat: { $in: seats },
                            sessionId: sessionId
                        }
                    }
                },
                { session }
            );

            await session.commitTransaction();
            session.endSession();

            return { releasedSeats: seats };
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
}

export const bookingRepository = new BookingRepositories();
