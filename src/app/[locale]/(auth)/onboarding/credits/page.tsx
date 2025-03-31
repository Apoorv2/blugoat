/* eslint-disable no-console */
'use client';

import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { CreditAnimation } from '@/components/CreditAnimation';

const CreditsOnboardingPage = (props: { params: { locale: string } }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { locale } = props.params;
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const [hasShownAnimation, setHasShownAnimation] = useState(false);

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

  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has completed onboarding before
      const hasCompletedOnboarding = user.unsafeMetadata?.hasCompletedOnboarding;

      if (hasCompletedOnboarding) {
        // Skip credits and go directly to dashboard for returning users
        console.log('User has already completed onboarding, redirecting to dashboard');
        router.push(`/${locale}/dashboard?bypass_org_check=true`);
        return;
      }

      // Check if user was created recently (within the last 1 minute only)
      const userCreationTime = new Date(user.createdAt).getTime();
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - userCreationTime;

      // Restrict to accounts created in the last minute only
      const isNewUser = timeDifference < 1000 * 60; // 1 minute

      // If not a new user and hasn't completed onboarding, mark as completed and redirect
      if (!isNewUser && !hasCompletedOnboarding) {
        console.log('Existing user without onboarding flag, setting flag and redirecting');
        // Set the flag and redirect to dashboard
        user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            hasCompletedOnboarding: true,
          },
        }).then(() => {
          router.push(`/${locale}/dashboard?bypass_org_check=true`);
        });
        return;
      }

      // Rest of your existing code for new users
      setIsFirstTimeUser(isNewUser);

      // Update public metadata only for new users
      if (isNewUser) {
        const updateUserMetadata = async () => {
          try {
            await user.update({
              unsafeMetadata: {
                ...user.unsafeMetadata,
                hasCompletedOnboarding: true,
              },
            });
          } catch (error) {
            console.error('Failed to update user metadata:', error);
          }
        };

        updateUserMetadata();
      }
    }
  }, [isLoaded, user, router, locale]);

  // Show animation for first-time users who haven't seen it yet
  const shouldShowAnimation = isFirstTimeUser && !hasShownAnimation;

  const handleAnimationComplete = () => {
    setHasShownAnimation(true);

    // Add redirection after animation completes
    const redirectPath = `/${locale}/lead-query?bypass_org_check=true`;
    console.log('Animation complete, redirecting to:', redirectPath);
    router.push(redirectPath);
  };

  useEffect(() => {
    const markOnboardingComplete = async () => {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            hasCompletedOnboarding: true,
          },
        });
      }
    };

    // Call this when onboarding is complete
    if (shouldShowAnimation) {
      markOnboardingComplete();
    }
  }, [shouldShowAnimation, user]);

  return (
    <div className="flex h-screen w-full items-center justify-center">
      {shouldShowAnimation
        ? (
            <CreditAnimation
              onComplete={handleAnimationComplete}
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
