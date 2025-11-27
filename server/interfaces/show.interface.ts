import mongoose from "mongoose";

export interface LockInterface {
    seat: string;
    sessionId: string;
    expiresAt: Date;
}

export interface ShowInterface {
    movieId: mongoose.Types.ObjectId,
    theaterId: mongoose.Types.ObjectId,
    room: {
        name: string;      // Room A / Room B
        rows: number;      // e.g 5
        columns: number;   // e.g 10
    };
    screenNumber: string,
    showTime: string[],
    date: Date,
    totalSeats: number,
    bookedSeats: string[],
    locks: LockInterface[],
    price: number,
    createdBy: mongoose.Types.ObjectId, // ADMIN ID
    createdAt: Date,
    updatedAt: Date
}

export interface CreateMovieShow {
    movieId: mongoose.Types.ObjectId,
    theaterId: mongoose.Types.ObjectId,
    room: {
        name: string;      // Room A / Room B
        rows: number;      // e.g 5
        columns: number;   // e.g 10
    };
    screenNumber: string,
    showTime: string[],
    date: Date,
    totalSeats: number,
    bookedSeats: string[],
    price: number,
    createdAt: Date,
    updatedAt: Date
}
export interface ShowSummary {
    _id: string;
    theaterId: {
        _id: string;
        theatername: string;
        district?: string;
    };
    room: {
        name: string;
        rows: number;
        columns: number;
    };
    showTime: string[];
    date: string;
    price: number;
    bookedSeats: string[];
}