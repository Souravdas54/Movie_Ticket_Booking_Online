"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  Typography,
  IconButton,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Grid,
  Paper,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import { Close, Chair, ConfirmationNumber, EventSeat } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/hooks/hookes";
import { toggleSeat, setLockedSeats, clearSeats } from "@/store/bookingSlice";
import SeatMatrix from "./SeatMatrix";
import { lockSeats, releaseSeats } from "@/app/api/seatbooking.endpoint";
import { Show } from "@/types/booking";

interface SeatSelectionDialogProps {
  open: boolean;
  onClose: () => void;
  onSeatsConfirmed: (seats: string[]) => void;
  show: Show;
}

const SeatSelectionDialog: React.FC<SeatSelectionDialogProps> = ({
  open,
  onClose,
  onSeatsConfirmed,
  show,
}) => {
  const dispatch = useAppDispatch();
  const { selectedSeats, lockedSeats, pricePerSeat, sessionId } = useAppSelector(
    (state) => state.booking
  );

  const [numSeats, setNumSeats] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [activeStep, setActiveStep] = useState<number>(0);

  const steps = ["Select Seats", "Confirm Selection"];

  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
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
        ttlSeconds: 300, // 5 minutes
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
    } catch (err: any) {
      console.error("Error locking seats:", err);
      setError(err.message || "Failed to lock seats. Please try again.");
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
    // Release any locked seats when closing
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

  const seatTypes = [
    { type: "Standard", price: show.price, color: "#22c55e", description: "Comfortable standard seating" },
    { type: "Premium", price: show.price + 50, color: "#3b82f6", description: "Extra legroom and comfort" },
    { type: "VIP", price: show.price + 100, color: "#f59e0b", description: "Luxury recliner seats" },
  ];

  const totalPrice = selectedSeats.length * pricePerSeat;

  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <>
            {/* Seat Quantity Selection */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                <ConfirmationNumber />
                How many seats would you like?
              </Typography>
              <Box display="flex" gap={1} flexWrap="wrap" sx={{ mt: 2 }}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <Button
                    key={num}
                    variant={numSeats === num ? "contained" : "outlined"}
                    onClick={() => {
                      setNumSeats(num);
                      dispatch(clearSeats());
                    }}
                    sx={{
                      minWidth: 60,
                      height: 60,
                      borderRadius: 2,
                      borderColor: "#3b82f6",
                      color: numSeats === num ? "white" : "#3b82f6",
                      backgroundColor: numSeats === num ? "#3b82f6" : "transparent",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      "&:hover": {
                        backgroundColor: numSeats === num ? "#2563eb" : "rgba(59, 130, 246, 0.1)",
                        borderColor: "#2563eb",
                      },
                    }}
                  >
                    {num}
                  </Button>
                ))}
              </Box>
            </Paper>

            {/* Seat Types and Prices */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <Typography variant="h6" gutterBottom sx={{ color: "white", display: "flex", alignItems: "center", gap: 1 }}>
                <Chair />
                Seat Types & Prices
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {seatTypes.map((seatType) => (
                  <Grid item xs={12} md={4} key={seatType.type}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 2,
                        border: "1px solid #374151",
                        borderRadius: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.02)",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: seatType.color,
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Chair sx={{ color: seatType.color, fontSize: 32 }} />
                      <Box>
                        <Typography variant="body1" fontWeight="bold" color="white">
                          {seatType.type}
                        </Typography>
                        <Typography variant="body2" color="#94a3b8">
                          {seatType.description}
                        </Typography>
                        <Typography variant="h6" color={seatType.color} fontWeight="bold" sx={{ mt: 0.5 }}>
                          ₹{seatType.price}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* Seat Layout */}
            <Paper sx={{ p: 3, mb: 3, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
              <SeatMatrix
                rows={show.room.rows}
                columns={show.room.columns}
                bookedSeats={show.bookedSeats}
                lockedSeats={lockedSeats}
                onSeatClick={handleSeatSelect}
              />
            </Paper>
          </>
        );
      case 1:
        return (
          <Paper sx={{ p: 4, backgroundColor: "rgba(255, 255, 255, 0.05)" }}>
            <Typography variant="h5" color="white" gutterBottom textAlign="center">
              Confirm Your Selection
            </Typography>
            
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <EventSeat sx={{ fontSize: 64, color: "#3b82f6", mb: 2 }} />
              <Typography variant="h6" color="#3b82f6" gutterBottom>
                {selectedSeats.length} Seat{selectedSeats.length !== 1 ? "s" : ""} Selected
              </Typography>
              <Chip
                label={selectedSeats.join(", ")}
                variant="outlined"
                sx={{
                  color: "white",
                  borderColor: "#3b82f6",
                  fontSize: "1rem",
                  p: 2,
                  mb: 2,
                }}
              />
            </Box>

            <Divider sx={{ borderColor: "#374151", my: 3 }} />

            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="white" gutterBottom>
                Booking Summary
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="#94a3b8">Seats:</Typography>
                <Typography color="white">{selectedSeats.length} × ₹{pricePerSeat}</Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography color="#94a3b8">Service Fee:</Typography>
                <Typography color="white">₹{(selectedSeats.length * pricePerSeat * 0.1).toFixed(2)}</Typography>
              </Box>
              <Divider sx={{ borderColor: "#374151", my: 1 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography variant="h6" color="white">Total Amount:</Typography>
                <Typography variant="h5" color="#3b82f6" fontWeight="bold">
                  ₹{totalPrice + (selectedSeats.length * pricePerSeat * 0.1)}
                </Typography>
              </Box>
            </Box>

            <Alert severity="info" sx={{ borderRadius: 2, mb: 3 }}>
              Your seats are temporarily locked. You have 5 minutes to complete the booking.
            </Alert>
          </Paper>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          backgroundColor: "#1f2937",
          color: "white",
          minHeight: "80vh",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 3, borderBottom: "1px solid #374151" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Select Your Seats
            </Typography>
            <Typography variant="body2" color="#94a3b8" sx={{ mt: 0.5 }}>
              {show.theaterId.theatername} • {show.room.name}
            </Typography>
          </Box>
          <IconButton aria-label="close" onClick={handleClose} sx={{ color: "white" }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4, color: "white" }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color: "#94a3b8 !important",
                    "&.Mui-completed": {
                      color: "#10b981 !important",
                    },
                    "&.Mui-active": {
                      color: "#3b82f6 !important",
                    },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {getStepContent(activeStep)}

        {/* Navigation Buttons */}
        <Box display="flex" justifyContent="space-between" mt={4}>
          <Button
            onClick={activeStep === 0 ? handleClose : handleBack}
            variant="outlined"
            sx={{
              borderColor: "#6b7280",
              color: "white",
              "&:hover": {
                borderColor: "#9ca3af",
                backgroundColor: "rgba(156, 163, 175, 0.1)",
              },
              minWidth: 120,
            }}
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>

          <Button
            variant="contained"
            onClick={activeStep === 0 ? handleNext : handleConfirm}
            disabled={
              (activeStep === 0 && selectedSeats.length !== numSeats) || loading
            }
            sx={{
              backgroundColor: "#3b82f6",
              "&:hover": {
                backgroundColor: "#2563eb",
              },
              "&:disabled": {
                backgroundColor: "#374151",
                color: "#6b7280",
              },
              minWidth: 120,
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
      </DialogContent>
    </Dialog>
  );
};

export default SeatSelectionDialog;


//  "use client";
// import React, { useEffect, useState } from "react";
// import { Box, Button, Typography, Paper, Grid,CircularProgress,Alert} from "@mui/material";
// import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// import dayjs, { Dayjs } from "dayjs";
// import { useRouter } from "next/navigation";
// import { getShowsByMovie } from "@/app/api/seatbooking.endpoint";
// import { Show } from "@/types/booking";

// interface ShowTimeSelectorProps {
//   movieId: string;
// }

// const ShowTimeSelector: React.FC<ShowTimeSelectorProps> = ({ movieId }) => {
//   const [selectedDate, setSelectedDate] = useState<Dayjs | null>(dayjs());
//   const [shows, setShows] = useState<Show[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const router = useRouter();

//   useEffect(() => {
//     fetchShows();
//   }, [selectedDate, movieId]);

//   const fetchShows = async () => {
//     if (!movieId) return;
    
//     setLoading(true);
//     setError(null);
    
//     try {
//       const dateString = selectedDate ? selectedDate.format("YYYY-MM-DD") : undefined;
//       const response = await getShowsByMovie(movieId, dateString);
//       setShows(response.data || []);
//     } catch (err: any) {
//       console.error("Error fetching shows:", err);
//       setError(err.message || "Failed to load shows");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleShowSelect = (showId: string) => {
//     router.push(`/seat/${showId}`);
//   };

//   const formatShowTime = (time: string): string => {
//     return dayjs(time, 'HH:mm').format('h:mm A');
//   };

//   const calculateAvailableSeats = (show: Show): number => {
//     const totalSeats = show.room.rows * show.room.columns;
//     const bookedSeats = show.bookedSeats.length;
//     return totalSeats - bookedSeats;
//   };

//   return (
//     <LocalizationProvider dateAdapter={AdapterDayjs}>
//       <Box sx={{ mt: 4, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 2 }}>
//         <Typography variant="h5" gutterBottom sx={{ color: 'white', mb: 3 }}>
//           Select Date & Show Time
//         </Typography>

//         {/* Date Picker */}
//         <Box sx={{ mb: 3 }}>
//           <DatePicker
//             label="Select Date"
//             value={selectedDate}
//             onChange={(newDate) => setSelectedDate(newDate)}
//             minDate={dayjs()}
//             maxDate={dayjs().add(30, 'day')}
//             slotProps={{
//               textField: {
//                 sx: {
//                   '& .MuiOutlinedInput-root': {
//                     '& fieldset': {
//                       borderColor: '#4b5563',
//                     },
//                     '&:hover fieldset': {
//                       borderColor: '#6b7280',
//                     },
//                     '&.Mui-focused fieldset': {
//                       borderColor: '#3b82f6',
//                     },
//                   },
//                   '& .MuiInputLabel-root': {
//                     color: '#9ca3af',
//                   },
//                   '& .MuiInputBase-input': {
//                     color: 'white',
//                   },
//                 }
//               }
//             }}
//           />
//         </Box>

//         {/* Shows List */}
//         {loading && (
//           <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
//             <CircularProgress />
//           </Box>
//         )}

//         {error && (
//           <Alert severity="error" sx={{ mb: 2 }}>
//             {error}
//           </Alert>
//         )}

//         {!loading && !error && shows.length === 0 && (
//           <Alert severity="info">
//             No shows available for the selected date.
//           </Alert>
//         )}

//         {!loading && shows.length > 0 && (
//           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//             {shows.map((show) => (
//               <Paper 
//                 key={show._id} 
//                 sx={{ 
//                   p: 3, 
//                   backgroundColor: 'rgba(255, 255, 255, 0.05)',
//                   border: '1px solid rgba(255, 255, 255, 0.1)',
//                   backdropFilter: 'blur(10px)'
//                 }}
//               >
//                 <Grid container spacing={2} alignItems="center">
//                   <Grid item xs={12} md={8}>
//                     <Typography 
//                       variant="h6" 
//                       sx={{ color: 'white', mb: 1 }}
//                     >
//                       {show.theaterId.theatername}
//                     </Typography>
                    
//                     {show.theaterId.location && (
//                       <Typography 
//                         variant="body2" 
//                         sx={{ color: '#94a3b8', mb: 1 }}
//                       >
//                         📍 {show.theaterId.location}
//                       </Typography>
//                     )}
                    
//                     <Typography 
//                       variant="body1" 
//                       sx={{ color: '#cbd5e1', mb: 2 }}
//                     >
//                       {show.room.name} • Screen {show.screenNumber} • ₹{show.price}
//                     </Typography>

//                     {/* Show Times */}
//                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
//                       {show.showTime.map((time) => {
//                         const availableSeats = calculateAvailableSeats(show);
//                         const isFewSeatsLeft = availableSeats <= 10;
                        
//                         return (
//                           <Button
//                             key={time}
//                             variant="outlined"
//                             size="medium"
//                             onClick={() => handleShowSelect(show._id)}
//                             sx={{
//                               borderColor: isFewSeatsLeft ? '#f59e0b' : '#3b82f6',
//                               color: isFewSeatsLeft ? '#f59e0b' : '#3b82f6',
//                               '&:hover': {
//                                 borderColor: isFewSeatsLeft ? '#d97706' : '#2563eb',
//                                 backgroundColor: isFewSeatsLeft ? 'rgba(245, 158, 11, 0.1)' : 'rgba(59, 130, 246, 0.1)',
//                               },
//                               minWidth: 120,
//                             }}
//                           >
//                             {formatShowTime(time)}
//                             <Box 
//                               component="span" 
//                               sx={{ 
//                                 fontSize: '0.75rem', 
//                                 ml: 0.5,
//                                 color: isFewSeatsLeft ? '#f59e0b' : '#94a3b8'
//                               }}
//                             >
//                               ({availableSeats} {isFewSeatsLeft ? 'left' : 'seats'})
//                             </Box>
//                           </Button>
//                         );
//                       })}
//                     </Box>
//                   </Grid>
                  
//                   <Grid item xs={12} md={4} sx={{ textAlign: { md: 'right' } }}>
//                     <Typography 
//                       variant="body2" 
//                       sx={{ color: '#94a3b8', mb: 1 }}
//                     >
//                       {dayjs(show.date).format('ddd, MMM D, YYYY')}
//                     </Typography>
//                     <Typography 
//                       variant="body2" 
//                       sx={{ color: '#94a3b8' }}
//                     >
//                       {show.room.rows} × {show.room.columns} seating
//                     </Typography>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             ))}
//           </Box>
//         )}
//       </Box>
//     </LocalizationProvider>
//   );
// };

// export default ShowTimeSelector;

// // "use client";
// // import React, { useEffect, useState } from "react";
// // import { Box, Button, Typography, Paper, Grid } from "@mui/material";
// // // import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// // import dayjs, { Dayjs } from "dayjs";
// // import { getShowsByMovie } from "@/app/api/endpoint";
// // import { useRouter } from "next/navigation";

// // interface Props { movieId: string }
// // interface ShowSummary {
// //   _id: string;
// //   theaterId: { _id: string; theatername: string; location?: string };
// //   room: { name: string; rows: number; columns: number };
// //   showTime: string[]; // times
// //   date: string;
// //   price: number;
// //   bookedSeats: string[];
// // }

// // export default function ShowTimeSelector({ movieId }: Props) {
// //   const [date, setDate] = useState<Dayjs | null>(dayjs());
// //   const [shows, setShows] = useState<ShowSummary[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const router = useRouter();

// //   useEffect(() => { fetchShows(); }, [date, movieId]);

// //   async function fetchShows() {
// //     if (!movieId) return;
// //     setLoading(true);
// //     try {
// //       const iso = date ? date.format("YYYY-MM-DD") : undefined;
// //       const res = await getShowsByMovie(movieId, iso);
// //       setShows(res.data || []);
// //     } catch (err) {
// //       console.error(err);
// //     } finally { setLoading(false); }
// //   }

// //   return (
// //     <Box sx={{ mt: 3 }}>
// //       <Typography variant="h6" mb={2}>Select Date & Show</Typography>
// //       {/* <DatePicker value={date} onChange={(d) => setDate(d)} slotProps={{ textField: { size: "small" } }} /> */}
// //       <Box mt={3}>
// //         {loading ? <Typography>Loading shows...</Typography> :
// //           shows.length === 0 ? <Typography>No shows for selected date</Typography> :
// //           shows.map(s => (
// //             <Paper key={s._id} sx={{ p: 2, mb: 2 }}>
// //               <Typography variant="subtitle1" fontWeight={600}>
// //                 {s.theaterId.theatername} {s.theaterId.location ? `• ${s.theaterId.location}` : ""}
// //               </Typography>
// //               <Grid container spacing={1} sx={{ mt: 1 }}>
// //                 <Grid item xs={12} md={8}>
// //                   <Typography sx={{ fontWeight: 600 }}>{s.room.name} • Price: ₹{s.price}</Typography>
// //                   <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
// //                     {s.showTime.map(time => {
// //                       const totalSeats = s.room.rows * s.room.columns;
// //                       const booked = s.bookedSeats?.length || 0;
// //                       const available = totalSeats - booked;
// //                       return (
// //                         <Button key={time} variant="outlined" size="small"
// //                           onClick={() => router.push(`/seat/${s._id}`)}>
// //                           {time} ({available} seats)
// //                         </Button>
// //                       );
// //                     })}
// //                   </Box>
// //                 </Grid>
// //               </Grid>
// //             </Paper>
// //           ))
// //         }
// //       </Box>
// //     </Box>
// //   );
// // }
