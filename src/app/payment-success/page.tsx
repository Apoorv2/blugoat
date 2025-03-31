/* eslint-disable no-console */
/* eslint-disable tailwindcss/no-custom-classname */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Process the payment data
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentIntentId = params.get('payment_intent');
      const status = params.get('redirect_status');
      const credits = params.get('credits');

      console.log('Payment success page loaded:', { paymentIntentId, status, credits });

      if (status === 'succeeded') {
        localStorage.setItem('payment_success', JSON.stringify({
          paymentIntentId,
          credits,
          timestamp: Date.now(),
        }));
      }

      // Redirect to dashboard after a short delay to ensure localStorage is set
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    }
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-black">
      <div className="text-2xl font-bold">Payment Successful!</div>
      <div className="mt-4 text-lg">Your credits have been added to your account.</div>
      <div className="text-md mt-2">Redirecting to your dashboard...</div>
    </div>
  );
}
