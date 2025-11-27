import { model, Schema, } from 'mongoose';
import { ShowInterface } from '../interfaces/show.interface';

const LockSchema = new Schema({
    seat: String,
    sessionId: String,
    expiresAt: Date,
}, { _id: false });

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
        name: { type: String, required: true },
        rows: { type: Number, required: true },
        columns: { type: Number, required: true }
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
    locks: {
        type: [LockSchema], // transient locks
        default: []
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

// Index for better performance
ShowSchema.index({ movieId: 1, date: 1 });
ShowSchema.index({ theaterId: 1 });
ShowSchema.index({ "locks.expiresAt": 1 }, { expireAfterSeconds: 0 });

const showModel = model<ShowInterface>('Show', ShowSchema)
export { showModel }