import mongoose, { Types } from "mongoose"

export interface BookingInterfaace {

    userId: Types.ObjectId;
    movieId: Types.ObjectId;
    theaterId: Types.ObjectId;
    showId: Types.ObjectId;
    seats: number[];
    totalAmount: number;
    status: "Confirmed" | "Cancelled";
    paymentStatus: "Paid" | "Unpaid";
    bookedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBooking {
    seats: number[];
    totalAmount: number;
    status: "Confirmed" | "Cancelled";
    paymentStatus: "Paid" | "Unpaid";
}