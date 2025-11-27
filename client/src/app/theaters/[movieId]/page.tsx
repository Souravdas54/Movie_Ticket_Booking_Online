"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Box, Container, Card, CardContent, Button, CircularProgress, Alert, 
  Typography, IconButton, Paper, Divider, Chip, useTheme, useMediaQuery 
} from "@mui/material";
import { ArrowBack, ConfirmationNumber, LocationOn, Phone, ScreenShare } from "@mui/icons-material";
import { getTheatersByMovie } from "@/app/api/theather.endpoint";
import { getMovieById } from "@/app/api/endpoint";
import { Theater } from "@/types/theater";
import { Movie } from "@/types/movie";

export default function MovieTheatersPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = params?.movieId as string;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [filteredTheaters, setFilteredTheaters] = useState<Theater[]>([]);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("");

  const fetchTheatersByMovie = useCallback(async () => {
    if (!movieId) return;
    try {
      setLoading(true);
      setError("");

      // Load movie info
      const movieRes = await getMovieById(movieId);
      setMovie(movieRes.data);

      // Get theaters for this movie
      const resp = await getTheatersByMovie(movieId);
      const theatersList: Theater[] = resp.data || [];
      
      setTheaters(theatersList);
      setFilteredTheaters(theatersList); // Initially show all theaters

      console.log('Initial theaters loaded:', theatersList.length);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load theaters");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  // Listen for district changes from AppBar
  useEffect(() => {
    const handleDistrictChange = (event: CustomEvent) => {
      const district = event.detail;
      console.log('District change received:', district);
      setSelectedDistrict(district);
      
      if (district && district !== "") {
        // Filter theaters by district
        const filtered = theaters.filter(theater => 
          theater.district?.toLowerCase().includes(district.toLowerCase())
        );
        setFilteredTheaters(filtered);
        console.log('Filtered theaters:', filtered.length);
      } else {
        // Show all theaters if no district selected
        setFilteredTheaters(theaters);
        console.log('Showing all theaters:', theaters.length);
      }
    };

    // Add event listener for district changes
    window.addEventListener('districtChanged', handleDistrictChange as EventListener);
    
    // Cleanup
    return () => {
      window.removeEventListener('districtChanged', handleDistrictChange as EventListener);
    };
  }, [theaters]);

  // Also check URL parameters on initial load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const districtFromUrl = urlParams.get('district');
    if (districtFromUrl) {
      console.log('District from URL:', districtFromUrl);
      setSelectedDistrict(districtFromUrl);
      // Filter theaters based on URL district
      const filtered = theaters.filter(theater => 
        theater.district?.toLowerCase().includes(districtFromUrl.toLowerCase())
      );
      setFilteredTheaters(filtered);
    }
  }, [theaters]);

  useEffect(() => {
    if (!movieId) {
      setError("Movie ID not found");
      setLoading(false);
      return;
    }
    fetchTheatersByMovie();
  }, [movieId, fetchTheatersByMovie]);

  const handleTimeSelect = (theaterId: string, time: string) => {
    router.push(`/booking/${movieId}/${theaterId}?showTime=${encodeURIComponent(time)}`);
  };

  const formatTime = (time: string): string => {
    return time;
  };

  if (loading) {
    return (
      <Box sx={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5"
      }}>
        <CircularProgress 
          sx={{ 
            color: "#ff3f6c",
            width: "60px !important",
            height: "60px !important"
          }} 
        />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: "#f5f5f5", 
      minHeight: "100vh",
      paddingBottom: "32px"
    }}>
      {/* Header Section */}
      <Box sx={{ 
        backgroundColor: "#333545",
        color: "white",
        padding: { xs: "16px 0", sm: "20px 0", md: "24px 0" },
        marginBottom: "24px"
      }}>
        <Container maxWidth="xl">
          <Box sx={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "16px", 
            marginBottom: "16px" 
          }}>
            <IconButton 
              onClick={() => router.push("/")}
              sx={{ 
                color: "white",
                padding: { xs: "4px", sm: "8px" }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography 
                sx={{ 
                  fontWeight: "bold",
                  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "2rem", lg: "2.125rem" },
                  lineHeight: 1.2
                }}
              >
                {movie?.moviename}
              </Typography>
              <Typography 
                sx={{ 
                  opacity: 0.8,
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                  marginTop: "4px"
                }}
              >
                {selectedDistrict 
                  ? `Theaters in ${selectedDistrict} (${filteredTheaters.length} found)`
                  : `All Theaters (${filteredTheaters.length} found)`
                }
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              marginBottom: "24px",
              borderRadius: "8px",
              fontSize: { xs: "0.875rem", sm: "1rem" }
            }}
          >
            {error}
          </Alert>
        )}

        {filteredTheaters.length === 0 ? (
          <Box sx={{ 
            textAlign: "center", 
            padding: { xs: "48px 24px", sm: "64px 32px", md: "80px 40px" },
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.12)"
          }}>
            <ConfirmationNumber sx={{ 
              fontSize: { xs: "48px", sm: "60px", md: "72px" }, 
              color: "text.secondary", 
              marginBottom: "16px" 
            }} />
            <Typography 
              sx={{ 
                fontSize: { xs: "1rem", sm: "1.25rem", md: "1.5rem" },
                color: "text.secondary", 
                marginBottom: "8px",
                fontWeight: 500
              }}
            >
              No theaters found
            </Typography>
            <Typography 
              sx={{ 
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                color: "text.secondary"
              }}
            >
              {selectedDistrict 
                ? `No theaters found in ${selectedDistrict}. Try selecting a different district from the navigation bar.`
                : "No theaters found showing this movie. Please check back later."
              }
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: "flex", 
            flexDirection: "column", 
            gap: { xs: "12px", sm: "16px", md: "20px" } 
          }}>
            {filteredTheaters.map((theater) => (
              <Card 
                key={theater._id}
                sx={{
                  borderRadius: "8px",
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
                  '&:hover': {
                    boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                    transform: "translateY(-2px)"
                  }
                }}
              >
                <CardContent sx={{ padding: "0 !important" }}>
                  {/* Theater Header */}
                  <Box sx={{ 
                    padding: { xs: "12px", sm: "16px", md: "20px" },
                    borderBottom: "1px solid",
                    borderColor: "divider"
                  }}>
                    <Box sx={{ 
                      display: "flex", 
                      flexDirection: { xs: "column", sm: "row" },
                      alignItems: { xs: "flex-start", sm: "center" },
                      gap: { xs: "8px", sm: "12px" }
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          sx={{ 
                            fontWeight: "bold",
                            color: "#333545",
                            fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem", lg: "1.75rem" },
                            lineHeight: 1.2,
                            marginBottom: "4px"
                          }}
                        >
                          {theater.theatername}
                        </Typography>
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: { xs: "8px", sm: "12px" }, 
                          marginTop: "4px", 
                          flexWrap: 'wrap' 
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
                            <LocationOn sx={{ 
                              fontSize: { xs: "14px", sm: "16px" }, 
                              color: 'text.secondary' 
                            }} />
                            <Typography 
                              sx={{ 
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                color: "text.secondary"
                              }}
                            >
                              {theater.district}, {theater.state}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
                            <ScreenShare sx={{ 
                              fontSize: { xs: "14px", sm: "16px" }, 
                              color: 'text.secondary' 
                            }} />
                            <Typography 
                              sx={{ 
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                color: "text.secondary"
                              }}
                            >
                              {theater.screens} screens
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: "4px" }}>
                            <Phone sx={{ 
                              fontSize: { xs: "14px", sm: "16px" }, 
                              color: 'text.secondary' 
                            }} />
                            <Typography 
                              sx={{ 
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                                color: "text.secondary"
                              }}
                            >
                              {theater.contact}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Chip 
                        label="Available" 
                        color="success" 
                        variant="outlined"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: "0.7rem", sm: "0.8rem", md: "0.9rem" },
                          alignSelf: { xs: "flex-start", sm: "center" }
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Show Times */}
                  <Box sx={{ 
                    padding: { xs: "12px", sm: "16px", md: "20px" } 
                  }}>
                    <Typography 
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: "1rem", sm: "1.1rem", md: "1.25rem" },
                        marginBottom: "8px"
                      }}
                    >
                      Available Shows
                    </Typography>
                    <Divider sx={{ marginBottom: "16px" }} />
                    <Box sx={{ 
                      display: 'flex', 
                      gap: { xs: "6px", sm: "8px", md: "12px" }, 
                      flexWrap: 'wrap',
                      justifyContent: {
                        xs: 'center',
                        sm: 'flex-start'
                      }
                    }}>
                      {theater.showTimes && theater.showTimes.length > 0 ? (
                        theater.showTimes.map((time, index) => (
                          <Button
                            key={index}
                            variant="outlined"
                            onClick={() => handleTimeSelect(theater._id, time)}
                            sx={{
                              minWidth: { xs: "70px", sm: "80px", md: "90px", lg: "100px" },
                              height: { xs: "36px", sm: "40px", md: "45px", lg: "48px" },
                              borderColor: "#ff3f6c",
                              color: "#ff3f6c",
                              fontWeight: 'bold',
                              fontSize: { xs: "0.7rem", sm: "0.75rem", md: "0.875rem" },
                              '&:hover': {
                                backgroundColor: "#ff3f6c",
                                color: "white",
                                borderColor: "#ff3f6c"
                              }
                            }}
                          >
                            {formatTime(time)}
                          </Button>
                        ))
                      ) : (
                        <Typography 
                          sx={{ 
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            color: "text.secondary"
                          }}
                        >
                          No show times available
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}