import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // Parse the request body
    const body = await request.json();
    const { amount, metadata } = body;

    // In a real app, you would create a payment intent with Stripe
    // For now, we'll simulate a successful response with a dummy client secret

    // Generate a fake client secret that looks like a Stripe client secret
    const clientSecret = `pi_${Math.random().toString(36).substring(2)}_secret_${Math.random().toString(36).substring(2)}`;

    return NextResponse.json({
      clientSecret,
      amount,
      metadata,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 },
    );
  }
}
