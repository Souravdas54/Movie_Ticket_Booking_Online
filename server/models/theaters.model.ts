import { model, Schema, Types } from 'mongoose';
import { TheatersInterface } from "../interfaces/theaters.interface";

const TheaterSchema: Schema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    // movieId: {
    //     type: Schema.Types.ObjectId,
    //     ref: "Movie",
    //     required: true
    // },
    theatername: {
        type: String,
        required: true,
    },
    // location: {
    //     type: {
    //         type: String,
    //         enum: ["Point"],
    //         required: true,
    //     },
    //     coordinates: {
    //         type: [Number], // [longitude, latitude]
    //         required: true
    //     }
    // },
    district: {
        type: String,
        required: true
    },
    state: {
        type: String,
        default: "West Bengal"
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
    showTimes: { // Added show times
        type: [String],
        required: true,
        default: ["10:00 AM", "1:30 PM", "4:45 PM", "8:00 PM", "11:15 PM"]
    },
    availableDates: {
        type: [Date],
        required: true
    }
}, {
    timestamps: true
});

// This enables geo search
// TheaterSchema.index({ location: "2dsphere" });

const theaterModel = model<TheatersInterface>("Theater", TheaterSchema);
export { theaterModel }