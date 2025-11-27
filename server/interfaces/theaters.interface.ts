import mongoose from "mongoose";

// export interface GeoLocation {
//     type: "Point";
//     coordinates: [number, number]; // [longitude, latitude]
// }

export interface TheatersInterface {
    userId: mongoose.Types.ObjectId;
    // movieId: mongoose.Types.ObjectId,
    theatername: String,
    // location: GeoLocation,
    screens: String,
    contact: String,
    assignedMovies: mongoose.Types.ObjectId[],
    district: string;
    state: string;
    availableDates: Date[];   // ✅ NEW
    showTimes: string[];
}

export interface CreateTheatersInterface {
    theatername: String,
    // location: GeoLocation,
    screens: String,
    contact: String,
    assignedMovies: mongoose.Types.ObjectId[],
    district: string;
    state: string;
    showTimes: string[];
}

