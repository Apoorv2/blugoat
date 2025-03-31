'use client';

import { SignIn } from '@clerk/nextjs';

export function SignInClient({ locale }: { locale: string }) {
  return (
    <div className="p-8">
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl={`/${locale}/sign-up`}
        redirectUrl={`/${locale}/dashboard?bypass_org_check=true`}
      />
    </div>
  );
}
