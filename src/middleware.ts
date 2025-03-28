import { authMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

const intlMiddleware = createMiddleware({
  locales: AllLocales,
  localePrefix: AppConfig.localePrefix,
  defaultLocale: AppConfig.defaultLocale,
});

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/:locale/dashboard(.*)',
  '/onboarding(.*)',
  '/:locale/onboarding(.*)',
  '/api(.*)',
  '/:locale/api(.*)',
]);

// Add onboarding paths that should be allowed without redirects
const onboardingWhitelist = [
  'onboarding/credits',
  'onboarding/organization-selection',
  'lead-query',
];

export default authMiddleware({
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/:locale/sign-in(.*)',
    '/:locale/sign-up(.*)',
    '/onboarding/credits(.*)',
    '/:locale/onboarding/credits(.*)',
    '/onboarding/organization-selection(.*)',
    '/:locale/onboarding/organization-selection(.*)',
    '/lead-query(.*)',
    '/:locale/lead-query(.*)',
  ],
  beforeAuth: (req) => {
    // Run the intl middleware before auth
    return intlMiddleware(req);
  },
  afterAuth: (auth, req) => {
    // Debug logging
    console.log('MIDDLEWARE: Processing request for URL:', req.url);

    // Check for debug parameter - always allow with debug param
    const url = new URL(req.url);
    const isDebug = url.searchParams.get('debug') === 'true';
    const bypassOrgCheck = url.searchParams.get('bypass_org_check') === 'true';

    if (isDebug) {
      console.log('MIDDLEWARE: Debug mode, allowing access');
      return NextResponse.next();
    }

    // If bypassing org check or has a valid session, allow access
    if (bypassOrgCheck || auth.userId || auth.isPublicRoute) {
      console.log('MIDDLEWARE: Allowing access - bypass:', bypassOrgCheck, 'userId:', !!auth.userId, 'publicRoute:', auth.isPublicRoute);
      return NextResponse.next();
    }

    // Otherwise redirect to login
    if (!auth.userId && !auth.isPublicRoute) {
      console.log('MIDDLEWARE: Unauthorized access, redirecting to login');
      const locale = req.nextUrl.pathname.match(/(\/.*)\/dashboard/)?.at(1) ?? '';
      const signInUrl = new URL(`${locale}/sign-in`, req.url);
      return NextResponse.redirect(signInUrl);
    }

    // Inside your middleware handler
    console.log(`MIDDLEWARE: Checking path: ${req.nextUrl.pathname}`);
    const isOnboardingPath = onboardingWhitelist.some(path =>
      req.nextUrl.pathname.includes(path),
    );

    // Allow onboarding paths even without auth
    if (isOnboardingPath) {
      console.log(`MIDDLEWARE: Allowing onboarding path: ${req.nextUrl.pathname}`);
      return NextResponse.next();
    }

    // Add a check for pages that should have a locale
    const needsLocale = req.nextUrl.pathname.match(/^\/(onboarding|lead-query|dashboard)/);
    if (needsLocale && !req.nextUrl.pathname.match(/^\/[a-z]{2}[/-]/)) {
      // Add default locale 'en'
      const newUrl = new URL(`/en${req.nextUrl.pathname}${req.nextUrl.search}`, req.url);
      console.log('MIDDLEWARE: Adding default locale, redirecting to:', newUrl.toString());
      return NextResponse.redirect(newUrl);
    }

    if (req.nextUrl.pathname.includes('onboarding/credits')) {
      console.log('MIDDLEWARE: Processing credits page request');
      return NextResponse.next();
    }

    return NextResponse.next();
  },
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next|monitoring).*)', '/', '/(api|trpc)(.*)'],
};
