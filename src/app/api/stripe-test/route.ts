import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST() {
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2023-10-16',
    });

    // Just check if we can connect to Stripe
    const account = await stripe.accounts.retrieve();

    return NextResponse.json({ success: true, account: account.id });
  } catch (error) {
    console.error('Stripe test error:', error);
    return NextResponse.json({
      error: 'Stripe connection failed',
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}
