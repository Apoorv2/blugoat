/* eslint-disable ts/no-use-before-define */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-children-map */
/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable react/no-clone-element */
/* eslint-disable react/no-nested-components */
/* eslint-disable react-dom/no-missing-button-type */
/* eslint-disable style/multiline-ternary */
'use client';

import { useAuth } from '@clerk/nextjs';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, ArrowRight, CreditCard, Info, Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { DialogTitle } from '@/components/ui/dialog';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Credit package options
const CREDIT_PACKAGES = [
  { id: 'test', credits: 1, contacts: 1, price: 200, color: 'gray' }, // ₹2 for 1 credit (test option)
  // { id: 'mini', credits: 50, contacts: 50, price: 10000, color: 'gray' }, // ₹100 for 50 credits
  { id: 'small', credits: 250, contacts: 250, price: 50000, color: 'blue' }, // ₹500 for 250 credits
  { id: 'medium', credits: 500, contacts: 500, price: 100000, color: 'green' }, // ₹1,000 for 500 credits
  { id: 'large', credits: 1000, contacts: 1000, price: 200000, color: 'purple' }, // ₹2,000 for 1000 credits
  { id: 'xl', credits: 2500, contacts: 2500, price: 500000, color: 'orange' }, // ₹5,000 for 2500 credits
  { id: 'xxl', credits: 5000, contacts: 5000, price: 1000000, color: 'pink' }, // ₹10,000 for 5000 credits
];

// Colors mapping for packages
const packageColors = {
  blue: 'bg-blue-100 border-blue-300 shadow-blue-100',
  green: 'bg-green-100 border-green-300 shadow-green-100',
  purple: 'bg-purple-100 border-purple-300 shadow-purple-100',
  orange: 'bg-orange-100 border-orange-300 shadow-orange-100',
  pink: 'bg-pink-100 border-pink-300 shadow-pink-100',
};

// Badge colors for selected package
const selectedColors = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  orange: 'bg-orange-500 text-white',
  pink: 'bg-pink-500 text-white',
};

// Appearance settings for Stripe Elements
const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0570de',
    colorBackground: '#ffffff',
    colorText: '#30313d',
    colorDanger: '#df1b41',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '8px',
    fontSizeBase: '16px',
  },
  rules: {
    '.Input': {
      borderWidth: '1px',
      boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    },
    '.Input:focus': {
      borderColor: '#3b82f6',
      boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.5)',
    },
  },
};

// Define props type with transaction ID parameter and contactCount
type StripePaymentFormProps = {
  onSuccess: (transactionId?: string) => void;
  onClose: () => void;
  contactCount?: number; // Add contactCount as an optional prop
};

