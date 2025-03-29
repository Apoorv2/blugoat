/* eslint-disable no-console */
'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { PreferencesForm } from '@/features/dashboard/PreferencesForm';
import { TitleBar } from '@/features/dashboard/TitleBar';

export default function LeadQueryPage({ params }: { params: { locale: string } }) {
  const t = useTranslations('LeadQuery');
  const router = useRouter();
  const [initialData, setInitialData] = useState<any>(null);

  // Load any existing preferences from localStorage
  useEffect(() => {
    // Log that we've reached the lead query page
    console.log('Lead Query page loaded');

    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboarding-data');
      if (storedData) {
        setInitialData(JSON.parse(storedData));
      }
    }
  }, []);

  const handleSubmit = (data: any) => {
    // Save preferences to localStorage
    localStorage.setItem('onboarding-data', JSON.stringify(data));

    // Redirect back to dashboard with updated preferences
    router.push(`/${params.locale}/dashboard`);
  };

  const handleCancel = () => {
    router.push(`/${params.locale}/dashboard`);
  };

  const handleSkip = () => {
    localStorage.setItem('preferences_skipped', 'true');
    router.push(`/${params.locale}/dashboard`);
  };

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="mx-auto max-w-4xl">
        <PreferencesForm
          initialData={initialData}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          onSkip={handleSkip}
        />
      </div>
    </>
  );
}
