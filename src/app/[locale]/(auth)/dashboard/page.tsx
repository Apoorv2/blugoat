/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable ts/no-use-before-define */
/* eslint-disable unused-imports/no-unused-vars */
'use client';

import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { BarChart3, CreditCard, SearchIcon, TrendingUp, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PreferencesForm } from '@/features/dashboard/PreferencesForm';
import { TitleBar } from '@/features/dashboard/TitleBar';

// Sample data structure
type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  industry: string;
  occupation: string;
};

const DashboardPage = (props: { params: { locale: string } }) => {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const { locale } = props.params;
  const [leads, setLeads] = useState<Lead[]>([]);
  const [userPreferences, setUserPreferences] = useState<any>(null);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const t = useTranslations('DashboardIndex');

  // Load user preferences
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedData = localStorage.getItem('onboarding-data');
      if (storedData) {
        setUserPreferences(JSON.parse(storedData));
      }
    }
  }, []);

  // Generate leads based on preferences
  useEffect(() => {
    const sampleLeads = userPreferences
      ? generatePreferenceBasedLeads(userPreferences)
      : generateGenericLeads();
    setLeads(sampleLeads);
  }, [userPreferences]);

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
      phone: maskPhone(getSamplePhone()),
      city: getRandomCity() || 'Unknown',
      state: getRandomState() || 'Unknown',
      industry: getRandomIndustry() || 'General',
      occupation: getRandomOccupation() || 'Professional',
    }));
  };

  // Generate leads based on preferences
  const generatePreferenceBasedLeads = (preferences: any): Lead[] => {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `lead-${i + 1}`,
      name: getSampleName(i),
      email: maskEmail(getSampleEmail(i)),
      phone: maskPhone(getSamplePhone()),
      city: preferences.city || getRandomCity() || 'Unknown',
      state: preferences.state || getRandomState() || 'Unknown',
      industry: (preferences.industry ? getIndustryLabel(preferences.industry) : getRandomIndustry()) || 'General',
      occupation: getRandomFromArray(preferences.selectedOccupations) || 'Professional',
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

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t.rich('title_bar_description', {
          default: 'Manage your leads and account',
        })}
      />

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

      <div className="container mx-auto space-y-8 p-6">
        {/* Dashboard Overview Section */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Credits Card */}
          <Card className="relative overflow-hidden border-blue-200 md:col-span-2">
            <div className="absolute -right-12 -top-12 size-40 rounded-full bg-gradient-to-br from-blue-400/10 to-indigo-400/20" />
            <CardHeader className="pb-2">
              <CardTitle className="text-xl font-semibold text-blue-800">Available Credits</CardTitle>
              <CardDescription>Use credits to unlock full lead data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold text-blue-700">100</span>
                <span className="text-sm text-blue-600">credits</span>
              </div>
              <Progress value={65} className="mt-4 h-2 bg-blue-100" indicatorClassName="bg-blue-600" />
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">65% remaining</span>
                <span className="text-blue-600 hover:text-blue-800 hover:underline">
                  <a href="#">View usage history</a>
                </span>
              </div>
            </CardContent>
            <CardFooter className="bg-gradient-to-r from-white to-blue-50">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <CreditCard className="mr-2 size-4" />
                Top Up Credits
              </Button>
            </CardFooter>
          </Card>

          {/* Quick Stats */}
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-blue-800">Leads Unlocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-blue-700">12</span>
                  <span className="text-sm text-blue-600">leads</span>
                </div>
                <Badge className="bg-blue-600">+5 this week</Badge>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp className="mr-1 size-4 text-green-500" />
                <span className="text-green-600">22% increase since last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium text-blue-800">Avg. Response Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline space-x-1">
                  <span className="text-3xl font-bold text-blue-700">37%</span>
                </div>
                <BarChart3 className="size-5 text-blue-600" />
              </div>
              <div className="mt-4 flex items-center text-sm">
                <Users className="mr-1 size-4 text-blue-500" />
                <span className="text-blue-600">Based on industry benchmark data</span>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Explore Leads Section */}
        <Card className="overflow-hidden border-b-4 border-indigo-600 bg-gradient-to-br from-slate-50 via-white to-blue-50 shadow-lg">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:w-3/5">
              <div className="mb-3 inline-block rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-800">
                Lead Discovery
              </div>
              <h2 className="mb-2 text-3xl font-bold tracking-tight text-gray-900">Find Your Ideal Prospects</h2>
              <p className="mb-4 text-lg text-gray-600">
                Define your target audience with precise filters and unlock high-quality leads that match your exact criteria.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="mr-2 rounded-full bg-green-100 p-1">
                    <svg className="size-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Set location, industry, and role-specific filters</p>
                </div>
                <div className="flex items-start">
                  <div className="mr-2 rounded-full bg-green-100 p-1">
                    <svg className="size-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Access complete verified contact information</p>
                </div>
                <div className="flex items-start">
                  <div className="mr-2 rounded-full bg-green-100 p-1">
                    <svg className="size-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-600">Get AI-enriched insights about your prospects</p>
                </div>
              </div>
              <Button
                onClick={handleExploreLeads}
                className="mt-6 bg-gradient-to-r from-indigo-600 via-blue-600 to-blue-500 px-6 py-3 text-lg font-semibold text-white hover:shadow-lg"
                size="lg"
              >
                <SearchIcon className="mr-2 size-5" />
                Discover Your Target Leads
              </Button>
            </div>
            <div className="bg-gradient-to-br from-indigo-600 to-blue-500 p-6 text-white md:w-2/5">
              <h3 className="mb-3 font-medium">Why Customize Your Lead Search?</h3>
              <ul className="space-y-3">
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-white/20 p-1">
                    <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">3x higher conversion rates with targeted leads</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-white/20 p-1">
                    <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">Save hours on manual research and validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="rounded-full bg-white/20 p-1">
                    <svg className="size-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-sm">Get weekly recommendations based on your activity</span>
                </li>
              </ul>
              <div className="mt-6 rounded-lg bg-white/10 p-3 text-center">
                <p className="text-sm font-medium">Customize search criteria to find your perfect leads!</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Lead data table - kept from original implementation but improved styling */}
        <Card className="border border-gray-200 shadow-md">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl text-gray-800">Preview Leads</CardTitle>
                <CardDescription>
                  {userPreferences
                    ? (
                        <span className="text-gray-600">
                          Based on your preferences:
                          {' '}
                          {getStateLabel(userPreferences?.state)}
                          {userPreferences?.city ? `, ${getCityLabel(userPreferences?.city)}` : ''}
                          {userPreferences?.industry ? `, ${getIndustryLabel(userPreferences?.industry)}` : ''}
                        </span>
                      )
                    : (
                        <span className="text-gray-600">Sample leads from across India</span>
                      )}
                </CardDescription>
              </div>
              <Button variant="outline" onClick={handleShowPreferencesForm} className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700">
                Adjust Preferences
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0">
            <Table>
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="font-medium">Name</TableHead>
                  <TableHead className="font-medium">Contact</TableHead>
                  <TableHead className="font-medium">Location</TableHead>
                  <TableHead className="font-medium">Industry</TableHead>
                  <TableHead className="font-medium">Occupation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.map(lead => (
                  <TableRow key={lead.id} className="hover:bg-blue-50/30">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>
                          {lead.email}
                          {' '}
                          <Badge variant="outline" className="ml-1 bg-blue-50 text-xs text-blue-700">Masked</Badge>
                        </div>
                        <div>
                          {lead.phone}
                          {' '}
                          <Badge variant="outline" className="ml-1 bg-blue-50 text-xs text-blue-700">Masked</Badge>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lead.city}
                      ,
                      {' '}
                      {lead.state}
                    </TableCell>
                    <TableCell>{lead.industry}</TableCell>
                    <TableCell>{lead.occupation}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
          <CardFooter className="justify-between border-t bg-gray-50 px-6 py-4">
            <p className="text-sm text-gray-500">
              Showing 5 of 1,500+ leads matching your criteria
            </p>
            <Button onClick={handleExploreLeads} className="bg-blue-600 hover:bg-blue-700">
              See More Leads
            </Button>
          </CardFooter>
        </Card>

        {/* Credit Packages */}
        <Card className="border-t-4 border-t-indigo-500 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl text-gray-800">Unlock More Leads with Credits</CardTitle>
            <CardDescription>Choose a package that fits your business needs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <Card className="border border-gray-200 transition-all duration-200 hover:border-blue-300 hover:shadow-md">
                <CardHeader className="bg-gradient-to-b from-blue-50 to-white pb-2">
                  <CardTitle className="text-lg text-blue-800">Starter</CardTitle>
                  <CardDescription>Perfect for small businesses</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">₹999</span>
                    <span className="ml-1 text-gray-500">/one-time</span>
                  </div>
                  <ul className="mb-6 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      100 lead credits
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Export to CSV
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Basic filtering
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="bg-gradient-to-b from-white to-gray-50 pt-0">
                  <Button className="w-full" variant="outline">
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>

              <Card className="relative border-2 border-blue-400 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-1 text-xs font-medium text-white">
                  MOST POPULAR
                </div>
                <CardHeader className="bg-gradient-to-b from-blue-50 to-white pb-2">
                  <CardTitle className="text-lg text-blue-800">Growth</CardTitle>
                  <CardDescription>For growing teams</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">₹2,499</span>
                    <span className="ml-1 text-gray-500">/one-time</span>
                  </div>
                  <ul className="mb-6 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      300 lead credits
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Advanced filtering
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Weekly new leads
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Email & phone verified
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="bg-gradient-to-b from-white to-gray-50 pt-0">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    Buy Now
                  </Button>
                </CardFooter>
              </Card>

              <Card className="border border-gray-200 transition-all duration-200 hover:border-blue-300 hover:shadow-md">
                <CardHeader className="bg-gradient-to-b from-blue-50 to-white pb-2">
                  <CardTitle className="text-lg text-blue-800">Enterprise</CardTitle>
                  <CardDescription>For large teams</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="mb-4 flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">₹5,999</span>
                    <span className="ml-1 text-gray-500">/one-time</span>
                  </div>
                  <ul className="mb-6 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      1000 lead credits
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Premium filtering
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      CRM integration
                    </li>
                    <li className="flex items-center">
                      <svg className="mr-2 size-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Priority support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter className="bg-gradient-to-b from-white to-gray-50 pt-0">
                  <Button className="w-full" variant="outline">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
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
  const parts = email.split('@');
  if (parts.length !== 2) {
    return email;
  } // Return original if not a valid email

  const username = parts[0];
  const domain = parts[1];
  const maskedUsername = `${username.charAt(0)}***${username.charAt(username.length - 1)}`;
  return `${maskedUsername}@${domain}`;
};

const maskPhone = (phone: string): string => {
  // Assuming format like "+91 9876543210"
  return `${phone.substring(0, 4)} ****${phone.substring(phone.length - 4)}`;
};

export default DashboardPage;
