"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Card,
  CardContent,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Divider,
  Grid,
} from "@mui/material";
import {
  ArrowBack,
  LocationOn,
  ScreenShare,
  ConfirmationNumber,
  Movie,
  Schedule,
} from "@mui/icons-material";
import { useAppDispatch } from "@/hooks/hookes";
import { setShow, clearBooking, setSessionId } from "@/store/bookingSlice";
import SeatSelectionDialog from "@/components/SeatSelectionDialog";
import { getShowById, confirmBooking, getMovieById } from "@/app/api/seatbooking.endpoint";
import { Show, ConfirmBookingRequest } from "@/types/booking";

export default function SeatBookingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const movieId = params.movieId as string;
  const theaterId = params.theaterId as string;
  const showTime = searchParams.get("showTime");

  const [show, setShowData] = useState<Show | null>(null);
  const [movie, setMovie] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchShowData();

    // Clear booking state when component unmounts
    return () => {
      dispatch(clearBooking());
    };
  }, [dispatch, theaterId]);

  const fetchShowData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch show data
      const showResponse = await getShowById(theaterId);
      const showData = showResponse.data;

      // Fetch movie data
      const movieResponse = await getMovieById(showData.movieId);
      const movieData = movieResponse.data;

      setShowData(showData);
      setMovie(movieData);

      // Generate session ID
      const newSessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      dispatch(setSessionId(newSessionId));

      // Initialize booking state
      dispatch(
        setShow({
          showId: showData._id,
          price: showData.price,
          sessionId: newSessionId,
          theaterName: showData.theaterId.theatername,
          movieName: movieData.moviename || movieData.title,
          showTime: showTime || showData.showTime[0],
          date: showData.date,
        })
      );
    } catch (err: any) {
      console.error("Error fetching show data:", err);
      setError(err.message || "Failed to load show details");
    } finally {
      setLoading(false);
    }
  };

  const handleSeatsConfirmed = async (selectedSeats: string[]) => {
    if (!show) return;

    setBookingLoading(true);
    try {
      const sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      const confirmPayload: ConfirmBookingRequest = {
        showId: show._id,
        seats: selectedSeats,
        totalAmount: selectedSeats.length * show.price,
        sessionId: sessionId,
      };

      const response = await confirmBooking(confirmPayload);

      if (response.success) {
        // Redirect to payment page with booking details
        router.push(
          `/payment?bookingId=${response.data._id}&seats=${selectedSeats.join(
            ","
          )}&total=${selectedSeats.length * show.price}`
        );
      } else {
        setError(response.message || "Failed to confirm booking");
      }
    } catch (err: any) {
      console.error("Error confirming booking:", err);
      setError(err.message || "Failed to confirm booking");
    } finally {
      setBookingLoading(false);
      setDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#1f2937",
        }}
      >
        <Box textAlign="center">
          <CircularProgress
            sx={{
              color: "#3b82f6",
              width: "60px !important",
              height: "60px !important",
              mb: 2,
            }}
          />
          <Typography variant="h6" color="white">
            Loading show details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error || !show || !movie) {
    return (
      <Box sx={{ backgroundColor: "#1f2937", minHeight: "100vh", p: 3 }}>
        <Container maxWidth="lg">
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
            action={
              <Button color="inherit" size="small" onClick={() => router.back()}>
                GO BACK
              </Button>
            }
          >
            {error || "Show not found"}
          </Alert>
        </Container>
      </Box>
    );
  }

  const availableSeats = show.totalSeats - show.bookedSeats.length;
  const isFewSeatsLeft = availableSeats > 0 && availableSeats <= 10;

  return (
    <Box sx={{ backgroundColor: "#1f2937", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Card
          sx={{
            mb: 4,
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            backgroundImage: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Button
              startIcon={<ArrowBack />}
              onClick={() => router.back()}
              sx={{ color: "white", mb: 3 }}
            >
              Back to Theaters
            </Button>

            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Typography variant="h3" fontWeight="bold" color="white" gutterBottom>
                  {movie.moviename || movie.title}
                </Typography>
                <Typography variant="h5" color="#3b82f6" gutterBottom>
                  {show.theaterId.theatername}
                </Typography>

                <Box display="flex" gap={3} flexWrap="wrap" alignItems="center" sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <LocationOn sx={{ color: "#94a3b8" }} />
                    <Typography variant="body1" color="#94a3b8">
                      {show.theaterId.district || show.theaterId.location}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <ScreenShare sx={{ color: "#94a3b8" }} />
                    <Typography variant="body1" color="#94a3b8">
                      {show.room.name} • Screen {show.screenNumber}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" gap={1}>
                    <ConfirmationNumber sx={{ color: "#94a3b8" }} />
                    <Typography
                      variant="body1"
                      color={isFewSeatsLeft ? "#f59e0b" : "#94a3b8"}
                      fontWeight={isFewSeatsLeft ? "bold" : "normal"}
                    >
                      {availableSeats} seats available
                      {isFewSeatsLeft && " - Hurry!"}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} md={4} sx={{ textAlign: { md: "right" } }}>
                <Chip
                  label={`₹${show.price}`}
                  color="primary"
                  sx={{
                    fontSize: "1.5rem",
                    height: "auto",
                    py: 1,
                    px: 2,
                    backgroundColor: "#3b82f6",
                    color: "white",
                  }}
                />
                <Typography variant="body2" color="#94a3b8" sx={{ mt: 1 }}>
                  per seat
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Show Details */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" color="white" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Movie />
                  Show Information
                </Typography>

                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                      <Typography variant="h6" color="#3b82f6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Schedule />
                        Show Times
                      </Typography>
                      <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 1 }}>
                        {show.showTime.map((time, index) => (
                          <Chip
                            key={index}
                            label={time}
                            variant={showTime === time ? "filled" : "outlined"}
                            color={showTime === time ? "primary" : "default"}
                            sx={{
                              color: showTime === time ? "white" : "#3b82f6",
                              borderColor: "#3b82f6",
                              fontWeight: "bold",
                            }}
                          />
                        ))}
                      </Box>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Paper sx={{ p: 2, backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                      <Typography variant="h6" color="#3b82f6" gutterBottom>
                        Theater Layout
                      </Typography>
                      <Typography variant="body1" color="white">
                        {show.room.rows} rows × {show.room.columns} columns
                      </Typography>
                      <Typography variant="body2" color="#94a3b8">
                        Total capacity: {show.totalSeats} seats
                      </Typography>
                      <Typography variant="body2" color="#94a3b8">
                        Booked: {show.bookedSeats.length} seats
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Additional Show Info */}
                <Paper sx={{ p: 2, mt: 2, backgroundColor: "rgba(255, 255, 255, 0.02)" }}>
                  <Typography variant="h6" color="#3b82f6" gutterBottom>
                    Additional Information
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    • Please arrive at least 15 minutes before the show
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    • Seats are automatically released after 5 minutes if not confirmed
                  </Typography>
                  <Typography variant="body2" color="#94a3b8">
                    • Food and beverages available at the theater
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                position: "sticky",
                top: 24,
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" color="white" gutterBottom textAlign="center">
                  Ready to Book?
                </Typography>

                <Divider sx={{ borderColor: "#374151", my: 2 }} />

                <Box display="flex" flexDirection="column" gap={2}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={() => setDialogOpen(true)}
                    disabled={availableSeats === 0 || bookingLoading}
                    sx={{
                      py: 2,
                      backgroundColor: "#3b82f6",
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#2563eb",
                        transform: "translateY(-2px)",
                      },
                      "&:disabled": {
                        backgroundColor: "#374151",
                        transform: "none",
                      },
                      transition: "all 0.2s ease-in-out",
                    }}
                  >
                    {bookingLoading ? (
                      <CircularProgress size={24} sx={{ color: "white" }} />
                    ) : availableSeats === 0 ? (
                      "Show Sold Out"
                    ) : (
                      "Select Seats"
                    )}
                  </Button>

                  {isFewSeatsLeft && (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight="bold">
                        Only {availableSeats} seats left!
                      </Typography>
                    </Alert>
                  )}

                  <Typography variant="body2" color="#94a3b8" textAlign="center">
                    Click to select your preferred seats and proceed to payment
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Seat Selection Dialog */}
        <SeatSelectionDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSeatsConfirmed={handleSeatsConfirmed}
          show={show}
        />
      </Container>
    </Box>
  );
}