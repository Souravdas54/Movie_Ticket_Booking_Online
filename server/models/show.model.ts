import { model, Schema, } from 'mongoose';
import { ShowInterface } from '../interfaces/show.interface';

const ShowSchema: Schema = new Schema({

    movieId: {
        type: Schema.Types.ObjectId,
        ref: "Movie",
        required: true
    },
    theaterId: {
        type: Schema.Types.ObjectId,
        ref: "Theather",
        required: true
    },
    room: {
        name: String,
        rows: Number,
        columns: Number
    },
    screenNumber: {
        type: String,
        required: true
    },
    showTime: {
        type: [String],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    totalSeats: {
        type: Number,
        default: function () {
            return this.room.rows * this.room.columns;
        }
    },
    bookedSeats: {
        type: [String],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


}, {
    timestamps: true
})

const showModel = model<ShowInterface>('Show', ShowSchema)
export { showModel }