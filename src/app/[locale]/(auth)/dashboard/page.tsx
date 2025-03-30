/* eslint-disable no-console */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable unused-imports/no-unused-vars */
'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { MailSearch, SearchIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { StripePaymentForm } from '@/components/StripePaymentForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogOverlay } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PreferencesForm } from '@/features/dashboard/PreferencesForm';
import { TitleBar } from '@/features/dashboard/TitleBar';

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

type ApiResponse = {
  success: boolean;
  data: LeadApiData[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  query: {
    originalQuery: string;
    expression: string;
  };
  userSelections?: {
    state?: string;
    city?: string;
    industry?: string;
  };
};

const DashboardPage = (props: { params: { locale: string } }) => {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { locale } = props.params;
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
  const [selectedContactCount, setSelectedContactCount] = useState<string>('100');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [hasEmptyResults, setHasEmptyResults] = useState(false);
  const [userCredits, setUserCredits] = useState(100);
  const [showTopUpModal, setShowTopUpModal] = useState(false);

  // Define setSampleLeads BEFORE any useEffect that calls it
  const setSampleLeads = () => {
    // Create sample leads when no API data is available
    const sampleLeads: Lead[] = Array.from({ length: 10 }, (_, index) => ({
      id: `sample-${index + 1}`,
      name: getSampleName(index),
      email: getSampleEmail(index),
      phoneNumber: getSamplePhone(),
      city: ['Mumbai', 'Delhi', 'Bangalore', 'Pune', 'Chennai'][index % 5] || 'Mumbai',
      state: ['Maharashtra', 'Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu'][index % 5] || 'Maharashtra',
      industry: ['Software Engineer', 'Healthcare', 'Finance', 'Education', 'Retail'][index % 5] || 'Technology',
    }));

    setLeads(sampleLeads);
    setUsingApiResults(false);
    setApiQuery('Sample data - no query performed');
    setTotalResults(sampleLeads.length);
  };

  // Load user preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboarding-data');
      if (storedData) {
        setUserPreferences(JSON.parse(storedData));
      }
    }
  }, []);

  // Combined effect that handles both API and preference-based data
  useEffect(() => {
    const storedResults = localStorage.getItem('lead-query-results');
    setIsLoading(true);

    if (storedResults) {
      try {
        const results = JSON.parse(storedResults) as ApiResponse;

        // Check if this was a real query (not just initial state)
        const wasRealQuery = results.query?.expression || results.query;

        // Check if we have actual results
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

            // Extract city and state from tags
            const cityTag = person.tags.find(tag => tag.category === 'City');
            const stateTag = person.tags.find(tag => tag.category === 'State');

            // Use selected filters from the query as fallbacks
            const city = cityTag?.name || results.userSelections?.city || '';
            const state = stateTag?.name || results.userSelections?.state || '';

            // Extract industry from tags
            const industryTag = person.tags.find(tag => tag.category === 'Industry');
            const industry = industryTag?.name || results.userSelections?.industry || '';

            return {
              id: person.id,
              name: person.full_name,
              email: maskEmail(primaryEmail),
              phoneNumber: maskPhone(primaryPhone),
              city,
              state,
              industry,
            };
          });

          setLeads(transformedLeads);
          setApiQuery(results.query?.expression || '');
          setTotalResults(results.pagination?.total || 0);
          setUsingApiResults(true);
        } else if (wasRealQuery) {
          // This is an empty result from a real query
          setLeads([]);
          setApiQuery(results.query?.expression || '');
          setTotalResults(0);
          setUsingApiResults(true);
          // Add a flag to indicate empty results from a real query
          setHasEmptyResults(true);
        } else {
          // No real query was performed, use sample data
          setSampleLeads();
        }
      } catch (error) {
        console.error('Error parsing stored results:', error);
        setSampleLeads();
      } finally {
        setIsLoading(false);
      }
    } else {
      // No stored results, load sample leads
      setSampleLeads();
      setIsLoading(false);
    }

    // If we're not using API results, generate based on preferences
    if (!usingApiResults) {
      const sampleLeads = userPreferences
        ? generatePreferenceBasedLeads(userPreferences)
        : generateGenericLeads();
      setLeads(sampleLeads);
    }
  }, [userPreferences, usingApiResults]);

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

  // Handle purchase button click
  const handlePurchase = () => {
    console.log('Purchase initiated for', selectedContactCount, 'contacts');
    setShowPaymentModal(true);
  };

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
              <span className="ml-1 font-bold">{userCredits}</span>
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
            {isLoading
              ? (
                  <div className="flex h-40 items-center justify-center">
                    <div className="text-center">
                      <div className="mx-auto mb-2 size-12 animate-spin rounded-full border-4 border-blue-400 border-t-transparent"></div>
                      <p>Loading leads...</p>
                    </div>
                  </div>
                )
              : hasEmptyResults
                ? (
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
                  )
                : (
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
              <CardTitle>Access Complete Contact Data</CardTitle>
              <CardDescription>
                You're viewing limited results from your search with masked contact information.
              </CardDescription>
            </CardHeader>

            {/* Information about purchase and data delivery */}
            <div className="border-b px-6 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Available Credits</p>
                  <p className="text-2xl font-bold">{userCredits}</p>
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
                <h3 className="mb-1 font-semibold text-yellow-800">Access Complete Contact Data</h3>
                <p className="text-yellow-700">
                  You're viewing limited results from your search with masked contact information.
                  Purchase full access to see complete contact details for your target audience.
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
                    <SelectItem value="100">100 contacts</SelectItem>
                    <SelectItem value="500">500 contacts</SelectItem>
                    <SelectItem value="1000">1,000 contacts</SelectItem>
                    <SelectItem value="2000">2,000 contacts</SelectItem>
                    <SelectItem value="5000">5,000 contacts</SelectItem>
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
                  1 contact = 1 credit
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={selectedContactCount === '0'}
              >
                Purchase Contacts
              </Button>
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
    </div>
  );
};

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

export default DashboardPage;
