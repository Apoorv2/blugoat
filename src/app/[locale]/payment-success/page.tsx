/* eslint-disable unused-imports/no-unused-vars */
'use client';

import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';

export default function PaymentSuccessPage({ params }: { params: { locale: string } }) {
  const router = useRouter();
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const paymentIntentId = params.get('payment_intent');
      const status = params.get('redirect_status');
      const purchasedCredits = params.get('credits');

      setPaymentIntent(paymentIntentId);
      if (purchasedCredits) {
        setCredits(Number.parseInt(purchasedCredits, 10));
      }
      setIsLoading(false);

      if (status === 'succeeded') {
        localStorage.setItem('payment_success', JSON.stringify({
          paymentIntentId,
          credits: purchasedCredits,
          timestamp: Date.now(),
        }));
      }
    }
  }, []);

  const handleReturnToSearch = () => {
    router.push(`/${params.locale}/lead-query`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-4 text-black">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-md">
        <div className="mb-1 flex justify-center">
          <Image
            src="/blugoatLogo.png"
            alt="Bluegoat Logo"
            width={64}
            height={64}
            className="mb-1"
          />
        </div>
        <div className="mb-6 flex justify-center">
          <CheckCircle className="size-16 text-green-500" />
        </div>

        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Payment Successful
        </h1>

        <p className="mb-6 text-center text-gray-600">
          Payment successful! You've purchased
          {' '}
          {credits || 'your'}
          {' '}
          credits that have been added to your account and are ready to use.
        </p>

        {paymentIntent && (
          <p className="mb-6 overflow-hidden text-ellipsis text-center text-sm text-gray-500">
            Transaction ID:
            {' '}
            {paymentIntent}
          </p>
        )}

        <div className="flex justify-center">
          <Button onClick={handleReturnToSearch} className="bg-blue-600 hover:bg-blue-700">
            Search for Leads
          </Button>
        </div>
      </div>
    </div>
  );
}
