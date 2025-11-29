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
        ref: "Theater",
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
    date: {
        type: Date,
        required: true
    },
    timeSlots: [
        {
            time: { type: String, required: true },
            availableCategories: [
                {
                    category: {
                        type: String,
                        enum: ["Golden", "Platinum", "Diamond", "Royal"],
                        required: true
                    },
                    price: { type: Number, required: true }
                },
            ]
        }
    ],
    totalSeats: {
        type: Number,
        default: function () {
            return this.room.rows * this.room.columns;
        }
    },
    bookedSeats: {
        type: [String],
        default: []
    },
    locks: {
        type: [LockSchema], // transient locks
        default: []
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },


}, {
    timestamps: true
})

// Duplicate show prevention
ShowSchema.index({ movieId: 1, theaterId: 1, date: 1 }, { unique: true });

// Faster search
ShowSchema.index({ movieId: 1, date: 1 });
ShowSchema.index({ theaterId: 1 });

// Normalize date
// ShowSchema.pre("save", function (next) {
//     if (this.date instanceof Date) {
//         const d = new Date(this.date);
//         d.setHours(0, 0, 0, 0);
//         this.date = d;
//     }
//     next();
// });

// ShowSchema.pre("save", function (next) {
//   if (this.date) {
//     const date = new Date(this.date);

//     // Force Local date only (no timezone shift)
//     const normalized = new Date(
//       date.getFullYear(),
//       date.getMonth(),
//       date.getDate()
//     );

//     this.date = normalized;
//   }
//   next();
// });

// Add this pre-save hook to your show model
ShowSchema.pre("save", function (next) {
    if (this.isModified('date')) {
        // If date is a Date object, convert to consistent string format
        if (this.date instanceof Date) {
            const date = new Date(this.date);
            // Format as YYYY-MM-DD string
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            this.date = `${year}-${month}-${day}`;
        }
        // If it's already a string in wrong format, normalize it
        else if (typeof this.date === 'string' && this.date.includes('T')) {
            const dateObj = new Date(this.date);
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            this.date = `${year}-${month}-${day}`;
        }
    }
    next();
});

const showModel = model<ShowInterface>('Show', ShowSchema)
export { showModel }