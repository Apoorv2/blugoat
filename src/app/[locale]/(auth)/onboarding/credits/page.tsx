'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CreditAnimation } from '@/components/CreditAnimation';

const CreditsOnboardingPage = (props: { params: { locale: string } }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [showAnimation, setShowAnimation] = useState(true);

  // Debug logging
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('===== Credits Page Debug Info =====');
      console.log('Full URL:', window.location.href);
      console.log('Query params:', window.location.search);
      console.log('Has seen credits (localStorage):', localStorage.getItem('has_seen_credits'));
      console.log('User authenticated:', !!user);
      console.log('Auth loaded:', isLoaded);
    }
  }, [user, isLoaded]);

  // Handle animation state
  useEffect(() => {
    // Wait for authentication to load
    if (!isLoaded) {
      return;
    }

    // If coming directly from signup, always show the animation
    const fromSignup = window.location.search.includes('from_signup=true');
    const hasSeenCredits = localStorage.getItem('has_seen_credits') === 'true';
    const isDebugging = window.location.search.includes('debug=true');

    console.log('Decision factors:', { hasSeenCredits, isDebugging, fromSignup });

    // Only redirect if user has seen credits AND is not coming from signup AND is not debugging
    if (hasSeenCredits && !fromSignup && !isDebugging) {
      console.log('User has already seen credits, redirecting to dashboard');
      router.push(`/${props.params.locale}/dashboard`);
      return;
    }

    // First-time or debugging users see the animation
    console.log('Showing credit animation to user');
    setShowAnimation(true);
  }, [isLoaded, props.params.locale, router]);

  const handleAnimationComplete = () => {
    localStorage.setItem('has_seen_credits', 'true');

    const redirectPath = `/${props.params.locale}/lead-query?bypass_org_check=true`;
    console.log('Animation complete, redirecting to:', redirectPath);

    window.location.href = redirectPath;
  };

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {showAnimation
        ? (
            <CreditAnimation
              onComplete={handleAnimationComplete}
              redirectUrl={null}
            />
          )
        : (
            <div className="p-8 text-center">
              <h2 className="mb-4 text-xl font-bold">Loading...</h2>
              <p>Please wait while we prepare your account.</p>
            </div>
          )}
    </div>
  );
};

export default CreditsOnboardingPage;
