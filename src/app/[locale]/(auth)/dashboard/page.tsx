/* eslint-disable react-dom/no-missing-button-type */
/* eslint-disable ts/consistent-type-imports */
/* eslint-disable simple-import-sort/imports */
/* eslint-disable style/no-trailing-spaces */
/* eslint-disable style/multiline-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-console */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable unused-imports/no-unused-vars */
'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { MailSearch, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState } from 'react';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { StripePaymentForm } from '@/components/StripePaymentForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogOverlay, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PreferencesForm } from '@/features/dashboard/PreferencesForm';
import { TitleBar } from '@/features/dashboard/TitleBar';

// Add these constants directly in the dashboard page, near the top with other constants
const CONTACT_OPTIONS = [
  { value: '50', label: '50 Audience member' },
  { value: '250', label: '250 Audience member' },
  { value: '500', label: '500 Audience member' },
  { value: '1000', label: '1,000 Audience member' },
  { value: '2500', label: '2,500 Audience member' },
  { value: '5000', label: '5,000 Audience member' },
];

// Update the lead data interface to match the required structure
type Lead = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  city: string;
  state: string;
  industry: string;
};

// Define a type for the API response data
type Contact = {
  type: string;
  value: string;
  isPrimary: boolean;
};

type Tag = {
  id: string;
  name: string;
  category: string;
};

type Company = {
  id: string;
  name: string;
};

type LeadApiData = {
  id: string;
  full_name: string;
  contactInfo: Contact[];
  tags: Tag[];
  companies: Company[];
};

// Update the ApiResponse type to match your actual API response
type ApiResponse = {
  success: boolean;
  data: LeadApiData[];
  meta: {
    totalCount: number;
    previewCount: number;
    estimatedCost: number;
    previouslySeen: number;
    percentComplete: number;
  };
  // These might be missing in your response
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  query?: {
    originalQuery: string;
    expression: string;
    city?: string;
    state?: string;
    industry?: string;
  };
  userSelections?: {
    state: string;
    city: string;
    industry: string[];
  };
};

const EmptyStateNewUser = ({ 
  locale, 
  router,
}: { 
  locale: string; 
  router: AppRouterInstance;
}) => {
  const t = useTranslations('DashboardIndex');

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-blue-200 bg-blue-50/50 p-12 text-center">
      <div className="mb-6 rounded-full bg-blue-100 p-6">
        <SearchIcon className="size-12 text-blue-600" />
      </div>

      <h2 className="mb-3 text-2xl font-bold text-gray-900">Welcome to Your Dashboard!</h2>

      <p className="mb-2 max-w-md text-gray-600">
        This is where you'll see your audience data after running a search.
      </p>

      <p className="mb-6 max-w-md text-gray-600">
        To get started, search for your target audience using location, industry, and other criteria.
      </p>

      <Button
        onClick={() => router.push(`/${locale}/lead-query`)}
        className="bg-blue-600 text-white hover:bg-blue-700"
        size="lg"
      >
        Find Your Audience
        <SearchIcon className="ml-2 size-5" />
      </Button>
    </div>
  );
};

