export interface Show {
  _id: string;
  movieId: string;
  theaterId: {
    _id: string;
    theatername: string;
    district?: string;
  };
  room: {
    name: string;
    rows: number;
    columns: number;
  };
  screenNumber: string;
  showTime: string[];
  date: string;
  totalSeats: number;
  bookedSeats: string[];
  locks: Lock[];
  price: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Lock {
  seat: string;
  sessionId: string;
  expiresAt: string;
}

export interface Booking {
  _id: string;
  userId: string;
  movieId: string;
  theaterId: string;
  showId: string;
  seats: string[];
  totalAmount: number;
  status: "Confirmed" | "Cancelled" | "Pending";
  paymentStatus: "Paid" | "Unpaid";
  bookedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface LockSeatRequest {
  showId: string;
  seats: string[];
  sessionId: string;
  ttlSeconds?: number;
}

export interface ConfirmBookingRequest {
  showId: string;
  seats: string[];
  totalAmount: number;
  sessionId: string;
}

export interface ShowDetails {
  room: {
    name: string;
    rows: number;
    columns: number;
  };
  date: string;
  showTime: string[];
}

export interface SeatLockResponse {
  success: boolean;
  message?: string;
  alreadyBooked?: string[];
  alreadyLocked?: string[];
  data?: {
    lockedSeats: string[];
  };
}