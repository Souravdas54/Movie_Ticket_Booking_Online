import mongoose from "mongoose";

export interface MovieInterface {
    userId: mongoose.Types.ObjectId;
    moviename: string;
    genre: string;
    language: string;
    duration: string;
    cast: string[];
    director: string[];
    releaseDate: string;
    description: string;
    poster: string;
    rating: number;
    ratingScale: 5 | 10; // ratingScale
    votes?: number;
    likes?: number;
    promoted?: boolean;
}