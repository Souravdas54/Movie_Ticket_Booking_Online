import axios from "axios";

import axiosInstance from "./axios.instance";
import { ReactMovieRequest, SimulateRatingRequest, SimulateRatingResponse } from "@/types/movie";

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8500' // BACKEND - SERVER HTTP API


export const getAllMovies = async () => {
    try {
        const res = await axios.get(`${API_URL}/movies/get/all-movies`);

        if (res.data && res.data.success) {
            return res.data.data; // Return the actual movies array
        } else {
            throw new Error('Invalid response structure');
        }

    } catch (error: unknown) {

        if (axios.isAxiosError(error)) {
            throw new Error(error.response?.data?.message || 'Failed to fetch movies');
        }
        throw new Error('Failed to fetch movies');
        // throw new Error('Movies endpoint not found. Please check the API route.');

    }
    // Handle specific error cases


}

export const getMovieById = async (id: string) => {
    try {
        const res = await axiosInstance.get(`${API_URL}/movies/${id}`);
        console.log('API Response:', res.data);

        if (res.data && res.data.success) {
            return res.data;

        } else {
            throw new Error(res.data?.message || 'Movie not found');
        }
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            console.error('Please login to view movie details:', error.response?.data);
            throw new Error(error.response?.data?.message || 'Failed to fetch movie');
        }
        throw new Error('Failed to fetch movie');
    }
}

export const movieEndpoints = {
 
  // Like/Unlike/Vote for movie
  reactMovie: async (movieId: string, data: ReactMovieRequest) => {
    try {
        
        const response = await axiosInstance.patch(`${API_URL}/movie/${movieId}/react`, data);
        return response.data;
    } catch (error:unknown) {
        
    }
  },

  // Simulate rating
  simulateRating: async (movieId: string, data: SimulateRatingRequest): Promise<SimulateRatingResponse> => {
   try {
       const response = await axiosInstance.post(`${API_URL}/movie/${movieId}/simulate`, data);
       return response.data;
    
   } catch (error:unknown) {
    
   }
  },

  // Get all movies
  getAllMovies: async () => {
    const response = await axiosInstance.get(`${API_URL}/movies`);
    return response.data;
  },

  // Get single movie details
  getMovieById: async (movieId: string) => {
    const response = await axiosInstance.get(`${API_URL}/movies/movie-get/${movieId}`);
    return response.data;
  }
};