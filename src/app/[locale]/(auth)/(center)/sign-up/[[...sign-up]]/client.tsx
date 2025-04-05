'use client';

import { SignUp } from '@clerk/nextjs';

export function SignUpClient({ locale }: { locale: string }) {
  return (
    <div className="p-8">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl={`/${locale}/sign-in`}
        redirectUrl={`/${locale}/lead-query`}
      />
    </div>
  );
}
