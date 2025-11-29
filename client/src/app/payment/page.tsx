"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Box, Container, Paper, Typography, Button, Stepper, Step, StepLabel,
  Card, CardContent, Divider, Alert, CircularProgress, Chip
} from "@mui/material";
import { Check, ConfirmationNumber, LocalMovies, LocationOn, Schedule } from "@mui/icons-material";
import { 
  Elements, 
  PaymentElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { createPaymentIntent, confirmPayment } from "@/app/api/payment.endpoint";
import { useStripe as useStripeContext } from "@/components/StripeProvider";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const steps = ['Booking Confirmed', 'Payment Processing', 'Ticket Generated'];

// Payment Form Component
function CheckoutForm({ 
  clientSecret, 
  bookingId, 
  totalAmount,
  onPaymentSuccess 
}: { 
  clientSecret: string;
  bookingId: string;
  totalAmount: number;
  onPaymentSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: submitError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success?bookingId=${bookingId}`,
        },
        redirect: 'if_required',
      });

      if (submitError) {
        setError(submitError.message || "Payment failed");
        setLoading(false);
        return;
      }

      // If no redirect happened, check payment status
      const paymentElement = elements.getElement(PaymentElement);
      if (paymentElement) {
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            payment_method_data: {
              // Add any additional payment method data if needed
            },
          },
          redirect: 'if_required',
        });

        if (confirmError) {
          setError(confirmError.message || "Payment confirmation failed");
        } else {
          // Payment succeeded
          await confirmPayment((await stripe.retrievePaymentIntent(clientSecret)).paymentIntent!.id, bookingId);
          onPaymentSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <PaymentElement 
        options={{
          layout: "tabs",
          wallets: {
            applePay: 'never',
            googlePay: 'never'
          }
        }} 
      />
      
      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={!stripe || loading}
        sx={{
          py: 2,
          mt: 3,
          backgroundColor: "#3b82f6",
          fontSize: "1.1rem",
          fontWeight: "bold",
        }}
      >
        {loading ? (
          <CircularProgress size={24} sx={{ color: "white" }} />
        ) : (
          `Pay ₹${totalAmount}`
        )}
      </Button>
    </form>
  );
}

// Main Payment Page
export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { stripe, loading: stripeLoading } = useStripeContext();
  
  const bookingId = searchParams.get('bookingId');
  const seats = searchParams.get('seats')?.split(',') || [];
  const totalAmount = searchParams.get('total');
  const movieName = searchParams.get('movieName') || "Movie";
  const theaterName = searchParams.get('theaterName') || "Theater";
  const showTime = searchParams.get('showTime') || "Show Time";

  const [activeStep, setActiveStep] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    if (!bookingId || !seats.length || !totalAmount) {
      router.push('/');
      return;
    }

    // Create payment intent when component mounts
    const createIntent = async () => {
      setPaymentLoading(true);
      try {
        const response = await createPaymentIntent({
          amount: parseFloat(totalAmount),
          bookingId,
          seats,
          movieName,
          theaterName,
          showTime,
        });

        if (response.success && response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else {
          setError(response.error || "Failed to initialize payment");
        }
      } catch (err: any) {
        setError(err.message || "Failed to initialize payment");
      } finally {
        setPaymentLoading(false);
      }
    };

    createIntent();
  }, [bookingId, seats, totalAmount, movieName, theaterName, showTime, router]);

  const handlePaymentSuccess = () => {
    setActiveStep(2);
    setPaymentSuccess(true);
    
    // Redirect to tickets page after success
    setTimeout(() => {
      router.push(`/tickets/${bookingId}`);
    }, 3000);
  };

  if (!bookingId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Invalid booking details</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ backgroundColor: "#f8fafc", minHeight: "100vh", py: 4 }}>
      <Container maxWidth="md">
        {/* Header */}
        <Paper sx={{ p: 4, mb: 4, textAlign: "center" }}>
          <Typography variant="h4" fontWeight="bold" color="#1f2937" gutterBottom>
            {paymentSuccess ? "🎉 Payment Successful!" : "Complete Your Payment"}
          </Typography>
          <Typography variant="h6" color="#64748b">
            {paymentSuccess 
              ? "Your tickets have been booked successfully!" 
              : "Secure payment powered by Stripe"
            }
          </Typography>
        </Paper>

        <Box sx={{ display: "flex", gap: 4, flexDirection: { xs: "column", md: "row" } }}>
          {/* Payment Section */}
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 4, mb: 3 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Paper>

            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight="bold" color="#1f2937" gutterBottom>
                Payment Details
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {!paymentSuccess ? (
                <Box>
                  {paymentLoading || stripeLoading ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <CircularProgress />
                      <Typography variant="body2" color="#64748b" sx={{ mt: 2 }}>
                        Initializing payment...
                      </Typography>
                    </Box>
                  ) : clientSecret ? (
                    <Elements 
                      stripe={stripePromise} 
                      options={{ 
                        clientSecret,
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#3b82f6',
                          }
                        }
                      }}
                    >
                      <CheckoutForm 
                        clientSecret={clientSecret}
                        bookingId={bookingId}
                        totalAmount={parseFloat(totalAmount)}
                        onPaymentSuccess={handlePaymentSuccess}
                      />
                    </Elements>
                  ) : (
                    <Alert severity="error">
                      Failed to load payment form
                    </Alert>
                  )}
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 3 }}>
                  <Check sx={{ fontSize: 64, color: "#22c55e", mb: 2 }} />
                  <Typography variant="h6" color="#22c55e" gutterBottom>
                    Payment Successful!
                  </Typography>
                  <Typography variant="body2" color="#64748b">
                    Redirecting to your tickets...
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Booking Summary */}
          <Box sx={{ width: { xs: "100%", md: 300 } }}>
            <Paper sx={{ p: 3, position: "sticky", top: 24 }}>
              <Typography variant="h6" fontWeight="bold" color="#1f2937" gutterBottom>
                Booking Summary
              </Typography>
              
              <Card sx={{ backgroundColor: "#f8fafc", mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LocalMovies sx={{ color: "#3b82f6" }} />
                    <Typography variant="body1" fontWeight="600">
                      {movieName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <LocationOn sx={{ color: "#64748b", fontSize: 18 }} />
                    <Typography variant="body2" color="#64748b">
                      {theaterName}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Schedule sx={{ color: "#64748b", fontSize: 18 }} />
                    <Typography variant="body2" color="#64748b">
                      {showTime}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ConfirmationNumber sx={{ color: "#64748b", fontSize: 18 }} />
                    <Typography variant="body2" color="#64748b">
                      {seats.length} Ticket{seats.length !== 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="#64748b" gutterBottom>
                  Selected Seats
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {seats.map((seat) => (
                    <Chip key={seat} label={seat} size="small" />
                  ))}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="body1" fontWeight="bold">
                  Total Amount
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="#3b82f6">
                  ₹{totalAmount}
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}