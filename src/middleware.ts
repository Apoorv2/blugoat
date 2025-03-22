import { clerkMiddleware } from '@clerk/nextjs/server';
import {
  type NextFetchEvent,
  type NextRequest,
  NextResponse,
} from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

export default function middleware(
  req: NextRequest,
  evt: NextFetchEvent,
) {
  // Skip authentication for static assets
  const path = req.nextUrl.pathname;
  if (path.startsWith('/_next') || path.includes('/api/webhook')) {
    return;
  }

  // Public routes that don't need auth
  if (path === '/'
    || path.includes('/sign-in')
    || path.includes('/sign-up')
    || AllLocales.some(locale => path === `/${locale}`
      || path.includes(`/${locale}/sign-in`)
      || path.includes(`/${locale}/sign-up`))) {
    return intlMiddleware(req);
  }

  return clerkMiddleware((auth, req) => {
    const { userId, orgId } = auth();

    if (userId && !orgId && req.nextUrl.pathname.includes('/dashboard')) {
      const url = new URL('/onboarding/organization-selection', req.url);
      return NextResponse.redirect(url);
    }

    return intlMiddleware(req);
  })(req, evt);
}

export const config = {
  matcher: ['/((?!.*\\..*|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
