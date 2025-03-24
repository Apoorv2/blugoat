'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type CreditAnimationProps = {
  onComplete: () => void;
  _redirectUrl?: string | null;
};

export const CreditAnimation = ({ onComplete, _redirectUrl }: CreditAnimationProps) => {
  const [count, setCount] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const targetCredits = 100;

  useEffect(() => {
    console.log('Credit animation mounted');
    return () => console.log('Credit animation unmounted');
  }, []);

  useEffect(() => {
    if (count < targetCredits) {
      const timer = setTimeout(() => {
        setCount((prev) => {
          const increment = Math.ceil((targetCredits - prev) / 5);
          return Math.min(prev + increment, targetCredits);
        });
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setIsComplete(true);
        console.log('Animation sequence complete');

        // Auto-redirect after 5 seconds if button isn't clicked
        const redirectTimer = setTimeout(() => {
          console.log('Auto-redirect initiated');
          handleButtonClick();
        }, 5000);
        return () => clearTimeout(redirectTimer);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [count]);

  const handleButtonClick = () => {
    // Make sure locale is included in all redirects
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <Card
          className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        >
          <motion.div
            className="flex flex-col items-center justify-center space-y-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-3xl font-bold text-transparent">
              Welcome to bluGoat AI
            </h2>

            <div className="relative flex size-40 items-center justify-center rounded-full bg-gray-100">
              <motion.div
                className="absolute inset-0 rounded-full"
                initial={{ scale: 0 }}
                animate={{
                  scale: count / targetCredits,
                }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'linear-gradient(to right, rgb(99, 102, 241), rgb(168, 85, 247), rgb(219, 39, 119))',
                  opacity: 0.7,
                }}
              />
              <motion.div
                className="relative z-10 flex flex-col items-center space-y-1"
              >
                <span className="text-sm font-medium text-gray-700">Your Credits</span>
                <motion.span
                  className="text-4xl font-bold text-black"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {count}
                </motion.span>
              </motion.div>
            </div>

            <p className="text-gray-700">
              {isComplete
                ? 'You\'re all set! Let\'s find your perfect leads.'
                : 'We\'re setting up your account with free credits to get started.'}
            </p>

            <Button
              className={`mt-4 w-full transition-all duration-300 ${
                isComplete
                  ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90'
                  : 'bg-gray-200 text-gray-400'
              }`}
              onClick={handleButtonClick}
              disabled={!isComplete}
              type="button"
            >
              {isComplete ? 'Start Exploring' : 'Setting up...'}
            </Button>
          </motion.div>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
