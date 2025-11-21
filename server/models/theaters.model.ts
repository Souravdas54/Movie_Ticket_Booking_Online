import { model, Schema, Types } from 'mongoose';
import { TheatersInterface } from "../interfaces/theaters.interface";

const TheaterSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    theatername: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    screens: {
        type: String,
        required: true,
    },
    contact: {
        type: String,
        required: true,
    },
    assignedMovies: {
        type: [Schema.Types.ObjectId],
        required: true,
        ref: "Movie"
    },
}, {
    timestamps: true
});

const theaterModel = model<TheatersInterface>("Theather", TheaterSchema);
export { theaterModel }