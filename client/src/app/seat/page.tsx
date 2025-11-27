"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  CircularProgress,
  Alert,
  Paper
} from "@mui/material";
import { confirmBooking, getShowById, lockSeats } from "@/app/api/seatbooking.endpoint";
import SeatMatrix from "@/components/SeatMatrix";
import { useAppDispatch, useAppSelector } from "@/hooks/hookes";
import { setShow, setLockedSeats, clearBooking } from "@/store/bookingSlice";
import { v4 as uuidv4 } from "uuid";
import { Show, LockSeatRequest, ConfirmBookingRequest } from "@/types/booking";

export default function SeatSelectionPage() {
  // const params = useParams();
  // const router = useRouter();
  // const dispatch = useAppDispatch();
  // const booking = useAppSelector(state => state.booking);
  
  // const showId = params?.showId as string;

  // const [show, setShow] = useState<Show | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [locking, setLocking] = useState(false);
  // const [confirming, setConfirming] = useState(false);
  // const [error, setError] = useState<string>("");
  // const [success, setSuccess] = useState<string>("");

  // useEffect(() => {
  //   if (!showId) {
  //     setError("Show ID not found");
  //     setLoading(false);
  //     return;
  //   }

  //   fetchShowDetails();
  // }, [showId]);

  // const fetchShowDetails = async () => {
  //   try {
  //     setLoading(true);
  //     setError("");
      
  //     const response = await getShowById(showId);
  //     const showData = response.data;
      
  //     setShow(showData);
      
  //     const sessionId = uuidv4();
  //     // dispatch(setShow({
  //     //   showId,
  //     //   price: showData.price,
  //     //   sessionId,
  //     //   showDetails: {
  //     //     room: showData.room,
  //     //     date: showData.date,
  //     //     showTime: showData.showTime
  //     //   }
  //     // }));
      
  //   } catch (err: unknown) {
  //     console.error("Error fetching show:", err);
  //     setError(err instanceof Error ? err.message : "Failed to load show details");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleLockSeats = async () => {
  //   if (!booking.selectedSeats || booking.selectedSeats.length === 0) {
  //     setError("Please select at least one seat");
  //     return;
  //   }

  //   if (!booking.sessionId) {
  //     setError("Session error. Please refresh the page.");
  //     return;
  //   }

  //   setLocking(true);
  //   setError("");
  //   setSuccess("");

  //   try {
  //     const payload: LockSeatRequest = {
  //       showId,
  //       seats: booking.selectedSeats,
  //       sessionId: booking.sessionId,
  //       ttlSeconds: 300
  //     };

  //     const response = await lockSeats(payload);
      
  //     if (response.success) {
  //       dispatch(setLockedSeats(response.data.lockedSeats));
  //       setSuccess("Seats locked successfully! You have 5 minutes to complete the booking.");
  //     } else {
  //       setError(response.message || "Failed to lock seats");
  //     }
  //   } catch (err: unknown) {
  //     console.error("Error locking seats:", err);
  //     setError(err instanceof Error ? err.message : "Failed to lock seats");
  //   } finally {
  //     setLocking(false);
  //   }
  // };

  // const handleConfirmBooking = async () => {
  //   if (!booking.selectedSeats || booking.selectedSeats.length === 0) {
  //     setError("Please select seats first");
  //     return;
  //   }

  //   if (!booking.sessionId) {
  //     setError("Session error. Please refresh the page.");
  //     return;
  //   }

  //   setConfirming(true);
  //   setError("");

  //   try {
  //     const totalAmount = (booking.pricePerSeat || show?.price || 0) * booking.selectedSeats.length;
      
  //     const payload: ConfirmBookingRequest = {
  //       showId,
  //       seats: booking.selectedSeats,
  //       totalAmount,
  //       sessionId: booking.sessionId
  //     };

  //     const response = await confirmBooking(payload);
      
  //     if (response.success) {
  //       setSuccess("Booking confirmed successfully!");
  //       dispatch(clearBooking());
        
  //       setTimeout(() => {
  //         router.push("/bookings");
  //       }, 2000);
  //     } else {
  //       setError(response.message || "Failed to confirm booking");
  //     }
  //   } catch (err: unknown) {
  //     console.error("Error confirming booking:", err);
  //     setError(err instanceof Error ? err.message : "Failed to confirm booking");
  //   } finally {
  //     setConfirming(false);
  //   }
  // };

  // const calculateTotal = (): number => {
  //   const seatCount = booking.selectedSeats.length;
  //   const pricePerSeat = booking.pricePerSeat || show?.price || 0;
  //   return seatCount * pricePerSeat;
  // };

  // if (loading) {
  //   return (
  //     <Box sx={{ 
  //       minHeight: '80vh', 
  //       display: 'flex', 
  //       alignItems: 'center', 
  //       justifyContent: 'center',
  //       backgroundColor: '#071025'
  //     }}>
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  // if (error && !show) {
  //   return (
  //     <Box sx={{ 
  //       minHeight: '80vh', 
  //       display: 'flex', 
  //       alignItems: 'center', 
  //       justifyContent: 'center',
  //       backgroundColor: '#071025'
  //     }}>
  //       <Alert 
  //         severity="error" 
  //         sx={{ maxWidth: 500 }}
  //         action={
  //           <Button 
  //             color="inherit" 
  //             size="small" 
  //             onClick={() => router.back()}
  //           >
  //             Go Back
  //           </Button>
  //         }
  //       >
  //         <Typography variant="h6" gutterBottom>
  //           Error Loading Show
  //         </Typography>
  //         <Typography>
  //           {error}
  //         </Typography>
  //       </Alert>
  //     </Box>
  //   );
  // }

  // if (!show) {
  //   return (
  //     <Box sx={{ 
  //       minHeight: '80vh', 
  //       display: 'flex', 
  //       alignItems: 'center', 
  //       justifyContent: 'center',
  //       backgroundColor: '#071025'
  //     }}>
  //       <Alert 
  //         severity="warning" 
  //         sx={{ maxWidth: 500 }}
  //       >
  //         <Typography variant="h6" gutterBottom>
  //           Show Not Found
  //         </Typography>
  //         <Typography>
  //           The show you&apos;re looking for doesn&apos;t exist or has been removed.
  //         </Typography>
  //       </Alert>
  //     </Box>
  //   );
  // }

  // const lockedSeats = show.locks?.map((lock) => lock.seat) || [];

  return (
    <Box sx={{ 
      background: '#071025', 
      color: '#fff', 
      minHeight: '100vh', 
      py: 4 
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 4,
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Select Your Seats
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="h6" color="#3b82f6" gutterBottom>
                {/* {show.theaterId.theatername} */}
              </Typography>
              {/* {show.theaterId.location && (
                <Typography variant="body1" color="#94a3b8" gutterBottom>
                  📍 {show.theaterId.location}
                </Typography>
              )} */}
              <Typography variant="body1" color="#cbd5e1">
                {/* {show.room.name} • Screen {show.screenNumber} */}
              </Typography>
            </Box>
            
            <Box>
              <Typography variant="body1" color="#94a3b8" gutterBottom>
                {/* 📅 {new Date(show.date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })} */}
              </Typography>
              <Typography variant="body1" color="#94a3b8" gutterBottom>
                {/* 🕒 {show.showTime.map(time => 
                  new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })
                ).join(', ')} */}
              </Typography>
              <Typography variant="body1" color="#fbbf24" fontWeight="bold">
                {/* ₹{show.price} per seat */}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Alerts */}
        {/* {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )} */}

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
          {/* Seat Matrix */}
          <Box sx={{ flex: 1 }}>
            <Paper 
              sx={{ 
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}
            >
              {/* <SeatMatrix
                rows={show.room.rows}
                columns={show.room.columns}
                bookedSeats={show.bookedSeats}
                lockedSeats={lockedSeats}
              /> */}
            </Paper>
          </Box>

          {/* Booking Summary & Actions */}
          <Box sx={{ width: { xs: '100%', lg: 400 } }}>
            <Paper 
              sx={{ 
                p: 3,
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'sticky',
                top: 20
              }}
            >
              <Typography variant="h6" gutterBottom>
                Booking Summary
              </Typography>

              {/* Selected Seats */}
              {/* {booking.selectedSeats.length > 0 ? ( */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="#94a3b8" gutterBottom>
                    Selected Seats 
                    {/* ({booking.selectedSeats.length}): */}
                  </Typography>
                  <Typography variant="body1" color="white" fontWeight="bold">
                    {/* {booking.selectedSeats.join(', ')} */}
                  </Typography>
                </Box>
              {/* ) : ( */}
                <Typography variant="body2" color="#94a3b8" sx={{ mb: 3 }}>
                  No seats selected yet
                </Typography>
              {/* )} */}

              {/* Price Breakdown */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="#94a3b8">
                    Seat Price ×
                     {/* {booking.selectedSeats.length} */}
                  </Typography>
                  <Typography variant="body2" color="white">
                    {/* ₹{calculateTotal()} */}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="#94a3b8">
                    Convenience Fee
                  </Typography>
                  <Typography variant="body2" color="white">
                    {/* ₹{Math.floor(calculateTotal() * 0.1)} */}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="#94a3b8">
                    Tax (18%)
                  </Typography>
                  <Typography variant="body2" color="white">
                    {/* ₹{Math.floor(calculateTotal() * 0.18)} */}
                  </Typography>
                </Box>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <Typography variant="h6" color="white">
                    Total Amount
                  </Typography>
                  <Typography variant="h6" color="#fbbf24">
                    {/* ₹{calculateTotal() + Math.floor(calculateTotal() * 0.28)} */}
                  </Typography>
                </Box>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  size="large"
                  // onClick={handleLockSeats}
                  // disabled={locking || booking.selectedSeats.length === 0}
                  sx={{
                    backgroundColor: '#3b82f6',
                    '&:hover': {
                      backgroundColor: '#2563eb',
                    },
                    '&:disabled': {
                      backgroundColor: '#6b7280',
                    }
                  }}
                >
                  {/* {locking ? <CircularProgress size={24} /> : 'Lock Seats'} */}
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  // onClick={handleConfirmBooking}
                  // disabled={confirming || booking.selectedSeats.length === 0}
                  sx={{
                    borderColor: '#10b981',
                    color: '#10b981',
                    '&:hover': {
                      borderColor: '#059669',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    },
                    '&:disabled': {
                      borderColor: '#6b7280',
                      color: '#6b7280',
                    }
                  }}
                >
                  {/* {confirming ? <CircularProgress size={24} /> : 'Confirm Booking'} */}
                </Button>

                <Button
                  variant="text"
                  // onClick={() => router.back()}
                  sx={{
                    color: '#94a3b8',
                    '&:hover': {
                      color: '#cbd5e1',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }
                  }}
                >
                  Back to Show Times
                </Button>
              </Box>

              {/* Help Text */}
              <Typography 
                variant="caption" 
                color="#6b7280" 
                sx={{ 
                  display: 'block', 
                  mt: 2,
                  textAlign: 'center'
                }}
              >
                💡 Lock seats to reserve them for 5 minutes while you complete your booking
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}