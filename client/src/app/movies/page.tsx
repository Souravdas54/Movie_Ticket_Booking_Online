"use client";
import React, { useState } from "react";
import { Box, Card, CardMedia, CardContent, Typography, Button, Rating, Chip, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useRouter } from "next/navigation";
import { Movie } from "@/types/movie";

interface MoviesHomeProps {
  movies: Movie[];
}

export default function MoviesHome({ movies }: MoviesHomeProps) {
  const router = useRouter();

  const itemsPerSlide = 5; // always 5 movies per slide
  const slides: Movie[][] = [];
  for (let i = 0; i < movies.length; i += itemsPerSlide) {
    slides.push(movies.slice(i, i + itemsPerSlide));
  }

  const [current, setCurrent] = useState(0);

  const goPrev = () => setCurrent((c) => Math.max(0, c - 1));
  const goNext = () => setCurrent((c) => Math.min(slides.length - 1, c + 1));

  // Format votes number with commas
  const formatVotes = (votes: number) => {
    return votes.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Get first genre from array
  const getFirstGenre = (genres: string[]) => {
    return genres.length > 0 ? genres[0] : "Movie";
  };

  return (
    <Box sx={{ width: "100%", p: 2, overflow: "hidden" }}>

      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "900", textTransform: "uppercase" }}>
          RECOMMENDED MOVIES
        </Typography>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={goPrev}
            disabled={current === 0}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              "&:hover": { bgcolor: "#1565c0" },
              "&:disabled": { bgcolor: "#bdbdbd", color: "#757575" }
            }}
          >
            <ArrowBackIosNewIcon />
          </IconButton>

          <IconButton
            onClick={goNext}
            disabled={current === slides.length - 1}
            sx={{
              bgcolor: "#1976d2",
              color: "white",
              "&:hover": { bgcolor: "#1565c0" },
              "&:disabled": { bgcolor: "#bdbdbd", color: "#757575" }
            }}
          >
            <ArrowForwardIosIcon />
          </IconButton>
        </Box>
      </Box>

      {/* SLIDER */}
      <Box
        sx={{
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            width: `${slides.length * 100}%`,
            transition: "transform 0.6s ease-in-out",
            transform: `translateX(-${current * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((group: Movie[], i: number) => (
            <Box
              key={i}
              sx={{
                width: `${100 / slides.length}%`,
                display: "flex",
                justifyContent: "space-between",
                px: 1,
                gap: 2,
              }}
            >
              {group.map((m: Movie) => (
                <Box
                  key={m._id}
                  sx={{
                    flex: "1 1 0",
                    minWidth: 0,
                    cursor: "pointer",
                  }}
                  onClick={() => router.push(`/movie/${m._id}`)}
                >
                  <Card
                    sx={{
                      height: "100%",
                      borderRadius: 3,
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                      transition: "all 0.3s ease",
                      "&:hover": { 
                        transform: "translateY(-8px)", 
                        boxShadow: "0 12px 28px rgba(0,0,0,0.2)" 
                      },
                    }}
                  >
                    <CardMedia
                      component="img"
                      image={m.poster}
                      alt={m.moviename}
                      sx={{ 
                        height: { xs: 300, sm: 320, md: 340, lg: 360, xl: 380 },
                        objectFit: "cover" 
                      }}
                    />

                    <CardContent sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: "700",
                          textAlign: "center",
                          minHeight: "3em",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" }
                        }}
                      >
                        {m.moviename}
                      </Typography>

                      {/* Rating and Votes */}
                      <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        gap: 0.5,
                        mb: 1
                      }}>
                        <Rating
                          value={5} // Always show 5 stars as in the image
                          readOnly
                          max={5}
                          sx={{
                            "& .MuiRating-icon": {
                              color: "#ffc107"
                            }
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: "600", 
                            color: "#666",
                            fontSize: { xs: "0.8rem", sm: "0.9rem" }
                          }}
                        >
                          {formatVotes(m.votes)}
                        </Typography>
                      </Box>

                      {/* Price and Genre */}
                      {/* <Box sx={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        gap: 1,
                        mt: "auto"
                      }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: "800", 
                            color: "#d32f2f",
                            fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" }
                          }}
                        >
                          {m.price || "2.00 €"}
                        </Typography>
                        <Chip
                          label={getFirstGenre(m.genre)}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            bgcolor: "#f5f5f5",
                            color: "#555",
                            border: "1px solid #ddd",
                            fontSize: { xs: "0.7rem", sm: "0.75rem" }
                          }}
                        />
                      </Box> */}
                    </CardContent>
                  </Card>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* INDICATORS */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 1 }}>
        {slides.map((_, i: number) => (
          <Box
            key={i}
            onClick={() => setCurrent(i)}
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              cursor: "pointer",
              background: i === current ? "#1976d2" : "#ddd",
              transform: i === current ? "scale(1.2)" : "scale(1)",
              transition: "all 0.3s ease",
              "&:hover": {
                background: i === current ? "#1976d2" : "#bbb",
              }
            }}
          />
        ))}
      </Box>
    </Box>
  );
}