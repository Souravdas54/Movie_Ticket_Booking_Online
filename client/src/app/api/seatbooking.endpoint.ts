import {
    ApiResponse,
    Booking,
    ConfirmBookingRequest,
    LockSeatRequest,
    Show,
    SeatLockResponse
} from "@/types/booking";
import axiosInstance from "./axios.instance";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8500';

// Show endpoints
export const getShowsByMovie = async (movieId: string, date?: string): Promise<ApiResponse<Show[]>> => {
    try {
        const url = date
            ? `${API_URL}/shows/show-movie/${movieId}?date=${date}`
            : `${API_URL}/shows/show-movie/${movieId}`;

        const response = await axiosInstance.get(url);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching shows:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch shows';
        throw new Error(errorMessage);
    }
};

export const getShowById = async (showId: string): Promise<ApiResponse<Show>> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/shows/show/${showId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching show:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch show';
        throw new Error(errorMessage);
    }
};

export const createShow = async (showData: unknown): Promise<ApiResponse<Show>> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/shows/show/create`, showData);
        return response.data;
    } catch (error: any) {
        console.error('Error creating show:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to create show';
        throw new Error(errorMessage);
    }
};

// Booking endpoints
export const lockSeats = async (payload: LockSeatRequest): Promise<SeatLockResponse> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/bookings/lock`, payload);
        return response.data;
    } catch (error: any) {
        console.error('Error locking seats:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to lock seats';
        throw new Error(errorMessage);
    }
};

export const confirmBooking = async (payload: ConfirmBookingRequest): Promise<ApiResponse<Booking>> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/bookings/confirm`, payload);
        return response.data;
    } catch (error: any) {
        console.error('Error confirming booking:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to confirm booking';
        throw new Error(errorMessage);
    }
};

export const releaseSeats = async (payload: LockSeatRequest): Promise<{ success: boolean }> => {
    try {
        const response = await axiosInstance.post(`${API_URL}/bookings/release`, payload);
        return response.data;
    } catch (error: any) {
        console.error('Error releasing seats:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to release seats';
        throw new Error(errorMessage);
    }
};

export const getUserBookings = async (): Promise<ApiResponse<Booking[]>> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/bookings/my-bookings`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching bookings:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch bookings';
        throw new Error(errorMessage);
    }
};

// Movie endpoints
export const getMovieById = async (movieId: string): Promise<ApiResponse<any>> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/movies/${movieId}`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching movie:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch movie';
        throw new Error(errorMessage);
    }
};

export const getAllMovies = async (): Promise<ApiResponse<any[]>> => {
    try {
        const response = await axiosInstance.get(`${API_URL}/movies`);
        return response.data;
    } catch (error: any) {
        console.error('Error fetching movies:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch movies';
        throw new Error(errorMessage);
    }
};




// import { ApiResponse, Booking, ConfirmBookingRequest, LockSeatRequest, Show } from "@/types/booking";
// import axiosInstance from "./axios.instance";

// const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8500';

// // Show endpoints
// export const getShowsByMovie = async (movieId: string, date?: string): Promise<ApiResponse<Show[]>> => {
//     try {
//         const url = date
//             ? `${API_URL}/shows/show-movie/${movieId}?date=${date}`
//             : `${API_URL}/shows/show-movie/${movieId}`;

//         const response = await axiosInstance.get(url);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error fetching shows:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to fetch shows');
//     }
// };

// export const getShowById = async (showId: string): Promise<ApiResponse<Show>> => {
//     try {
//         const response = await axiosInstance.get(`${API_URL}/shows/show/${showId}`);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error fetching show:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to fetch show');
//     }
// };

// export const createShow = async (showData: unknown): Promise<ApiResponse<Show>> => {
//     try {
//         const response = await axiosInstance.post(`${API_URL}/shows/show/create`, showData);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error creating show:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to create show');
//     }
// };

// // Booking endpoints
// export const lockSeats = async (payload: LockSeatRequest): Promise<ApiResponse<{ lockedSeats: string[] }>> => {
//     try {
//         const response = await axiosInstance.post(`${API_URL}/bookings/lock`, payload);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error locking seats:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to lock seats');
//     }
// };

// export const confirmBooking = async (payload: ConfirmBookingRequest): Promise<ApiResponse<Booking>> => {
//     try {
//         const response = await axiosInstance.post(`${API_URL}/bookings/confirm`, payload);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error confirming booking:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to confirm booking');
//     }
// };

// export const getUserBookings = async (): Promise<ApiResponse<Booking[]>> => {
//     try {
//         const response = await axiosInstance.get(`${API_URL}/bookings/my-bookings`);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error fetching bookings:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to fetch bookings');
//     }
// };

// // Movie endpoints
// export const getMovieById = async (movieId: string): Promise<ApiResponse<unknown>> => {
//     try {
//         const response = await axiosInstance.get(`${API_URL}/movies/${movieId}`);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error fetching movie:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to fetch movie');
//     }
// };

// export const getAllMovies = async (): Promise<ApiResponse<unknown[]>> => {
//     try {
//         const response = await axiosInstance.get(`${API_URL}/movies`);
//         return response.data;
//     } catch (error: unknown) {
//         console.error('Error fetching movies:', error);
//         if (error instanceof Error) {
//             throw new Error(error.message);
//         }
//         throw new Error('Failed to fetch movies');
//     }
// };