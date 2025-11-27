import mongoose, { model, Schema } from "mongoose"
import { BookingInterfaace } from "../interfaces/booking.interface"

const BookingSchema: Schema = new Schema({
     userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true
    },
    movieId: {
      type: mongoose.Types.ObjectId,
      ref: "Movie",
      required: true
    },
    theaterId: {
      type: mongoose.Types.ObjectId,
      ref: "Theater",
      required: true
    },
    showId: {
      type: mongoose.Types.ObjectId,
      ref: "Show",
      required: true
    },
    seats: {
      type: [Number],
      required: true
    },
    totalAmount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ["Confirmed", "Cancelled","Pending"],
      default: "Confirmed"
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Unpaid"],
      default: "Unpaid"
    },
    bookedAt: {
      type: Date,
      default: Date.now
    }
  },{
    timestamps: true
  });

  
// Indexes for better performance
BookingSchema.index({ userId: 1 });
BookingSchema.index({ showId: 1 });
BookingSchema.index({ createdAt: 1 });

const bookingModel = model<BookingInterfaace>("Booking", BookingSchema)
export { bookingModel }