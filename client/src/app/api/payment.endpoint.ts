// import { PaymentIntentRequest, PaymentIntentResponse, PaymentConfirmation } from '@/types/payment';

// const API_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// const handleApiError = (error: unknown, defaultMessage: string): never => {
//   console.error('Payment API Error:', error);
  
//   if (typeof error === 'object' && error !== null) {
//     const axiosError = error as { response?: { data?: { message?: string } }; message?: string };
//     const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || axiosError.message || defaultMessage;
//     throw new Error(errorMessage);
//   }
  
//   throw new Error(defaultMessage);
// };

// export const createPaymentIntent = async (
//   payload: PaymentIntentRequest
// ): Promise<PaymentIntentResponse> => {
//   try {
//     const response = await fetch(`${API_URL}/api/payment/create-intent`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(payload),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.error || 'Failed to create payment intent');
//     }

//     return data;
//   } catch (error: unknown) {
//     return handleApiError(error, 'Failed to create payment intent');
//   }
// };

// export const confirmPayment = async (
//   paymentIntentId: string,
//   bookingId: string
// ): Promise<{ success: boolean; message?: string; data?: any }> => {
//   try {
//     const response = await fetch(`${API_URL}/api/payment/confirm`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ paymentIntentId, bookingId }),
//     });

//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.message || 'Failed to confirm payment');
//     }

//     return data;
//   } catch (error: unknown) {
//     return handleApiError(error, 'Failed to confirm payment');
//   }
// };