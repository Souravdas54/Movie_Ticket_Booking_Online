import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BookingState {
    selectedShowId: string | null;
    selectedSeats: string[];
    lockedSeats: string[];
    pricePerSeat: number;
    sessionId: string | null;
    showDetails: {
        theaterName: string;
        movieName: string;
        showTime: string;
        date: string;
    } | null;
}

const initialState: BookingState = {
    selectedShowId: null,
    selectedSeats: [],
    lockedSeats: [],
    pricePerSeat: 0,
    sessionId: null,
    showDetails: null,
};

const bookingSlice = createSlice({
    name: "booking",
    initialState,
    reducers: {
        setShow(state, action: PayloadAction<{
            showId: string;
            price: number;
            sessionId: string;
            theaterName: string;
            movieName: string;
            showTime: string;
            date: string;
        }>) {
            state.selectedShowId = action.payload.showId;
            state.pricePerSeat = action.payload.price;
            state.sessionId = action.payload.sessionId;
            state.selectedSeats = [];
            state.lockedSeats = [];
            state.showDetails = {
                theaterName: action.payload.theaterName,
                movieName: action.payload.movieName,
                showTime: action.payload.showTime,
                date: action.payload.date,
            };
        },
         toggleSeat(state, action: PayloadAction<string>) {
      const seat = action.payload;
      const index = state.selectedSeats.indexOf(seat);
      if (index > -1) {
        state.selectedSeats.splice(index, 1);
      } else {
        state.selectedSeats.push(seat);
      }
    },
    setLockedSeats(state, action: PayloadAction<string[]>) {
      state.lockedSeats = action.payload;
    },
    clearSeats(state) {
      state.selectedSeats = [];
    },
    clearBooking(state) {
      state.selectedShowId = null;
      state.selectedSeats = [];
      state.lockedSeats = [];
      state.pricePerSeat = 0;
      state.sessionId = null;
      state.showDetails = null;
    },
    setSessionId(state, action: PayloadAction<string>) {
      state.sessionId = action.payload;
    },
  },
});

export const {setShow,toggleSeat,setLockedSeats,clearSeats,clearBooking,setSessionId,} = bookingSlice.actions;
export default bookingSlice.reducer;
