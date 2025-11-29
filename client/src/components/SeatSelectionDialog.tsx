"use client";
import React, { useState, useEffect } from "react";
import { Button, Box, Typography, IconButton, Chip, Divider, Alert, CircularProgress, Paper, Container } from "@mui/material";
import { Close, Chair, ConfirmationNumber, EventSeat, LocalMovies } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/hooks/hookes";
import { toggleSeat, setLockedSeats, clearSeats } from "@/store/bookingSlice";
import { lockSeats, releaseSeats } from "@/app/api/seatbooking.endpoint";
import { Show } from "@/types/booking";

interface SeatSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSeatsConfirmed: (seats: string[]) => void;
  show: Show;
  selectedTime: string;
}

const SeatSelectionDialog: React.FC<SeatSelectionDialogProps> = ({
  open,
  onClose,
  onSeatsConfirmed,
  show,
}) => {
  const dispatch = useAppDispatch();
  const { selectedSeats, lockedSeats, sessionId } = useAppSelector(
    (state) => state.booking
  );

  const [numSeats, setNumSeats] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = ["Select Seats", "Confirm Selection"];

  // Seat categories with prices and row assignments
  const seatCategories = [
    { type: "Golden", price: 200, color: "#FFD700", rows: ["A", "B", "C"] },
    { type: "Platinum", price: 180, color: "#E5E4E2", rows: ["D", "E", "F"] },
    { type: "Diamond", price: 220, color: "#B9F2FF", rows: ["G", "H"] },
    { type: "Royal", price: 250, color: "#FF6B6B", rows: ["I", "J"] },
  ];

  // Generate seats based on theater layout: 10 rows × 12 columns
  const generateSeats = () => {
    const seats = [];
    const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
    const columns = 12;

    for (const row of rows) {
      const category = seatCategories.find(cat => cat.rows.includes(row));
      
      for (let seatNum = 1; seatNum <= columns; seatNum++) {
        seats.push({
          id: `${row}${seatNum}`,
          row,
          number: seatNum,
          category: category?.type || "Golden",
          price: category?.price || 200,
          color: category?.color || "#FFD700"
        });
      }
    }
    return seats;
  };

  const allSeats = generateSeats();
  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

  useEffect(() => {
    if (open) {
      dispatch(clearSeats());
      setNumSeats(1);
      setError("");
      setActiveStep(0);
      setLoading(false);
    }
  }, [open, dispatch]);

  const handleSeatSelect = (seatId: string) => {
    if (selectedSeats.includes(seatId)) {
      dispatch(toggleSeat(seatId));
    } else if (selectedSeats.length < numSeats) {
      dispatch(toggleSeat(seatId));
    } else {
      setError(`You can only select ${numSeats} seat${numSeats !== 1 ? "s" : ""}`);
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleNext = async () => {
    if (selectedSeats.length !== numSeats) {
      setError(`Please select exactly ${numSeats} seat${numSeats !== 1 ? "s" : ""}`);
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (!sessionId) {
        throw new Error("Session not initialized");
      }

      const lockResponse = await lockSeats({
        showId: show._id,
        seats: selectedSeats,
        sessionId: sessionId,
        ttlSeconds: 300,
      });

      if (lockResponse.success) {
        dispatch(setLockedSeats(lockResponse.data?.lockedSeats || []));
        setActiveStep(1);
        setError("");
      } else {
        if (lockResponse.alreadyBooked && lockResponse.alreadyBooked.length > 0) {
          setError(
            `Seats ${lockResponse.alreadyBooked.join(
              ", "
            )} are already booked. Please select different seats.`
          );
        } else if (lockResponse.alreadyLocked && lockResponse.alreadyLocked.length > 0) {
          setError(
            `Seats ${lockResponse.alreadyLocked.join(
              ", "
            )} are currently locked by another user. Please select different seats.`
          );
        } else {
          setError(lockResponse.message || "Failed to lock seats. Please try again.");
        }
        dispatch(clearSeats());
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Error locking seats:", msg);
      setError(msg || "Failed to lock seats. Please try again.");
      dispatch(clearSeats());
    } finally {
      setLoading(false);
    }
  };

  const handleBack = async () => {
    if (sessionId && selectedSeats.length > 0) {
      try {
        await releaseSeats({
          showId: show._id,
          seats: selectedSeats,
          sessionId: sessionId,
        });
      } catch (err) {
        console.error("Error releasing seats:", err);
      }
    }
    dispatch(clearSeats());
    dispatch(setLockedSeats([]));
    setActiveStep(0);
    setError("");
  };

  const handleConfirm = () => {
    onSeatsConfirmed(selectedSeats);
  };

  const handleClose = async () => {
    if (sessionId && selectedSeats.length > 0) {
      try {
        await releaseSeats({
          showId: show._id,
          seats: selectedSeats,
          sessionId: sessionId,
        });
      } catch (err) {
        console.error("Error releasing seats:", err);
      }
    }

    dispatch(clearSeats());
    dispatch(setLockedSeats([]));
    setNumSeats(1);
    setError("");
    setLoading(false);
    setActiveStep(0);
    onClose();
  };

  const totalPrice = selectedSeats.reduce((total, seatId) => {
    const seat = allSeats.find(s => s.id === seatId);
    return total + (seat?.price || 0);
  }, 0);

  // Responsive seat size calculation
  const getSeatSize = () => {
    return {
      xs: 20,
      sm: 24,
      md: 28,
      lg: 32,
      xl: 36
    };
  };

  const getSeatFontSize = () => {
    return {
      xs: "0.5rem",
      sm: "0.6rem",
      md: "0.7rem",
      lg: "0.75rem",
      xl: "0.8rem"
    };
  };

  const getSeatGap = () => {
    return {
      xs: 0.25,
      sm: 0.5,
      md: 0.75,
      lg: 1,
      xl: 1
    };
  };

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 } }}>
            {/* Seat Quantity Selection */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 3, sm: 4 }, 
              backgroundColor: "white", 
              borderRadius: 3, 
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0"
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                display: "flex", 
                alignItems: "center", 
                gap: 2, 
                color: "#1f2937", 
                fontWeight: "bold",
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }
              }}>
                <ConfirmationNumber sx={{ color: "#22c55e", fontSize: { xs: 24, sm: 28, md: 32 } }} />
                How many seats would you like?
              </Typography>
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: { xs: 1, sm: 1.5, md: 2 },
                mt: 3,
                maxWidth: 500,
                margin: "0 auto"
              }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <Button
                    key={num}
                    variant={numSeats === num ? "contained" : "outlined"}
                    onClick={() => {
                      setNumSeats(num);
                      dispatch(clearSeats());
                    }}
                    sx={{
                      minWidth: { xs: 40, sm: 45, md: 50, lg: 55 },
                      height: { xs: 40, sm: 45, md: 50, lg: 55 },
                      borderRadius: 2,
                      border: `2px solid ${numSeats === num ? "#22c55e" : "#22c55e"}`,
                      color: numSeats === num ? "white" : "#22c55e",
                      backgroundColor: numSeats === num ? "#22c55e" : "transparent",
                      fontWeight: "bold",
                      fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
                      "&:hover": {
                        backgroundColor: numSeats === num ? "#16a34a" : "rgba(34, 197, 94, 0.1)",
                        borderColor: "#16a34a",
                        transform: "translateY(-2px)",
                        boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    {num}
                  </Button>
                ))}
              </Box>
            </Paper>

            {/* Seat Layout */}
            <Paper sx={{ 
              p: { xs: 2, sm: 3, md: 4 }, 
              mb: { xs: 3, sm: 4 }, 
              backgroundColor: "white", 
              borderRadius: 3, 
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0",
              overflow: "hidden"
            }}>
              <Typography variant="h5" gutterBottom sx={{ 
                color: "#1f2937", 
                fontWeight: "bold", 
                mb: 3, 
                textAlign: "center",
                fontSize: { xs: "1.1rem", sm: "1.25rem", md: "1.5rem" }
              }}>
                🎬 Select Your Seats - All Seats Available
              </Typography>

              {/* Screen */}
              <Box sx={{ 
                textAlign: "center", 
                mb: { xs: 3, sm: 4, md: 6 }, 
                p: { xs: 1.5, sm: 2, md: 3 },
                backgroundColor: "#1a1a1a",
                borderRadius: 2,
                border: "2px solid #333",
                mx: 'auto',
                maxWidth: { xs: 280, sm: 350, md: 450, lg: 500 },
                background: "linear-gradient(180deg, #333 0%, #1a1a1a 100%)"
              }}>
                <Typography variant="h6" color="white" fontWeight="bold" sx={{ 
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem", lg: "1.125rem" } 
                }}>
                  🎭 SCREEN THIS WAY 🎭
                </Typography>
              </Box>

              {/* Seat Layout Container */}
              <Box sx={{ 
                display: "flex", 
                justifyContent: "center",
                overflow: "auto",
                maxWidth: "100%",
                px: { xs: 0.5, sm: 1, md: 2 }
              }}>
                <Box sx={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: { xs: 0.5, sm: 0.75, md: 1 },
                  minWidth: "min-content"
                }}>
                  {/* Column Headers */}
                  <Box sx={{ 
                    display: "flex", 
                    gap: { xs: 0.25, sm: 0.5, md: 0.75, lg: 1 }, 
                    mb: { xs: 1, sm: 1.5, md: 2 }, 
                    ml: { xs: 4, sm: 5, md: 6, lg: 7 },
                    justifyContent: "center"
                  }}>
                    {Array.from({ length: 12 }, (_, index) => (
                      <Box key={index} sx={{ 
                        width: getSeatSize(),
                        textAlign: "center" 
                      }}>
                        <Typography variant="body2" fontWeight="bold" color="#64748b" sx={{ 
                          fontSize: getSeatFontSize()
                        }}>
                          {index + 1}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  {/* Rows and Seats - Show ALL seats */}
                  {rows.map((row) => {
                    const category = seatCategories.find(cat => cat.rows.includes(row));
                    
                    return (
                      <Box key={row} sx={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: { xs: 0.75, sm: 1, md: 1.5, lg: 2 }, 
                        mb: { xs: 0.5, sm: 0.75, md: 1 }
                      }}>
                        {/* Row Label */}
                        <Typography variant="h6" fontWeight="bold" color="#374151" sx={{ 
                          minWidth: { xs: 20, sm: 24, md: 28, lg: 32, xl: 36 }, 
                          textAlign: "center",
                          fontSize: getSeatFontSize()
                        }}>
                          {row}
                        </Typography>
                        
                        {/* Seats - Show ALL 12 seats */}
                        <Box sx={{ 
                          display: "flex", 
                          gap: getSeatGap()
                        }}>
                          {Array.from({ length: 12 }, (_, index) => {
                            const seatNumber = index + 1;
                            const seatId = `${row}${seatNumber}`;
                            const isSelected = selectedSeats.includes(seatId);
                            const isBooked = show.bookedSeats.includes(seatId);
                            const isLocked = lockedSeats.includes(seatId);

                            return (
                              <Button
                                key={seatId}
                                variant={isSelected ? "contained" : "outlined"}
                                disabled={isBooked || isLocked}
                                onClick={() => handleSeatSelect(seatId)}
                                sx={{
                                  minWidth: getSeatSize(),
                                  width: getSeatSize(),
                                  height: getSeatSize(),
                                  borderRadius: 1,
                                  border: `2px solid ${isBooked ? "#dc2626" : isLocked ? "#f59e0b" : "#22c55e"}`,
                                  color: isSelected ? "white" : 
                                        isBooked ? "#dc2626" : 
                                        isLocked ? "#f59e0b" : "#22c55e",
                                  backgroundColor: isSelected ? "#22c55e" : 
                                                isBooked ? "#fecaca" : 
                                                isLocked ? "#fef3c7" : "transparent",
                                  fontWeight: "bold",
                                  fontSize: getSeatFontSize(),
                                  position: "relative",
                                  p: 0,
                                  // minWidth: "auto",
                                  "&:hover": !isBooked && !isLocked ? {
                                    backgroundColor: isSelected ? "#16a34a" : "rgba(34, 197, 94, 0.1)",
                                    transform: "translateY(-2px)",
                                    boxShadow: "0 4px 12px rgba(34, 197, 94, 0.3)",
                                  } : {},
                                  "&:disabled": {
                                    backgroundColor: isBooked ? "#fecaca" : "#f3f4f6",
                                    color: isBooked ? "#dc2626" : "#9ca3af",
                                    borderColor: isBooked ? "#dc2626" : "#d1d5db",
                                    transform: "none",
                                    boxShadow: "none",
                                  },
                                  transition: "all 0.3s ease",
                                }}
                              >
                                {seatNumber}
                                {isBooked && (
                                  <Box
                                    sx={{
                                      position: "absolute",
                                      top: -2,
                                      right: -2,
                                      width: 6,
                                      height: 6,
                                      backgroundColor: "#dc2626",
                                      borderRadius: "50%",
                                    }}
                                  />
                                )}
                              </Button>
                            );
                          })}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

              {/* Categories and Legend */}
              <Box sx={{ 
                display: "grid", 
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, 
                gap: { xs: 3, md: 4 },
                mt: 4 
              }}>
                {/* Categories */}
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  backgroundColor: "#f8fafc", 
                  borderRadius: 2,
                  border: "1px solid #e2e8f0"
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: "#1f2937", 
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", sm: "1rem" }
                  }}>
                    Seat Categories
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {seatCategories.map((category) => (
                      <Box key={category.type} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ 
                          width: { xs: 16, sm: 20 }, 
                          height: { xs: 16, sm: 20 }, 
                          borderRadius: 1, 
                          backgroundColor: category.color,
                          border: `2px solid ${category.color}`
                        }} />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight="600" color="#374151" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                            {category.type}
                          </Typography>
                          <Typography variant="body2" color="#64748b" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>
                            Rows: {category.rows.join(", ")} • ₹{category.price}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Paper>

                {/* Legend */}
                <Paper sx={{ 
                  p: { xs: 2, sm: 3 }, 
                  backgroundColor: "#f8fafc", 
                  borderRadius: 2,
                  border: "1px solid #e2e8f0"
                }}>
                  <Typography variant="h6" gutterBottom sx={{ 
                    color: "#1f2937", 
                    fontWeight: "bold",
                    fontSize: { xs: "0.875rem", sm: "1rem" }
                  }}>
                    Seat Status
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ 
                        width: { xs: 16, sm: 20 }, 
                        height: { xs: 16, sm: 20 }, 
                        borderRadius: 1, 
                        border: "2px solid #22c55e",
                        backgroundColor: "transparent"
                      }} />
                      <Typography variant="body2" color="#374151" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        Available
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ 
                        width: { xs: 16, sm: 20 }, 
                        height: { xs: 16, sm: 20 }, 
                        borderRadius: 1, 
                        backgroundColor: "#22c55e", 
                        border: "2px solid #16a34a" 
                      }} />
                      <Typography variant="body2" color="#374151" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        Selected
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ 
                        width: { xs: 16, sm: 20 }, 
                        height: { xs: 16, sm: 20 }, 
                        borderRadius: 1, 
                        backgroundColor: "#fecaca", 
                        border: "2px solid #dc2626" 
                      }} />
                      <Typography variant="body2" color="#374151" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        Booked
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Box sx={{ 
                        width: { xs: 16, sm: 20 }, 
                        height: { xs: 16, sm: 20 }, 
                        borderRadius: 1, 
                        backgroundColor: "#fef3c7", 
                        border: "2px solid #f59e0b" 
                      }} />
                      <Typography variant="body2" color="#374151" sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                        Locked
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Paper>

            {/* Selected Seats Summary */}
            {selectedSeats.length > 0 && (
              <Paper sx={{ 
                p: 3, 
                backgroundColor: "#22c55e", 
                color: "white", 
                borderRadius: 3,
                boxShadow: "0 8px 32px rgba(34, 197, 94, 0.3)",
                border: "1px solid #16a34a"
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  🎟️ Selected Seats ({selectedSeats.length}/{numSeats})
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                  <Typography variant="body1" sx={{ fontWeight: "600" }}>
                    {selectedSeats.join(", ")}
                  </Typography>
                  <Chip 
                    label={`Total: ₹${totalPrice}`} 
                    sx={{ 
                      backgroundColor: "white", 
                      color: "#22c55e", 
                      fontWeight: "bold",
                      fontSize: "0.875rem"
                    }} 
                  />
                </Box>
                {selectedSeats.length < numSeats && (
                  <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>
                    Select {numSeats - selectedSeats.length} more seat{numSeats - selectedSeats.length !== 1 ? 's' : ''}
                  </Typography>
                )}
              </Paper>
            )}
          </Container>
        );
      case 1:
        return (
          <Container maxWidth="sm" sx={{ px: { xs: 2, sm: 3 } }}>
            <Paper sx={{ 
              p: { xs: 3, sm: 4, md: 5 }, 
              backgroundColor: "white", 
              borderRadius: 3, 
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
              border: "1px solid #e0e0e0"
            }}>
              <Typography variant="h4" color="#1f2937" gutterBottom sx={{ 
                textAlign: "center", 
                fontWeight: "bold", 
                mb: 4,
                fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
              }}>
                ✅ Confirm Your Selection
              </Typography>
              
              <Box sx={{ textAlign: "center", mb: 5 }}>
                <Box sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: 60, sm: 80 },
                  height: { xs: 60, sm: 80 },
                  borderRadius: "50%",
                  backgroundColor: "rgba(34, 197, 94, 0.2)",
                  border: "2px solid #22c55e",
                  mb: 3
                }}>
                  <EventSeat sx={{ fontSize: { xs: 36, sm: 48 }, color: "#22c55e" }} />
                </Box>
                <Typography variant="h5" color="#22c55e" gutterBottom sx={{ 
                  fontWeight: "bold",
                  fontSize: { xs: "1.25rem", sm: "1.5rem" }
                }}>
                  {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""} Selected
                </Typography>
                <Chip
                  label={selectedSeats.join(", ")}
                  variant="outlined"
                  sx={{
                    color: "#22c55e",
                    borderColor: "#22c55e",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",
                    fontSize: { xs: "0.875rem", sm: "1rem" },
                    p: { xs: 1, sm: 2 },
                    mb: 2,
                    fontWeight: "600",
                    maxWidth: "100%",
                  }}
                />
              </Box>

              <Divider sx={{ borderColor: "#e5e7eb", my: 4 }} />

              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" color="#1f2937" gutterBottom sx={{ 
                  fontWeight: "bold", 
                  mb: 3,
                  fontSize: { xs: "1.25rem", sm: "1.5rem" }
                }}>
                  📋 Booking Summary
                </Typography>
                
                {/* Selected seats with prices */}
                {selectedSeats.map((seatId) => {
                  const seat = allSeats.find(s => s.id === seatId);
                  return (
                    <Box key={seatId} sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center", 
                      mb: 2, 
                      p: 2, 
                      backgroundColor: "#f8fafc", 
                      borderRadius: 2 
                    }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ 
                          width: 12, 
                          height: 12, 
                          borderRadius: 1, 
                          backgroundColor: seat?.color 
                        }} />
                        <Typography color="#374151" variant="body1" fontWeight="600" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                          Seat {seatId} ({seat?.category})
                        </Typography>
                      </Box>
                      <Typography color="#1f2937" variant="body1" fontWeight="600" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                        ₹{seat?.price}
                      </Typography>
                    </Box>
                  );
                })}

                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, p: 2 }}>
                  <Typography color="#64748b" variant="body1" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    Service Fee:
                  </Typography>
                  <Typography color="#1f2937" variant="body1" fontWeight="600" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
                    ₹{(totalPrice * 0.1).toFixed(2)}
                  </Typography>
                </Box>
                
                <Divider sx={{ borderColor: "#e5e7eb", my: 2 }} />
                
                <Box sx={{ 
                  display: "flex", 
                  justifyContent: "space-between", 
                  p: 3, 
                  backgroundColor: "#22c55e", 
                  borderRadius: 2,
                  border: "1px solid #16a34a"
                }}>
                  <Typography variant="h5" color="white" sx={{ 
                    fontWeight: "bold",
                    fontSize: { xs: "1.25rem", sm: "1.5rem" }
                  }}>
                    Total Amount:
                  </Typography>
                  <Typography variant="h4" color="white" fontWeight="bold" sx={{ 
                    fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2rem" }
                  }}>
                    ₹{(totalPrice + (totalPrice * 0.1)).toFixed(2)}
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ 
                borderRadius: 2, 
                mb: 3, 
                backgroundColor: "#dbeafe", 
                color: "#1e40af",
                fontSize: { xs: "0.875rem", sm: "1rem" }
              }}>
                ⏳ Your seats are temporarily locked. You have 5 minutes to complete the booking.
              </Alert>
            </Paper>
          </Container>
        );
      default:
        return null;
    }
  };

  if (!open) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        backdropFilter: "blur(8px)",
        zIndex: 9999,
        overflow: "auto",
        py: { xs: 1, sm: 2, md: 3, lg: 4 },
      }}
    >
      {/* Header - Not Sticky */}
      <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, mb: 3 }}>
        <Paper sx={{ 
          backgroundColor: "white", 
          borderRadius: 3,
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e0e0e0",
          p: { xs: 2, sm: 3, md: 4 }
        }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
                <LocalMovies sx={{ color: "#22c55e", fontSize: { xs: 28, sm: 32, md: 36, lg: 40 } }} />
                <Typography variant="h4" fontWeight="bold" color="#1f2937" sx={{ 
                  fontSize: { xs: "1.25rem", sm: "1.5rem", md: "1.75rem", lg: "2rem" } 
                }}>
                  Select Your Seats
                </Typography>
              </Box>
              <Typography variant="h6" color="#64748b" sx={{ 
                mt: 0.5,
                fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" }
              }}>
                {show.theaterId.theatername} • {show.room.name} • 10 Rows × 12 Columns
              </Typography>
            </Box>
            <IconButton 
              onClick={handleClose}
              sx={{ 
                color: "#64748b",
                backgroundColor: "#f8fafc",
                "&:hover": { 
                  backgroundColor: "#e2e8f0",
                  color: "#374151",
                  transform: "rotate(90deg)"
                },
                transition: "all 0.3s ease",
                width: { xs: 36, sm: 40, md: 44, lg: 48 },
                height: { xs: 36, sm: 40, md: 44, lg: 48 }
              }}
            >
              <Close />
            </IconButton>
          </Box>

          {/* Stepper */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 1, sm: 1.5, md: 2 } }}>
              {steps.map((step, index) => (
                <React.Fragment key={step}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box
                      sx={{
                        width: { xs: 26, sm: 28, md: 30, lg: 32 },
                        height: { xs: 26, sm: 28, md: 30, lg: 32 },
                        borderRadius: "50%",
                        backgroundColor: activeStep >= index ? "#22c55e" : "#e5e7eb",
                        color: activeStep >= index ? "white" : "#9ca3af",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: "bold",
                        fontSize: { xs: "0.75rem", sm: "0.8rem", md: "0.85rem", lg: "0.9rem" },
                        transition: "all 0.3s ease",
                      }}
                    >
                      {index + 1}
                    </Box>
                    <Typography
                      variant="body1"
                      fontWeight="600"
                      color={activeStep >= index ? "#22c55e" : "#9ca3af"}
                      sx={{ 
                        fontSize: { xs: "0.8rem", sm: "0.875rem", md: "0.95rem", lg: "1rem" }, 
                        display: { xs: "none", sm: "block" } 
                      }}
                    >
                      {step}
                    </Typography>
                  </Box>
                  {index < steps.length - 1 && (
                    <Box
                      sx={{
                        flex: 1,
                        height: 2,
                        backgroundColor: activeStep > index ? "#22c55e" : "#e5e7eb",
                        mx: { xs: 1, sm: 1.5, md: 2 },
                        minWidth: { xs: 15, sm: 30, md: 40, lg: 50 },
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Content */}
      <Box>
        {error && (
          <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, mb: 3 }}>
            <Alert severity="error" sx={{ borderRadius: 2, boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }}>
              {error}
            </Alert>
          </Container>
        )}

        {getStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Container maxWidth={false} sx={{ px: { xs: 1, sm: 2, md: 3, lg: 4 }, mt: 3, pb: 3 }}>
          <Paper sx={{ 
            p: 3, 
            backgroundColor: "white", 
            borderRadius: 3,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e0e0e0"
          }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <Button
                onClick={activeStep === 0 ? handleClose : handleBack}
                variant="outlined"
                sx={{
                  borderColor: "#d1d5db",
                  color: "#374151",
                  minWidth: { xs: "100%", sm: 120 },
                  height: 50,
                  borderRadius: 2,
                  fontWeight: "600",
                  fontSize: "1rem",
                  "&:hover": {
                    borderColor: "#9ca3af",
                    backgroundColor: "#f9fafb",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {activeStep === 0 ? "Cancel" : "Back"}
              </Button>

              <Button
                variant="contained"
                onClick={activeStep === 0 ? handleNext : handleConfirm}
                disabled={(activeStep === 0 && selectedSeats.length !== numSeats) || loading}
                sx={{
                  backgroundColor: "#22c55e",
                  minWidth: { xs: "100%", sm: 200 },
                  height: 50,
                  borderRadius: 2,
                  fontWeight: "bold",
                  fontSize: "1rem",
                  "&:hover": {
                    backgroundColor: "#16a34a",
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 20px rgba(34, 197, 94, 0.4)",
                  },
                  "&:disabled": {
                    backgroundColor: "#d1d5db",
                    color: "#9ca3af",
                    transform: "none",
                    boxShadow: "none",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: "white" }} />
                ) : activeStep === 0 ? (
                  `Select ${numSeats} Seat${numSeats !== 1 ? "s" : ""}`
                ) : (
                  "Confirm & Proceed to Payment"
                )}
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default SeatSelectionDialog;