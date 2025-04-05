/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-console */
'use client';

import { SignUp, useSignUp } from '@clerk/nextjs';
import { useEffect } from 'react';

export default function SignUpPage(props: { params: { locale: string } }) {
  const { isLoaded, signUp } = useSignUp();
  const { locale } = props.params;

  // Define our URLs
  const creditsUrl = `/${locale}/lead-query`;
  const dashboardUrl = `/${locale}/dashboard?bypass_org_check=true`;

  // Handle redirect after successful sign-up
  useEffect(() => {
    if (isLoaded && signUp?.status === 'complete') {
      // Just redirect to credits - the credits page will determine
      // if the user should see credits or go to dashboard
      console.log(`Sign-up complete, redirecting to credits flow`);
      window.location.href = creditsUrl;
    }
  }, [isLoaded, signUp, creditsUrl]);

  return (
    <div className="p-8">
      <SignUp
        path="/sign-up"
        afterSignUpUrl="/lead-query"
        signInUrl={`/${locale}/sign-in`}
        redirectUrl="/lead-query"
      />
    </div>
  );
}
