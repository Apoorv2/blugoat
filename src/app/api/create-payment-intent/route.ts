/* eslint-disable no-console */
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: Request) {
  try {
    // Check if the secret key is available
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('STRIPE_SECRET_KEY is not defined in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 },
      );
    }

    // Initialize Stripe with your secret key
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-06-20', // Try changing to '2024-06-20'
    });

    // Parse the request body
    const body = await request.json();
    const { amount, metadata } = body;

    console.log('Received request to create payment intent:', { amount, metadata });

    if (!amount || amount < 1) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 },
      );
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'inr', // Using INR for Indian Rupees
      metadata: metadata || {}, // For tracking purposes
      description: `Purchase of ${amount} contacts for lead generation`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    console.log('Payment intent created successfully:', paymentIntent.id);

    // Return the client secret to the frontend
    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    // Log detailed error information
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Error creating payment intent', details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