// Use the type with a standard function declaration
export const StripePaymentForm = ({ onSuccess, onClose, contactCount }: StripePaymentFormProps) => {
  // Find the best matching package for the requested contact count
  const findInitialPackage = () => {
    if (!contactCount) {
      return CREDIT_PACKAGES[1];
    } // Default to small package

    // Find the smallest package that covers the contact count
    const matchingPackage = CREDIT_PACKAGES.find(pkg => pkg.contacts >= contactCount);
    return matchingPackage || CREDIT_PACKAGES[CREDIT_PACKAGES.length - 1]; // Return matching or largest
  };

  const [selectedPackage, setSelectedPackage] = useState(findInitialPackage());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'select' | 'payment'>('select');
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'success' | 'error'>('initial');
  const { getToken } = useAuth();

  // Create payment intent when package changes
  const createPaymentIntent = async () => {
    if (!selectedPackage) {
      console.log('No package selected, cannot create payment intent');
      return;
    }

    console.log('Creating payment intent for package:', selectedPackage.id, 'price:', selectedPackage.price / 100);
    setIsLoading(true);
    try {
      console.log('Making API request to /api/create-payment-intent with amount:', selectedPackage.price / 100);
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(getToken ? { Authorization: `Bearer ${await getToken()}` } : {}),
        },
        body: JSON.stringify({
          amount: selectedPackage.price / 100, // Convert from paise to rupees
          metadata: {
            credits: selectedPackage.credits,
            packageId: selectedPackage.id,
            purpose: 'credit_purchase',
          },
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        console.error('Payment intent creation failed with status:', response.status);
        setError('Could not initialize payment. Please try again.');
        setIsLoading(false);
        return;
      }
      const { clientSecret, paymentIntentId } = await response.json();
      console.log('PaymentIntentId:', paymentIntentId);

      if (paymentIntentId) {
        try {
          console.log('Registering payment with backend API...');
          const token = await getToken();

          const registerResponse = await fetch('https://blugoat-api-310650732642.us-central1.run.app/api/auth/credits/register-payment', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              paymentIntentId,
              amount: selectedPackage.price,
              currency: 'INR',
              expectedCredits: selectedPackage.credits,
            }),
          });

          if (registerResponse.ok) {
            const data = await registerResponse.json();
            console.log('Payment registered successfully:', data);
          } else {
            console.error('Failed to register payment:', await registerResponse.text());
          }
        } catch (error) {
          console.error('Error registering payment with backend:', error);
        }
      }

      setClientSecret(clientSecret);
      setIsLoading(false);
    } catch (err) {
      console.error('Payment setup error:', err);
      setError(`Payment setup failed: ${err.message}`);
      setIsLoading(false);
    }
  };

  // Proceed to payment step
  const handleProceedToPayment = () => {
    setIsLoading(true);
    createPaymentIntent().then(() => {
      setStep('payment');
    });
  };

  // Go back to selection step
  const handleBackToSelection = () => {
    setStep('select');
  };

  // Check for payment success from redirect
  useEffect(() => {
    const paymentSuccess = localStorage.getItem('payment_success');
    if (paymentSuccess) {
      try {
        const { paymentIntentId, timestamp } = JSON.parse(paymentSuccess);
        // Only use recent payments (within last 5 minutes)
        if (Date.now() - timestamp < 5 * 60 * 1000) {
          handleStripePaymentSuccess(paymentIntentId);
          localStorage.removeItem('payment_success');
        }
      } catch (e) {
        localStorage.removeItem('payment_success');
      }
    }
  }, [onSuccess]);

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>, stripe: any, elements: any) => {
    event.preventDefault();
    if (!stripe || !elements) {
      console.error('Stripe not initialized, cannot process payment');
      return;
    }

    console.log('Processing payment for', selectedPackage.credits, 'credits');
    setPaymentStatus('processing');

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/payment-success?credits=${selectedPackage.credits}`,
        payment_method_data: {
          billing_details: {
            name: 'Test Customer',
            email: 'customer@example.com',
            address: {
              line1: '123 Test Street',
              city: 'Mumbai',
              state: 'Maharashtra',
              postal_code: '400001',
              country: 'IN', // Country code for India
            },
          },
        },
      },
    });

    if (error) {
      console.error('Payment confirmation error:', error);
      setPaymentStatus('error');
      setError(error.message || 'Payment failed');
    } else {
      console.log('Payment completed');
      setPaymentStatus('success');
      handleStripePaymentSuccess(undefined);
    }
  };

  const getElementsOptions = (): any => {
    if (clientSecret) {
      return {
        clientSecret,
        appearance,
      };
    }

    // Basic fallback options for testing
    return {
      mode: 'payment',
      amount: selectedPackage.price,
      currency: 'inr',
      payment_method_types: ['card'],
      appearance,
      testMode: true,
    };
  };

  type RadioDebugGroupProps = {
    value: string;
    onValueChange: (value: string) => void;
    className?: string;
    children: React.ReactNode;
  };

  const RadioDebugGroup: React.FC<RadioDebugGroupProps> = ({ value, onValueChange, className, children }) => {
    console.log('Current selected value:', value);

    return (
      <div className={cn('grid gap-2', className)}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              checked: child.props.value === value,
              onChange: () => onValueChange(child.props.value),
            } as any);
          }
          return child;
        })}
      </div>
    );
  };

  const handleStripePaymentSuccess = async (paymentIntentId: string) => {
    // Log the successful transaction
    // Pass the transaction ID to the parent component via onSuccess
    onSuccess(paymentIntentId);
  };

  return (
    <div className="relative overflow-hidden bg-white p-1 md:p-4">
      <AnimatePresence mode="wait">
        {step === 'select' ? (
          <motion.div
            key="select-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg p-4"
          >
            <DialogTitle className="mb-6 text-center text-xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Top Up Your Credits
              </span>
            </DialogTitle>

            <div className="mb-6 overflow-hidden rounded-lg bg-blue-50 p-4">
              <div className="flex items-start space-x-3">
                <Info className="mt-0.5 size-5 shrink-0 text-blue-500" />
                <div>
                  <h3 className="font-medium text-blue-800">How credits work</h3>
                  <p className="text-sm text-blue-700">
                    Each credit lets you access one contact's details. Purchase credits in bulk for better value.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <RadioDebugGroup
                value={selectedPackage.id}
                onValueChange={(value) => {
                  const pkg = CREDIT_PACKAGES.find(p => p.id === value);
                  if (pkg) {
                    setSelectedPackage(pkg);
                  }
                }}
                className="grid grid-cols-2 gap-3 md:grid-cols-3"
              >
                {CREDIT_PACKAGES.map((pkg) => {
                  const color = pkg.color as keyof typeof packageColors;
                  const isSelected = selectedPackage.id === pkg.id;

                  return (
                    <label
                      key={pkg.id}
                      htmlFor={pkg.id}
                      onClick={() => {
                        console.log('Selecting package:', pkg.id);
                        setSelectedPackage(pkg);
                      }}
                      className={`relative flex cursor-pointer overflow-hidden rounded-xl border p-3 transition-all duration-200 ${
                        isSelected
                          ? `border-2 border-blue-300 bg-blue-100 shadow-blue-100`
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <RadioGroupItem value={pkg.id} id={pkg.id} className="sr-only" />
                      <div className="flex w-full flex-col">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              ₹
                              {(pkg.price / 100).toLocaleString()}
                            </p>
                          </div>
                          {isSelected && (
                            <motion.span
                              initial={{ opacity: 0, scale: 0.5 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="whitespace-nowrap rounded-full bg-blue-500 px-2 py-0.5 text-xs text-white"
                            >
                              Selected
                            </motion.span>
                          )}
                        </div>

                        <p className="mt-1 text-sm font-medium text-blue-600">
                          {pkg.credits}
                          {' '}
                          Credits
                        </p>

                        <div className="mt-2 text-xs text-gray-500">
                          Access up to
                          {' '}
                          {pkg.contacts}
                          {' '}
                          contacts
                        </div>

                        <div className="mt-2 text-xs text-gray-500">
                          (₹
                          {(pkg.price / 100 / pkg.credits).toFixed(2)}
                          /credit)
                        </div>
                      </div>
                    </label>
                  );
                })}
              </RadioDebugGroup>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleProceedToPayment}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg"
              >
                Continue to Payment
                <ArrowRight className="size-4" />
              </motion.button>
              <button
                onClick={onClose}
                className="text-sm text-gray-600 transition-colors hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="payment-step"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-lg p-4"
          >
            <div className="mb-4 flex items-center">
              <button
                onClick={handleBackToSelection}
                className="mr-2 rounded-full p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <DialogTitle className="text-xl font-bold">Payment Details</DialogTitle>
            </div>

            {/* Payment form */}
            {error
              ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 flex items-start gap-3 rounded-md bg-red-50 p-4 text-red-700"
                  >
                    <AlertCircle className="mt-0.5 size-5 shrink-0" />
                    <div>
                      <p className="font-medium">Payment Error</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </motion.div>
                )
              : isLoading
                ? (
                    <div className="my-12 flex flex-col items-center justify-center py-8 text-center">
                      <div className="mb-4 size-12 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                      <p className="text-gray-600">Initializing payment...</p>
                    </div>
                  )
                : (
                    <>
                      <div className="mb-6 overflow-hidden rounded-lg bg-blue-50 p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CreditCard className="size-5 text-blue-600" />
                            <span className="font-medium text-blue-800">Payment Summary</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              Total:
                              {' '}
                              <span className="font-bold text-gray-900">
                                ₹
                                {(selectedPackage.price / 100).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-2 rounded-md bg-white/50 p-3">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">
                              {selectedPackage.credits}
                              {' '}
                              Credits Package
                            </span>
                            <span>
                              ₹
                              {(selectedPackage.price / 100).toLocaleString()}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            Unlock
                            {' '}
                            {selectedPackage.contacts}
                            {' '}
                            contacts at ₹2 per contact
                          </div>
                        </div>
                      </div>

                      <Elements stripe={stripePromise} options={getElementsOptions()}>
                        <CheckoutForm
                          packageDetails={selectedPackage}
                          onSuccess={onSuccess}
                          onClose={onClose}
                          handleSubmit={handleSubmit}
                        />
                      </Elements>
                    </>
                  )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Inner checkout form
function CheckoutForm({
  packageDetails,
  handleSubmit,
}: {
  packageDetails: typeof CREDIT_PACKAGES[0];
  onSuccess: (transactionId?: string) => void;
  onClose: () => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>, stripe: any, elements: any) => Promise<void>;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  return (
    <form
      onSubmit={(e) => {
        setIsProcessing(true);
        handleSubmit(e, stripe, elements).finally(() => {
          setIsProcessing(false);
        });
      }}
    >
      <div className="mb-6 space-y-6">
        <PaymentElement className="rounded-lg" />

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md bg-red-50 p-3 text-sm text-red-600"
          >
            {errorMessage}
          </motion.div>
        )}
      </div>

      <div className="space-y-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!stripe || isProcessing}
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg disabled:opacity-70"
        >
          {isProcessing
            ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Processing...
                </>
              )
            : (
                <>
                  <Lock className="size-4" />
                  Pay ₹
                  {(packageDetails.price / 100).toLocaleString()}
                </>
              )}
        </motion.button>

        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          Secure payment via Stripe
        </div>
      </div>
    </form>
  );
}