const DashboardPage = ({ params }: { params: { locale: string } }) => {
  const { isLoaded, user } = useUser();
  const { getToken } = useAuth();
  const router = useRouter();
  const { locale } = params;
  const [leads, setLeads] = useState<Lead[]>([
    // Sample data that can be replaced with API data
    {
      id: 'lead-1',
      name: 'Rahul Sharma',
      email: 'r***a@example.com',
      phoneNumber: '+91 98***4210',
      city: 'Mumbai',
      state: 'Maharashtra',
      industry: 'Technology',
    },
    {
      id: 'lead-2',
      name: 'Priya Patel',
      email: 'p***l@example.com',
      phoneNumber: '+91 87***3310',
      city: 'Bangalore',
      state: 'Karnataka',
      industry: 'Healthcare',
    },
    // Add more sample data as needed
  ]);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const t = useTranslations('DashboardIndex');
  const [isLoading, setIsLoading] = useState(true);
  const [usingApiResults, setUsingApiResults] = useState(false);
  const [apiQuery, setApiQuery] = useState('');
  const [totalResults, setTotalResults] = useState(0);
  const [selectedContactCount, setSelectedContactCount] = useState<string>('50');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasEmptyResults, setHasEmptyResults] = useState(false);
  const [userCredits, setUserCredits] = useState(0);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  const [transactionDetails, setTransactionDetails] = useState<{
    transactionId: string;
    count: number;
  }>(null);
  const [isLoadingCreditBalance, setIsLoadingCreditBalance] = useState(false);
  const [hasStoredQuery, setHasStoredQuery] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Load user preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboarding-data');
      if (storedData) {
        setUserPreferences(JSON.parse(storedData));
      }
    }
  }, []);

  // Update the useEffect that processes the lead data
  useEffect(() => {
    if (isLoaded && user) {
      // Add user-specific prefix to all localStorage keys
      const userId = user.id;
      const userSpecificKey = `lead-query-results-${userId}`;
      const hasSeenWelcomeKey = `has_seen_welcome-${userId}`;
      
      const storedResults = localStorage.getItem(userSpecificKey);
      const hasSeenWelcome = localStorage.getItem(hasSeenWelcomeKey);
      
      setIsLoading(true);
      console.log(`Checking results for user ${userId}:`, storedResults ? 'Found data' : 'No data');
      
      // First-time user check
      if (!storedResults && !hasSeenWelcome) {
        console.log('First-time user, showing welcome screen');
        setUsingApiResults(false);
        setHasEmptyResults(true);
        setIsLoading(false);
        return;
      }
      
      // Rest of your existing logic...
      if (storedResults) {
        try {
          const results = JSON.parse(storedResults) as ApiResponse;
          
          // Mark that THIS USER has seen welcome screen
          localStorage.setItem(hasSeenWelcomeKey, 'true');
          
          // Continue with existing code...
          console.log('Parsed results:', results);
          console.log('Has data:', results.data && results.data.length > 0);

          // Always set usingApiResults to true if there are stored results
          setUsingApiResults(true);

          // Check if the results have data
          if (results.success && results.data && results.data.length > 0) {
            // Transform API data to match our Lead type
            const transformedLeads = results.data.map((person) => {
              // Find primary email and phone
              const primaryEmail = person.contactInfo.find(
                contact => contact.type === 'email' && contact.isPrimary,
              )?.value || '';

              const primaryPhone = person.contactInfo.find(
                contact => (contact.type === 'mobile' || contact.type === 'phone') && contact.isPrimary,
              )?.value || '';

              // Use user-selected city and state if available
              let cityName = 'All Cities';
              let stateName = 'All States';

              // If user selected a specific city, use that
              if (results.userSelections?.city) {
                cityName = getCityLabel(results.userSelections.city);
              }

              // If user selected a state, use that
              if (results.userSelections?.state) {
                stateName = results.userSelections.state;
              }

              // // If no user selections, fall back to API-derived data
              // if (!cityName) {
              //   cityName = extractTagValue(person.tags, 'city') || '';
              // }

              // if (!stateName) {
              //   stateName = extractTagValue(person.tags, 'state') || '';
              // }

              return {
                id: person.id,
                name: person.full_name || '',
                email: maskEmail(primaryEmail),
                phoneNumber: maskPhone(primaryPhone),
                city: cityName,
                state: stateName,
                industry: getIndustryFromTags(person.tags),
              };
            });
            console.log('Transformed leads:', transformedLeads.length);
            setLeads(transformedLeads);
            setApiQuery(results.query?.expression || '');
            setTotalResults(results.meta?.totalCount || 0);
            setHasEmptyResults(false); // Results found, don't show empty state
          } else {
            // No results found
            console.log('No results in data');
            setLeads([]);
            setTotalResults(0);
            setHasEmptyResults(true); // Show empty results message
          }
        } catch (error) {
          console.error('Error parsing stored results:', error);
          setLeads([]);
          setHasEmptyResults(true);
        } finally {
          setIsLoading(false);
        }
      }
    }
  }, [isLoaded, user]);

  // Add this right after the first useEffect in the DashboardPage component
  useEffect(() => {
    if (isLoaded && user) {
      // Check if user has completed onboarding
      const hasCompletedOnboarding = user.unsafeMetadata?.hasCompletedOnboarding;
      
      // If new user and hasn't completed onboarding, redirect to credits
      if (!hasCompletedOnboarding) {
        router.push(`/${locale}/onboarding/credits?bypass_org_check=true&from_signup=true`);
      }
      
      // Also fetch credits
      fetchUserCredits();
    }
  }, [isLoaded, user, router, locale]);

  // Add this useEffect to check for stored queries on component load
  useEffect(() => {
    // Check if there are stored query results when the component loads
    const storedResults = localStorage.getItem('lead-query-results');
    setHasStoredQuery(!!storedResults);
  }, []);

  // Add this more robust function to check for stored queries
  const checkForStoredQueries = () => {
    try {
      // Try multiple storage keys and formats for better cross-device compatibility
      const storedResults = localStorage.getItem('lead-query-results');
      const storedQuery = localStorage.getItem('original-query-expression');
      const hasResults = !!storedResults;
      
      console.log('Storage check:', { 
        hasResults, 
        resultsLength: storedResults?.length || 0,
        hasOriginalQuery: !!storedQuery,
      });
      
      // Update state based on what we found
      setHasStoredQuery(hasResults);
      return hasResults;
    } catch (error) {
      // Handle storage access errors (can happen in private browsing or low storage)
      console.error('Error checking stored queries:', error);
      return false;
    }
  };

  // Use the function in both mount and manual check
  useEffect(() => {
    checkForStoredQueries();
    
    // Also add a periodic check in case data is added later
    const intervalId = setInterval(() => {
      checkForStoredQueries();
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  // Handler for redirecting to lead query page
  const handleExploreLeads = () => {
    router.push(`/${locale}/lead-query`);
  };

  // Generate generic leads (for new users)
  const generateGenericLeads = (): Lead[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `lead-${i + 1}`,
      name: getSampleName(i),
      email: maskEmail(getSampleEmail(i)),
      phoneNumber: maskPhone(getSamplePhone()),
      city: getRandomCity() || 'Unknown',
      state: getRandomState() || 'Unknown',
      industry: getRandomIndustry() || 'General',
    }));
  };

  // Generate leads based on preferences
  const generatePreferenceBasedLeads = (preferences: any): Lead[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `lead-${i + 1}`,
      name: getSampleName(i),
      email: maskEmail(getSampleEmail(i)),
      phoneNumber: maskPhone(getSamplePhone()),
      city: preferences.city || getRandomCity() || 'Unknown',
      state: preferences.state || getRandomState() || 'Unknown',
      industry: (preferences.industry ? getIndustryLabel(preferences.industry) : getRandomIndustry()) || 'General',
    }));
  };

  // Handle preferences form submission
  const handlePreferencesSubmit = (data: any) => {
    localStorage.setItem('onboarding-data', JSON.stringify(data));
    setUserPreferences(data);
    setShowPreferencesForm(false);
  };

  // Show preferences form
  const handleShowPreferencesForm = () => {
    setShowPreferencesForm(true);
  };

  // Make the purchase handler more resilient
  const handlePurchase = async () => {
    try {
      setIsPurchasing(true);
      
      // Check for query in multiple storage locations
      const hasLocalQuery = !!localStorage.getItem('lead-query-results');
      const hasSessionQuery = !!sessionStorage.getItem('lead-query-results');
      const queryAvailable = hasLocalQuery || hasSessionQuery;
      
      if (!queryAvailable) {
        // Redirect to search without checking device type
        router.push(`/${locale}/lead-query`);
        return;
      }
      
      // Get the query data from whichever storage has it
      const storedResults = localStorage.getItem('lead-query-results') 
        || sessionStorage.getItem('lead-query-results');
      
      // Continue with your existing purchase logic...
      // Get the stored query from localStorage
      const storedQuery = localStorage.getItem('original-query-expression');

      if (!storedResults) {
        console.error('No query found to purchase');
        return;
      }

      // Use the original query expression if available, otherwise try to extract from results
      let queryExpression = '';

      if (storedQuery) {
        // Use the exact query that was sent to the preview API
        queryExpression = storedQuery;
        console.log('Using original stored query expression:', queryExpression);
      } else {
        const results = JSON.parse(storedResults) as ApiResponse;
        console.log('Parsed stored results:', results);

        // Try to extract from various locations
        if (results.query?.expression) {
          queryExpression = results.query.expression;
        } else if (results.query?.originalQuery) {
          queryExpression = results.query.originalQuery;
        }

        console.log('Extracted expression from results:', queryExpression);
      }

      if (!queryExpression) {
        console.error('No valid query expression found');
        return;
      }

      const payload = {
        expression: queryExpression.trim(),
        count: Number.parseInt(selectedContactCount, 10),
        format: 'json',
        deliveryMethod: 'download',
      };

      console.log('Sending purchase payload:', payload);

      const token = await getToken();
      const response = await fetch('https://blugoat-api-310650732642.us-central1.run.app/api/individuals/purchase', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();

        if (result.success) {
          console.log('Purchase successful:', result);
          // Set transaction details for success message
          setTransactionDetails({
            transactionId: result.data.transactionId,
            count: Number.parseInt(selectedContactCount, 10),
          });
          setPurchaseSuccess(true);

          // Update credits
          fetchUserCredits();
          // Add this line to retrieve the purchased contacts
          await retrievePurchasedContacts(result.data.transactionId);
        } else {
          console.error('Purchase failed:', result.message);
        }
      } else {
        console.error('Purchase request failed');
      }
    } catch (error) {
      console.error('Error during purchase:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  // Add function to retrieve purchased contacts
  const retrievePurchasedContacts = async (transactionId: string) => {
    try {
      const token = await getToken();
      const downloadUrl = `https://blugoat-api-310650732642.us-central1.run.app/api/individuals/results/${transactionId}?email=true&format=csv`;

      // Call API correctly with proper fetch syntax
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        console.log('Successfully retrieved contacts');

        // Open in a new tab for viewing/download
        window.open(downloadUrl, '_blank');

        // Update credits display
        fetchUserCredits();
      } else {
        console.error('Failed to retrieve contacts:', await response.text());
      }
    } catch (error) {
      console.error('Error retrieving purchased contacts:', error);
    }
  };

  // Add a function to fetch the user's credit balance
  const fetchUserCredits = async () => {
    try {
      // Set loading state to true when starting the fetch
      setIsLoadingCreditBalance(true);

      console.log('Fetching user credits balance...');
      const token = await getToken();

      const response = await fetch('https://blugoat-api-310650732642.us-central1.run.app/api/auth/credits/balance', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Credits balance response:', data);
        if (data.success && data.data && typeof data.data.balance === 'number') {
          setUserCredits(data.data.balance);
        } else {
          console.error('Invalid credits balance response format:', data);
        }
      } else {
        console.error('Failed to fetch credits balance:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching credits balance:', error);
    } finally {
      // Always set loading state to false when done
      setIsLoadingCreditBalance(false);
    }
  };

  // Detect mobile devices on mount
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
      setIsMobileDevice(isMobile);
      console.log('Device detection:', { isMobile, userAgent });
    };
    
    checkMobile();
  }, []);

  return (
    <div className="container mx-auto space-y-8 pb-16 pt-8">
      <div className="mb-4 flex items-center justify-between">
        <TitleBar
          title={t('title_bar')}
          description={t('title_bar_description')}
        />

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border bg-white px-4 py-2 shadow-sm">
            <div className="rounded-full bg-blue-50 p-1">
              <div className="size-5 text-blue-500">💎</div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-500">Credits:</span>
              {isLoadingCreditBalance ? (
                <span className="ml-1 inline-flex items-center">
                  <div className="mr-1 size-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                  <span className="font-medium text-gray-500">Loading</span>
                </span>
              ) : (
                <span className="ml-1 font-bold">{userCredits}</span>
              )}
            </div>
          </div>

          <Button
            onClick={() => setShowTopUpModal(true)}
            className="bg-blue-600 text-white hover:bg-blue-700"
            size="sm"
          >
            Top Up
          </Button>
        </div>
      </div>

      {/* Grid layout for side-by-side content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table content - takes up 2/3 of space */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="mb-2">Your Target Audience</CardTitle>
              <CardDescription>
                {hasEmptyResults
                  ? 'No results found for your search audience'
                  : usingApiResults
                    ? `Showing ${leads.length} of ${totalResults} results from your search`
                    : 'Sample audience data based on your preferences'}
              </CardDescription>
            </div>

            <Button
              onClick={handleExploreLeads}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <SearchIcon className="mr-2 size-4" />
              New Search
            </Button>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex h-40 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-2 size-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
                  <p>Loading leads...</p>
                </div>
              </div>
            ) : !usingApiResults && hasEmptyResults ? (
              // This is for new users who haven't searched yet
              <EmptyStateNewUser locale={locale} router={router} />
            ) : hasEmptyResults ? (
              // This is for users who searched but got no results
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="mb-6 rounded-full bg-blue-50 p-6">
                  <MailSearch className="size-12 text-blue-500" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">Sorry, we were not able to find your audience</h3>
                <p className="mb-6 max-w-md text-gray-600">
                  Our system is still working to find matches for your query. We will inform you once we have what you're looking for.
                </p>
                <Button
                  onClick={handleExploreLeads}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Try a New Search
                </Button>
              </div>
            ) : (
              // This is for users with results
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="font-medium">Name</TableHead>
                      <TableHead className="font-medium">Email</TableHead>
                      <TableHead className="font-medium">Phone Number</TableHead>
                      <TableHead className="font-medium">City</TableHead>
                      <TableHead className="font-medium">State</TableHead>
                      <TableHead className="font-medium">Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leads.map(lead => (
                      <TableRow key={lead.id} className="hover:bg-blue-50/30">
                        <TableCell className="font-medium">{lead.name}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {lead.email}
                            <Badge variant="outline" className="ml-1 bg-blue-50 text-xs text-blue-700">Masked</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {lead.phoneNumber}
                            <Badge variant="outline" className="ml-1 bg-blue-50 text-xs text-blue-700">Masked</Badge>
                          </div>
                        </TableCell>
                        <TableCell>{lead.city}</TableCell>
                        <TableCell>{lead.state}</TableCell>
                        <TableCell>{lead.industry}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column content */}
        <div className="flex flex-col gap-6">
          {/* Remove the Credits card and keep only the Purchase section */}
          <Card className="h-fit lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle>Access Complete Audience member</CardTitle>
              <CardDescription>
                You're viewing limited results from your search with masked Audience member information.
              </CardDescription>
            </CardHeader>

            {/* Information about purchase and data delivery */}
            <div className="border-b px-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Credits</p>
                  {isLoadingCreditBalance ? (
                    <div className="flex items-center">
                      <div className="mr-1 size-3 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                      <span className="font-bold text-gray-500">Loading</span>
                    </div>
                  ) : (
                    <p className="text-2xl font-bold">{userCredits}</p>
                  )}
                </div>
                <div className="rounded-full bg-blue-50 p-3">
                  <div className="size-6 text-blue-500">💎</div>
                </div>
              </div>
              <div className="mt-2">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${Math.min(100, (userCredits / 100) * 100)}%` }}
                  >
                  </div>
                </div>
              </div>

              {/* Add Top Up button */}
              <div className="mt-3 text-right">
                <Button
                  onClick={() => setShowTopUpModal(true)}
                  variant="outline"
                  size="sm"
                  className="text-blue-600 hover:bg-blue-50"
                >
                  <span className="mr-1">+</span>
                  {' '}
                  Top Up Credits
                </Button>
              </div>
            </div>

            <CardContent className="space-y-6 pt-6">
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm">
                <h3 className="mb-1 font-semibold text-yellow-800">Access Complete Audience member Details</h3>
                <p className="text-yellow-700">
                  You're viewing limited results from your search with masked Audience member information.
                  Purchase full access to see complete Audience member details for your target audience.
                  Data will be sent to
                  {' '}
                  <span className="font-bold">{user?.primaryEmailAddress?.emailAddress}</span>
                  .
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lead-count">Number of contacts to purchase</Label>
                <Select
                  value={selectedContactCount}
                  onValueChange={value => setSelectedContactCount(value)}
                >
                  <SelectTrigger id="lead-count" className="w-full">
                    <SelectValue placeholder="Select amount" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_OPTIONS.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-900">Credits Required:</div>
                  <div className="text-xl font-bold">
                    {Number.parseInt(selectedContactCount, 10)}
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  1 Audience member = 1 credit
                </div>
              </div>

              <div className="space-y-4">
                {!hasStoredQuery && (
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
                    <div className="flex items-start">
                      <div className="mr-2 mt-0.5">
                        <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p>
                        You need to search for Audience member contacts first. Please go to the 
                        {' '}
                        <button 
                          onClick={() => router.push(`/${locale}/lead-query`)}
                          className="font-medium text-blue-600 underline hover:text-blue-800"
                        >
                          Lead Query
                        </button>
                        {' '}
                        page to search before purchasing.
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePurchase}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700"
                  disabled={selectedContactCount === '0' || isPurchasing || !hasStoredQuery}
                >
                  {isPurchasing ? (
                    <>
                      <div className="mr-2 size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Processing...
                    </>
                  ) : !hasStoredQuery ? (
                    'Search for Audience member First'
                  ) : (
                    'Purchase Audience member'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preferences form modal - don't move this */}
      {showPreferencesForm && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-3xl"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <PreferencesForm
              onSubmit={handlePreferencesSubmit}
              onCancel={() => setShowPreferencesForm(false)}
              onSkip={() => {
                // Just close the modal without saving preferences
                setShowPreferencesForm(false);

                // Optionally set a flag to remind users later
                localStorage.setItem('preferences_skipped', 'true');
              }}
              initialData={userPreferences}
            />
          </motion.div>
        </motion.div>
      )}

      {showPaymentModal && (
        <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
          <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-md">
            <StripePaymentForm
              contactCount={Number.parseInt(selectedContactCount, 10)}
              onSuccess={() => {
                console.log('Payment completed successfully, contacts purchased:', selectedContactCount);
                setShowPaymentModal(false);
                // Show success message and grant access to contacts
              }}
              onClose={() => {
                console.log('Payment modal closed by user');
                setShowPaymentModal(false);
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {showTopUpModal && (
        <Dialog open={showTopUpModal} onOpenChange={setShowTopUpModal}>
          <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-md">
            <DialogTitle className="sr-only">Purchase Credits</DialogTitle>
            <StripePaymentForm
              contactCount={250}
              onSuccess={(transactionId) => {
                console.log('Payment successful with transaction ID:', transactionId);
                // Refresh the credits balance after successful payment
                fetchUserCredits();
                setShowTopUpModal(false);
              }}
              onClose={() => setShowTopUpModal(false)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Purchase Success Message */}
      {purchaseSuccess && (
        <Dialog open={purchaseSuccess} onOpenChange={setPurchaseSuccess}>
          <DialogOverlay className="bg-black/40 backdrop-blur-sm" />
          <DialogContent className="sm:max-w-md">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex size-20 items-center justify-center rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <DialogTitle className="text-xl font-bold text-gray-900">Purchase Successful!</DialogTitle>

              <div className="my-4 text-gray-600">
                <p className="mb-3">
                  Your
                  {' '}
                  {transactionDetails?.count}
                  {' '}
                  contacts have been purchased successfully and will be delivered to your email shortly.
                </p>
                <p className="text-sm text-gray-500">
                  Please check your inbox and spam folder. The email will contain a CSV file with all contact details.
                </p>
              </div>

              <div className="mt-2 rounded-md bg-gray-50 p-3 text-sm">
                <span className="font-medium">Transaction ID: </span>
                <span className="font-mono text-xs">{transactionDetails?.transactionId}</span>
              </div>

              <Button
                onClick={() => setPurchaseSuccess(false)}
                className="mt-6 w-full bg-blue-600 text-white hover:bg-blue-700"
              >
                Return to Dashboard
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DashboardPage;

// Utility functions for getting labels
function getStateLabel(stateId?: string): string {
  if (!stateId) {
    return '';
  }
  const stateMap: Record<string, string> = {
    maharashtra: 'Maharashtra',
    karnataka: 'Karnataka',
    tamil_nadu: 'Tamil Nadu',
    telangana: 'Telangana',
    delhi: 'Delhi',
    west_bengal: 'West Bengal',
    gujarat: 'Gujarat',
    uttar_pradesh: 'Uttar Pradesh',
  };
  return stateMap[stateId] || stateId;
}

function getCityLabel(cityId?: string): string {
  if (!cityId) {
    return '';
  }
  const cityMap: Record<string, string> = {
    mumbai: 'Mumbai',
    pune: 'Pune',
    bengaluru: 'Bengaluru',
    hyderabad: 'Hyderabad',
    chennai: 'Chennai',
    kolkata: 'Kolkata',
    new_delhi: 'New Delhi',
    ahmedabad: 'Ahmedabad',
  };
  return cityMap[cityId] || cityId;
}

// Keep the original helper functions
// Random data generators
const getRandomCity = () => {
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad'];
  return cities[Math.floor(Math.random() * cities.length)];
};

const getRandomState = () => {
  const states = ['Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana', 'Delhi', 'West Bengal', 'Gujarat', 'Uttar Pradesh'];
  return states[Math.floor(Math.random() * states.length)];
};

const getRandomIndustry = () => {
  const industries = ['Healthcare', 'Technology', 'Finance', 'Education', 'Manufacturing', 'Retail', 'Legal', 'Hospitality'];
  return industries[Math.floor(Math.random() * industries.length)];
};

const getRandomOccupation = () => {
  const occupations = ['Doctor', 'Engineer', 'Teacher', 'Manager', 'Executive', 'Lawyer', 'Sales Person', 'Marketer'];
  return occupations[Math.floor(Math.random() * occupations.length)];
};

const getRandomFromArray = (array: string[] = []): string => {
  if (array && array.length > 0) {
    const occupations = [
      { id: 'doctors', label: 'Doctor' },
      { id: 'lawyers', label: 'Lawyer' },
      { id: 'engineers', label: 'Engineer' },
      { id: 'teachers', label: 'Teacher' },
      { id: 'managers', label: 'Manager' },
      { id: 'executives', label: 'Executive' },
      { id: 'salespeople', label: 'Sales Person' },
      { id: 'marketers', label: 'Marketer' },
    ];

    const selected = occupations.find(o => array.includes(o.id));
    if (selected) {
      return selected.label;
    }
  }

  return getRandomOccupation();
};

const getIndustryLabel = (industryId: string): string => {
  const industry = [
    { id: 'healthcare', label: 'Healthcare' },
    { id: 'legal', label: 'Legal' },
    { id: 'tech', label: 'Technology' },
    { id: 'finance', label: 'Finance' },
    { id: 'education', label: 'Education' },
    { id: 'retail', label: 'Retail' },
    { id: 'manufacturing', label: 'Manufacturing' },
    { id: 'hospitality', label: 'Hospitality' },
  ].find(i => i.id === industryId);

  return industry ? industry.label : industryId;
};

// Helper functions for sample data
const getSampleName = (index: number): string => {
  const names = ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Deepika Singh', 'Vikram Mehta'];
  return names[index] || `Contact ${index + 1}`;
};

const getSampleEmail = (index: number): string => {
  const names = ['rahul', 'priya', 'amit', 'deepika', 'vikram'];
  return `${names[index] || 'contact'}@example.com`;
};

const getSamplePhone = (): string => {
  // Indian phone format: +91 followed by 10 digits
  return `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`;
};

// Masking functions
const maskEmail = (email: string): string => {
  if (!email) {
    return '';
  }
  const [username, domain] = email.split('@');
  if (!username || !domain) {
    return email;
  }

  const maskedUsername = `${username.charAt(0)}***${username.charAt(username.length - 1)}`;
  return `${maskedUsername}@${domain}`;
};

const maskPhone = (phone: string): string => {
  if (!phone) {
    return '';
  }
  if (phone.length < 6) {
    return phone;
  }

  const visiblePart = phone.slice(-4);
  const prefix = phone.startsWith('+') ? '+91 ' : '';
  return `${prefix}***${visiblePart}`;
};

// Add these utility functions after the other helper functions
// Utility functions to extract tag values
function extractTagValue(tags: Tag[], category: string): string {
  const tag = tags.find(t => t.category.toLowerCase() === category.toLowerCase());
  return tag ? tag.name : '';
}

function getIndustryFromTags(tags: Tag[]): string {
  return extractTagValue(tags, 'Industry');
}
