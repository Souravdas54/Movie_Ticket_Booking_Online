import mongoose from "mongoose";

export interface TheatersInterface {
    userId: mongoose.Types.ObjectId;
    theatername: String,
    location: String,
    screens: String,
    contact: String,
    assignedMovies: mongoose.Types.ObjectId,
}

export interface CreateTheatersInterface {
    theatername: String,
    location: String,
    screens: String,
    contact: String,
    assignedMovies: mongoose.Types.ObjectId,
}