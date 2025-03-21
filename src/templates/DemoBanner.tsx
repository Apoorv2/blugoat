import Link from 'next/link';

import { StickyBanner } from '@/features/landing/StickyBanner';

export const DemoBanner = () => (
  <StickyBanner>
    Try bluGoat Lead Generation Platform -
    {' '}
    <Link href="/sign-up">Explore Our Interactive Demo</Link>
  </StickyBanner>
);
