'use client';

import { OrganizationList, useOrganization, useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const OnboardingPage = (props: { params: { locale: string } }) => {
  // const router = useRouter();
  useUser();
  useOrganization();
  const { locale } = props.params;

  // const [showCreditAnimation, setShowCreditAnimation] = useState(true);

  // Handle animation completion - redirect to lead query page
  // const handleAnimationComplete = () => {
  //   router.push(`/${locale}/dashboard`);
  // };

  // Set cookie to remember that user has seen org selection
  useEffect(() => {
    // Set a cookie to remember the user has seen the org selection page
    document.cookie = 'has_seen_org_selection=true; path=/; max-age=31536000; SameSite=Lax';
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
      <Card className="mx-auto w-full max-w-3xl rounded-xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="mb-2 text-3xl font-bold text-blue-700">Organization Setup</CardTitle>
          <CardDescription className="text-lg text-blue-500">
            Create or join an organization to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 px-4 py-2 text-center text-sm text-gray-600">
            <p>
              Organizations allow you to collaborate with team members and share lead data.
              You can create a new organization or accept an invitation to join an existing one.
            </p>
          </div>

          <OrganizationList
            hidePersonal
            afterSelectOrganizationUrl={`/${locale}/dashboard`}
            afterCreateOrganizationUrl={`/${locale}/dashboard`}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingPage;
