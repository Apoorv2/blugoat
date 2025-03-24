'use client';

import { CreateOrganization, OrganizationProfile, useOrganization } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TitleBar } from '@/features/dashboard/TitleBar';
import { getI18nPath } from '@/utils/Helpers';

const OrganizationProfilePage = (props: { params: { locale: string } }) => {
  const t = useTranslations('OrganizationProfile');
  const { organization, isLoaded } = useOrganization();
  const router = useRouter();
  const [showCreateOrg, setShowCreateOrg] = useState(false);

  // For development - handle case with no organization
  const isDevelopment = process.env.NODE_ENV === 'development';

  const handleCreateOrg = () => {
    setShowCreateOrg(true);
  };

  const handleBackToDashboard = () => {
    router.push(`/${props.params.locale}/dashboard?bypass_org_check=true`);
  };

  // Development fallback when no organization exists
  if (isDevelopment && isLoaded && !organization) {
    return (
      <>
        <TitleBar
          title={t('title_bar')}
          description={t('title_bar_description')}
        />

        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle>Organization Required</CardTitle>
            <CardDescription>
              You need to create an organization to view this page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-md bg-blue-50 p-4 text-blue-800">
              <p className="text-sm">
                This page requires an organization to function properly.
                You can create an organization below or return to the dashboard.
              </p>
            </div>

            {showCreateOrg
              ? (
                  <CreateOrganization
                    afterCreateOrganizationUrl={`/${props.params.locale}/dashboard/organization-profile`}
                  />
                )
              : (
                  <div className="flex justify-between">
                    <Button
                      onClick={handleBackToDashboard}
                      variant="outline"
                    >
                      Back to Dashboard
                    </Button>
                    <Button
                      onClick={handleCreateOrg}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Create an Organization
                    </Button>
                  </div>
                )}
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <OrganizationProfile
        routing="path"
        path={getI18nPath(
          '/dashboard/organization-profile',
          props.params.locale,
        )}
        afterLeaveOrganizationUrl="/onboarding/organization-selection"
        appearance={{
          elements: {
            rootBox: 'w-full',
            cardBox: 'w-full flex',
          },
        }}
      />
    </>
  );
};

export default OrganizationProfilePage;
