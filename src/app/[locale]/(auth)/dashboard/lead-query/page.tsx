/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable style/multiline-ternary */
/* eslint-disable no-console */
'use client';

import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, MailSearch, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
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

const LeadQueryResultsPage = (props: { params: { locale: string } }) => {
  const { locale } = props.params;
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasResults, setHasResults] = useState(false);

  useEffect(() => {
    // Get the results from localStorage
    const storedResults = localStorage.getItem('lead-query-results');
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        setResults(parsedResults);
        // Check if there are any items in the results
        setHasResults(parsedResults.items?.length > 0);
      } catch (e) {
        console.error('Error parsing stored results', e);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="container py-10">
        <Card>
          <CardHeader>
            <CardTitle>No Query Results</CardTitle>
            <CardDescription>You haven't run any lead queries yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-500">
              To find leads, go to the lead query page and run a search.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href={`/${locale}/lead-query`}>Create Lead Query</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lead Query Results</CardTitle>
              <CardDescription>
                Results for your query:
                {' '}
                {results.query || 'Custom search'}
              </CardDescription>
            </div>
            <Button asChild variant="outline">
              <Link href={`/${locale}/lead-query`}>New Query</Link>
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {hasResults ? (
            <div className="space-y-6">
              {/* Your existing results display code */}
              <p>
                Found
                {results.items?.length || 0}
                {' '}
                potential leads matching your criteria.
              </p>

              {/* Results table or list would go here */}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="flex flex-col items-center justify-center py-10">
                <div className="mb-6 rounded-full bg-blue-50 p-6">
                  <MailSearch className="size-12 text-blue-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">We've Received Your Request</h3>
                <p className="mb-4 max-w-md text-center text-gray-600">
                  We couldn't find immediate matches for your query, but our system is still searching.
                  We'll notify you when we find leads matching your criteria.
                </p>

                <div className="mb-8 w-full max-w-md">
                  <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="size-4 text-amber-600" />
                    <AlertTitle className="text-amber-800">Your query is being processed</AlertTitle>
                    <AlertDescription className="text-amber-700">
                      Complex queries may take some time as we search through our extensive database.
                    </AlertDescription>
                  </Alert>
                </div>

                <div className="w-full max-w-md space-y-4">
                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-5 text-green-500" />
                      <div>
                        <h4 className="font-medium">Query Received</h4>
                        <p className="text-sm text-gray-600">We've logged your search request</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-5 items-center justify-center">
                        <div className="size-3 animate-pulse rounded-full bg-blue-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">Searching in Progress</h4>
                        <p className="text-sm text-gray-600">Our system is scouring the web for matches</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg border border-gray-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <Search className="size-5 text-gray-400" />
                      <div>
                        <h4 className="font-medium">Results Coming Soon</h4>
                        <p className="text-sm text-gray-600">You'll be notified when leads are found</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
          <Button variant="outline" asChild>
            <Link href={`/${locale}/dashboard`}>Back to Dashboard</Link>
          </Button>

          {hasResults && (
            <Button className="bg-blue-600 hover:bg-blue-700">
              Export Results
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
