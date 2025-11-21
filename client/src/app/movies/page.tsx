"use client";

import React, { useEffect, useState } from "react";
import { getAllMovies } from "../api/endpoint";
import { useRouter } from "next/navigation";
import {
  Alert,
  CircularProgress,
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Chip,
  IconButton,
  useTheme,
  useMediaQuery,
  Button
} from "@mui/material";
import {
  ArrowBackIos as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  Favorite,
  Star,
  PlayArrow,
  CalendarToday
} from "@mui/icons-material";
import "./moviestyle.css";

interface Movie {
  _id: string;
  moviename: string;
  genre: string;
  language: string;
  rating: number;
  duration?: string;
  releaseDate?: string;
  poster?: string;
  votes?: number;
  likes?: number;
}

const MoviesHome: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.only('xs'));
  const isSm = useMediaQuery(theme.breakpoints.only('sm'));
  const isMd = useMediaQuery(theme.breakpoints.only('md'));
  const isLg = useMediaQuery(theme.breakpoints.only('lg'));

  const getItemsPerSlide = () => {
    if (isXs) return 1;
    if (isSm) return 2;
    if (isMd) return 4;
    if (isLg) return 5;
    return 5;
  };

  const itemsPerSlide = getItemsPerSlide();
  const totalSlides = Math.ceil(movies.length / itemsPerSlide);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        const moviesData = await getAllMovies();
        
        if (Array.isArray(moviesData) && moviesData.length > 0) {
          setMovies(moviesData);
        } else {
          setMovies([]);
          setError("No movies available in the database");
        }
      } catch (error: any) {
        console.error("Error in fetchMovies:", error);
        setError(error.message || "Failed to load movies. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handleNextSlide = async () => {
    if (currentSlide < totalSlides - 1 && !isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(prev => prev + 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handlePrevSlide = async () => {
    if (currentSlide > 0 && !isAnimating) {
      setIsAnimating(true);
      setCurrentSlide(prev => prev - 1);
      setTimeout(() => setIsAnimating(false), 500);
    }
  };

  const handleMovieClick = (movieId: string) => {
    router.push(`/booking/${movieId}`);
  };

  const handleBookNow = (movieId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/booking/${movieId}`);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxyZWN0IHg9IjUwIiB5PSI0MCIgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMjAiIHJ4PSI4IiBmaWxsPSIjQkRDNUM5Ii8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjYwIiByPSIyMCIgZmlsbD0iIzlBOUE5QSIvPgo8L3N2Zz4=';
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getRandomPromoted = () => {
    return Math.random() > 0.7;
  };

  // Get current slide movies
  const getCurrentSlideMovies = () => {
    const startIndex = currentSlide * itemsPerSlide;
    return movies.slice(startIndex, startIndex + itemsPerSlide);
  };

  if (loading) {
    return (
      <Box className="movies-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box className="loading-container">
          <CircularProgress size={50} sx={{ color: '#1976d2' }} />
          <Typography variant="h6" sx={{ mt: 2, color: '#666', fontWeight: 500 }}>
            Loading Movies...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="movies-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="error" sx={{ borderRadius: 3, maxWidth: 400, boxShadow: 2 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  if (movies.length === 0) {
    return (
      <Box className="movies-container" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Alert severity="info" sx={{ borderRadius: 3, maxWidth: 400, boxShadow: 2 }}>
          No movies found. Please check back later.
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="movies-container">
      {/* Header - Left Aligned */}
      <Box className="movies-header">
        <Box className="header-content">
          <Typography className="movies-title">
            Recommended Movies
          </Typography>
          <Typography className="movies-subtitle">
            Curated collection of trending movies
          </Typography>
          <Box className="header-decoration">
            <Box className="decoration-line"></Box>
            <PlayArrow className="decoration-icon" />
          </Box>
        </Box>
      </Box>

      {/* Carousel Container */}
      <Box className="carousel-container">
        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <IconButton
              onClick={handlePrevSlide}
              disabled={currentSlide === 0 || isAnimating}
              className={`nav-arrow left-arrow ${isAnimating ? 'animating' : ''}`}
            >
              <ArrowBackIcon />
            </IconButton>

            <IconButton
              onClick={handleNextSlide}
              disabled={currentSlide === totalSlides - 1 || isAnimating}
              className={`nav-arrow right-arrow ${isAnimating ? 'animating' : ''}`}
            >
              <ArrowForwardIcon />
            </IconButton>
          </>
        )}

        {/* Movies Carousel */}
        <Box className="carousel-track">
          <Box className={`carousel-slide ${isAnimating ? 'slide-transition' : ''}`}>
            {getCurrentSlideMovies().map((movie) => (
              <Card
                key={movie._id}
                className="movie-card"
                onClick={() => handleMovieClick(movie._id)}
                sx={{
                  flex: `0 0 calc(${100 / itemsPerSlide}% - ${24 - (24 / itemsPerSlide)}px)`,
                  minWidth: 0
                }}
              >
                {/* Promoted Badge */}
                {getRandomPromoted() && (
                  <Box className="promoted-badge">
                    <Star className="promoted-star" />
                    TRENDING
                  </Box>
                )}

                {/* Movie Poster */}
                <Box className="poster-container">
                  <CardMedia
                    component="img"
                    className="movie-poster"
                    image={movie.poster || ''}
                    alt={movie.moviename}
                    onError={handleImageError}
                  />
                  <Box className="poster-overlay">
                    <Button 
                      variant="contained" 
                      className="book-now-btn"
                      onClick={(e) => handleBookNow(movie._id, e)}
                      startIcon={<CalendarToday />}
                    >
                      Book Now
                    </Button>
                  </Box>
                </Box>

                <CardContent className="movie-content">
                  {/* Movie Title */}
                  <Typography className="movie-title">
                    {movie.moviename}
                  </Typography>

                  {/* Movie Info */}
                  <Box className="movie-meta">
                    <Typography className="movie-language">
                      {movie.language}
                    </Typography>
                    <Typography className="movie-duration">
                      {movie.duration || '2h 30m'}
                    </Typography>
                  </Box>

                  {/* Rating and Votes */}
                  <Box className="rating-section">
                    <Box className="rating-badge">
                      <Star className="rating-star" />
                      <Typography className="rating-score">
                        {movie.rating || 0}/10
                      </Typography>
                    </Box>
                    <Typography className="votes-count">
                      {formatNumber(movie.votes || 0)} votes
                    </Typography>
                  </Box>

                  {/* Likes */}
                  <Box className="likes-section">
                    <Favorite className="likes-heart" />
                    <Typography className="likes-count">
                      {formatNumber(movie.likes || Math.floor(Math.random() * 50000) + 1000)} likes
                    </Typography>
                  </Box>

                  {/* Genre Chips */}
                  <Box className="genre-container">
                    {movie.genre?.split('/').slice(0, 2).map((genre, index) => (
                      <Chip
                        key={index}
                        label={genre.trim()}
                        className="genre-chip"
                        size="small"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>

        {/* Slide Indicators */}
        {totalSlides > 1 && (
          <Box className="slide-indicators">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <Box
                key={index}
                className={`slide-dot ${currentSlide === index ? 'active' : ''} ${isAnimating ? 'animating' : ''}`}
                onClick={() => !isAnimating && setCurrentSlide(index)}
              />
            ))}
          </Box>
        )}

        {/* Slide Counter */}
        {totalSlides > 1 && (
          <Typography className="slide-counter">
            {currentSlide + 1} / {totalSlides}
          </Typography>
        )}
      </Box>

      {/* Total Movies Counter */}
      <Box className="total-movies">
        <Typography variant="body2" className="total-text">
          Discover {movies.length} Movies • Updated Daily
        </Typography>
      </Box>
    </Box>
  );
};

export default MoviesHome;