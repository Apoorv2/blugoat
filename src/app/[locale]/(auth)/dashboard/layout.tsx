'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { DashboardHeader } from '@/features/dashboard/DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const params = useParams();
  const locale = params.locale as string;

  return (
    <>
      <div className="shadow-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-3 py-4">
          <DashboardHeader
            menu={[
              {
                href: '/dashboard',
                label: t('home'),
              },
              {
                href: `/${locale}/lead-query`,
                label: t('lead_query'),
              },
              {
                href: '/dashboard/user-profile',
                label: t('profile'),
              },
            ]}
          />
        </div>
      </div>

      <div className="min-h-[calc(100vh-72px)] bg-muted">
        <div className="mx-auto max-w-screen-xl px-3 pb-16 pt-6">
          {children}
        </div>
      </div>
    </>
  );
}

export const dynamic = 'force-dynamic';
