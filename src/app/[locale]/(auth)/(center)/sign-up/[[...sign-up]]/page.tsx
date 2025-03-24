'use client';

import { SignUp, useSignUp } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignUpPage(props: { params: { locale: string } }) {
  const { isLoaded, signUp } = useSignUp();
  const { locale } = props.params;

  // Handle redirect after successful sign-up
  useEffect(() => {
    if (isLoaded && signUp?.status === 'complete') {
      console.log('Sign-up complete, redirecting to credits page...');

      // Clear any previous flag
      localStorage.removeItem('has_seen_credits');

      // Force redirect with window.location for more reliable redirect
      const redirectUrl = `/${locale}/onboarding/credits?bypass_org_check=true&from_signup=true`;
      window.location.href = redirectUrl;
    }
  }, [isLoaded, signUp, locale]);

  return (
    <div className="p-8">
      <SignUp
        redirectUrl={`/${locale}/onboarding/credits?bypass_org_check=true&from_signup=true`}
        afterSignUpUrl={`/${locale}/onboarding/credits?bypass_org_check=true&from_signup=true`}
      />
    </div>
  );
}
