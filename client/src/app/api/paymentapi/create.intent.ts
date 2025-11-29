// import type { NextApiRequest, NextApiResponse } from 'next';
// import { stripe } from '@/lib/stripe';
// import { PaymentIntentRequest, PaymentIntentResponse } from '@/types/payment';

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<PaymentIntentResponse>
// ) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ success: false, error: 'Method not allowed' });
//   }

//   try {
//     const { amount, bookingId, seats, movieName, theaterName, showTime }: PaymentIntentRequest = req.body;

//     // Validate input
//     if (!amount || !bookingId || !seats || !movieName) {
//       return res.status(400).json({ 
//         success: false, 
//         error: 'Missing required fields' 
//       });
//     }

//     // Create PaymentIntent
//     const paymentIntent = await stripe.paymentIntents.create({
//       amount: Math.round(amount * 100), // Convert to cents
//       currency: 'inr',
//       automatic_payment_methods: {
//         enabled: true,
//       },
//       metadata: {
//         bookingId,
//         seats: seats.join(','),
//         movieName,
//         theaterName,
//         showTime,
//       },
//       description: `Movie tickets for ${movieName} - ${seats.join(', ')}`,
//     });

//     res.status(200).json({
//       success: true,
//       clientSecret: paymentIntent.client_secret!,
//     });
//   } catch (error) {
//     console.error('Error creating payment intent:', error);
//     res.status(500).json({
//       success: false,
//       error: 'Failed to create payment intent',
//     });
//   }
// }