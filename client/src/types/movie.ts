export interface Movie {
  _id: string;
  moviename: string;
  genre: string[];
  language: string;
  duration: string;
  cast: string[];
  director: string;
  releaseDate: string;
  description: string;
  poster: string;
  rating: number;
  votes: number;
  createdAt: string;
  updatedAt: string;
}