'use client';

import { SignIn } from '@clerk/nextjs';

export function SignInClient({ locale }: { locale: string }) {
  return (
    <div className="p-8">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl={`/${locale}/sign-up`}
        redirectUrl={`/${locale}/audience-query`}
      />
    </div>
  );
}
