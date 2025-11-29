import mongoose, { Types } from "mongoose"

export interface BookingInterfaace {

    userId: Types.ObjectId;
    movieId: Types.ObjectId;
    theaterId: Types.ObjectId;
    showId: Types.ObjectId;
    seats: string[];
    totalAmount: number;
    status: "Confirmed" | "Cancelled" | "Pending";
    paymentStatus: "Paid" | "Unpaid";
    bookedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface CreateBooking {
    seats: string[];
    totalAmount: number;
    status: "Confirmed" | "Cancelled" | "Pending";
    paymentStatus: "Paid" | "Unpaid";
}

export interface LockSeatRequest {
    showId: string;
    seats: string[];
    sessionId: string;
    ttlSeconds?: number;
}

export interface ConfirmBookingRequest {
    showId: string;
    seats: string[];
    userId: string;
    totalAmount: number;
    sessionId: string;
}