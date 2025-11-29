// import type { NextApiRequest, NextApiResponse } from 'next';
// import { stripe } from '@/lib/stripe';
// import { bookingRepository } from '@/backend/repository/booking.repo';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ success: false, message: 'Method not allowed' });
//   }

//   try {
//     const { paymentIntentId, bookingId } = req.body;

//     if (!paymentIntentId || !bookingId) {
//       return res.status(400).json({ 
//         success: false, 
//         message: 'Missing required fields' 
//       });
//     }

//     // Retrieve payment intent from Stripe
//     const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

//     if (paymentIntent.status === 'succeeded') {
//       // Update booking payment status
//       // You might want to update your booking record here
//       await bookingRepository.updateBooking(bookingId, { 
//         paymentStatus: 'Paid' 
//       });

//       return res.status(200).json({
//         success: true,
//         message: 'Payment confirmed successfully',
//         data: {
//           paymentIntentId: paymentIntent.id,
//           amount: paymentIntent.amount / 100, // Convert back to dollars
//           status: paymentIntent.status,
//         }
//       });
//     } else {
//       return res.status(400).json({
//         success: false,
//         message: `Payment not completed. Status: ${paymentIntent.status}`
//       });
//     }
//   } catch (error) {
//     console.error('Error confirming payment:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to confirm payment'
//     });
//   }
// }