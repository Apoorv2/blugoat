'use client';

import { useAuth } from '@clerk/nextjs';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DialogTitle } from '@/components/ui/dialog';

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Test mode options (no client secret required)
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'Ideal Sans, system-ui, sans-serif',
    spacingUnit: '4px',
    borderRadius: '4px',
  },
};

const ELEMENTS_OPTIONS = {
  mode: 'payment',
  amount: 2000, // $20.00
  currency: 'inr',
  payment_method_types: ['card'],
  appearance,
};

export const StripePaymentForm = ({
  contactCount,
  onSuccess,
  onClose,
}: {
  contactCount: number;
  onSuccess: () => void;
  onClose: () => void;
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const { getToken } = useAuth();

  // Initialize payment intent
  useEffect(() => {
    const createPaymentIntent = async () => {
      console.log('Initializing payment for', contactCount, 'contacts');
      try {
        // First test if the test API is working
        console.log('Testing API connection...');

        try {
          const testResponse = await fetch('/api/ping', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          const testData = await testResponse.json();
          console.log('Test API response:', testData);
        } catch (error) {
          console.error('Test API failed:', error);
          // Fall back to test mode if API fails
          console.log('Falling back to test mode due to API issues');
          setIsLoading(false);
          return;
        }

        // Now try the actual payment intent API
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(getToken ? { Authorization: `Bearer ${await getToken()}` } : {}),
          },
          body: JSON.stringify({
            amount: contactCount, // ₹2 per contact
            metadata: { contactCount, purpose: 'contact_purchase' },
          }),
        });

        if (!response.ok) {
          console.error('Payment intent creation failed with status:', response.status);
          // Fall back to test mode if API fails
          console.log('Falling back to test mode due to API error');
          setIsLoading(false);
          return;
        }
        const { clientSecret } = await response.json();
        console.log('Payment intent created successfully');
        setClientSecret(clientSecret);
      } catch (err) {
        console.error('Payment setup error:', err);
        setError(`Payment setup failed: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    createPaymentIntent();
  }, [contactCount, getToken]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, stripe: any, elements: any) => {
    event.preventDefault();
    if (!stripe || !elements) {
      console.error('Stripe not initialized, cannot process payment');
      return;
    }

    console.log('Processing payment...');
    setPaymentStatus('processing');

    // For test mode without client secret:
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return to your success page after payment
        return_url: `${window.location.origin}/payment-success`,
        payment_method_data: {
          billing_details: {
            name: 'Test Customer',
          },
        },
      },
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      setPaymentStatus('error');
      setError(error.message || 'Payment failed');
    } else {
      // Test mode successful completion - we won't get here in test mode
      // as it redirects to return_url
      console.log('Payment completed in test mode');
      setPaymentStatus('success');
      onSuccess();
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Initializing payment...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="mb-3 rounded-md bg-red-50 p-3 text-red-700">{error}</div>
        <Button onClick={onClose}>Close</Button>
      </div>
    );
  }

  if (!clientSecret) {
    // Use test mode instead of requiring a client secret
    return (
      <Elements stripe={stripePromise} options={ELEMENTS_OPTIONS}>
        <DialogTitle className="sr-only">Payment Form</DialogTitle>
        <CheckoutForm
          contactCount={contactCount}
          onSuccess={onSuccess}
          onClose={onClose}
          handleSubmit={handleSubmit}
        />
      </Elements>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <DialogTitle className="sr-only">Payment Form</DialogTitle>
      <CheckoutForm
        contactCount={contactCount}
        onSuccess={onSuccess}
        onClose={onClose}
        handleSubmit={handleSubmit}
      />
    </Elements>
  );
};

// Inner checkout form
function CheckoutForm({ contactCount, onSuccess, onClose, handleSubmit }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <form onSubmit={(e) => {
      console.log('Payment form submitted');
      setIsProcessing(true);
      handleSubmit(e, stripe, elements)
        .finally(() => {
          setIsProcessing(false);
          console.log('Payment processing completed');
        });
    }}
    >
      <DialogTitle className="sr-only">Payment Details</DialogTitle>
      <h3 className="mb-4 text-lg font-bold">
        Purchase
        {contactCount}
        {' '}
        Contacts
      </h3>

      <PaymentElement className="mb-6" />

      {errorMessage && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-red-600">{errorMessage}</div>
      )}

      <div className="flex justify-between gap-3">
        <Button type="button" variant="outline" onClick={onClose} className="w-1/2">
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-1/2 bg-blue-600"
        >
          {isProcessing ? 'Processing...' : `Pay ₹${contactCount * 2}`}
        </Button>
      </div>
    </form>
  );
}
