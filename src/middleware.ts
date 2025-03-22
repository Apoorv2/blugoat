import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';

import { AllLocales, AppConfig } from './utils/AppConfig';

// Create internationalization middleware
const intlMiddleware = createIntlMiddleware({
  locales: AllLocales,
  defaultLocale: AppConfig.defaultLocale,
  localePrefix: AppConfig.localePrefix,
});

// Explicitly define public routes - ensure exact matching
const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-in/(.*)', // Handle both the route and subpaths
  '/sign-up',
  '/sign-up/(.*)',
  '/en',
  '/fr',
  '/en/sign-in',
  '/en/sign-in/(.*)',
  '/fr/sign-in',
  '/fr/sign-in/(.*)',
  '/en/sign-up',
  '/en/sign-up/(.*)',
  '/fr/sign-up',
  '/fr/sign-up/(.*)',
];

// Create a route matcher for public paths
const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware((auth, req) => {
  // Check if this is a public path
  if (isPublicRoute(req)) {
    return intlMiddleware(req);
  }
  // For authenticated routes
  const { userId, orgId } = auth();
  // Organization selection flow
  if (userId && !orgId && req.nextUrl.pathname.includes('/dashboard')
    && !req.nextUrl.pathname.endsWith('/organization-selection')) {
    const orgSelection = new URL('/onboarding/organization-selection', req.url);
    return NextResponse.redirect(orgSelection);
  }
  return intlMiddleware(req);
});

// This is critical - ensure the matcher includes ALL routes
export const config = {
  matcher: ['/((?!api/webhook|_next/static|_next/image|favicon.ico).*)'],
};
