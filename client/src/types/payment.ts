export interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  bookingId: string;
  seats: string[];
  movieName: string;
  theaterName: string;
  showTime: string;
}

export interface PaymentIntentResponse {
  success: boolean;
  clientSecret?: string;
  error?: string;
}

export interface PaymentConfirmation {
  paymentIntentId: string;
  bookingId: string;
  amount: number;
  status: 'succeeded' | 'processing' | 'requires_payment_method';
}