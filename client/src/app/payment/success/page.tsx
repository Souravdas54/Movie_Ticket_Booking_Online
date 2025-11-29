"use client";
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container, Paper, Typography, Button, Box } from '@mui/material';
import { Check } from '@mui/icons-material';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (!bookingId) {
      router.push('/');
    }
  }, [bookingId, router]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ mb: 3 }}>
          <Check sx={{ fontSize: 64, color: '#22c55e' }} />
        </Box>
        <Typography variant="h4" gutterBottom color="#22c55e">
          Payment Successful!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your payment has been processed successfully. Your tickets have been booked.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => router.push(`/tickets/${bookingId}`)}
        >
          View Tickets
        </Button>
      </Paper>
    </Container>
  );
}