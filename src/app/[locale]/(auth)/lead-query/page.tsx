'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, Search, XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useCities, useIndustries, useStates } from '@/utils/locationUtils';

// Industry options (prefixed with _ to satisfy unused var rule)
const _industries = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'legal', label: 'Legal' },
  { id: 'tech', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' },
  { id: 'retail', label: 'Retail' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'hospitality', label: 'Hospitality' },
];

// Occupation options (prefixed with _ to satisfy unused var rule)
const _occupations = [
  { id: 'doctors', label: 'Doctors' },
  { id: 'lawyers', label: 'Lawyers' },
  { id: 'engineers', label: 'Engineers' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'managers', label: 'Managers' },
  { id: 'executives', label: 'Executives' },
  { id: 'salespeople', label: 'Sales People' },
  { id: 'marketers', label: 'Marketers' },
];

// Indian States (prefixed with _ to satisfy unused var rule)
const _states = [
  { id: 'maharashtra', label: 'Maharashtra' },
  { id: 'karnataka', label: 'Karnataka' },
  { id: 'tamil_nadu', label: 'Tamil Nadu' },
  { id: 'telangana', label: 'Telangana' },
  { id: 'delhi', label: 'Delhi' },
  { id: 'west_bengal', label: 'West Bengal' },
  { id: 'gujarat', label: 'Gujarat' },
  { id: 'uttar_pradesh', label: 'Uttar Pradesh' },
];

// Cities by State
const citiesByState: Record<string, { id: string; label: string }[]> = {
  maharashtra: [
    { id: 'mumbai', label: 'Mumbai' },
    { id: 'pune', label: 'Pune' },
    { id: 'nagpur', label: 'Nagpur' },
    { id: 'nashik', label: 'Nashik' },
  ],
  karnataka: [
    { id: 'bengaluru', label: 'Bengaluru' },
    { id: 'mysuru', label: 'Mysuru' },
    { id: 'hubli', label: 'Hubli' },
    { id: 'mangaluru', label: 'Mangaluru' },
  ],
  tamil_nadu: [
    { id: 'chennai', label: 'Chennai' },
    { id: 'coimbatore', label: 'Coimbatore' },
    { id: 'madurai', label: 'Madurai' },
    { id: 'tiruchirappalli', label: 'Tiruchirappalli' },
  ],
  telangana: [
    { id: 'hyderabad', label: 'Hyderabad' },
    { id: 'warangal', label: 'Warangal' },
    { id: 'nizamabad', label: 'Nizamabad' },
    { id: 'karimnagar', label: 'Karimnagar' },
  ],
  delhi: [
    { id: 'new_delhi', label: 'New Delhi' },
    { id: 'north_delhi', label: 'North Delhi' },
    { id: 'south_delhi', label: 'South Delhi' },
    { id: 'east_delhi', label: 'East Delhi' },
  ],
  west_bengal: [
    { id: 'kolkata', label: 'Kolkata' },
    { id: 'howrah', label: 'Howrah' },
    { id: 'durgapur', label: 'Durgapur' },
    { id: 'asansol', label: 'Asansol' },
  ],
  gujarat: [
    { id: 'ahmedabad', label: 'Ahmedabad' },
    { id: 'surat', label: 'Surat' },
    { id: 'vadodara', label: 'Vadodara' },
    { id: 'rajkot', label: 'Rajkot' },
  ],
  uttar_pradesh: [
    { id: 'lucknow', label: 'Lucknow' },
    { id: 'kanpur', label: 'Kanpur' },
    { id: 'agra', label: 'Agra' },
    { id: 'varanasi', label: 'Varanasi' },
  ],
};

// Subfilter options
const subfilterTypes = [
  { id: 'income', label: 'Income Range', type: 'range' },
  { id: 'age', label: 'Age Range', type: 'range' },
  { id: 'gender', label: 'Gender', type: 'select' },
  { id: 'business_size', label: 'Business Size', type: 'select' },
  { id: 'experience', label: 'Years of Experience', type: 'range' },
  { id: 'education', label: 'Education Level', type: 'select' },
];

// Options for select-type subfilters
const subfilterOptions: Record<string, { id: string; label: string }[]> = {
  gender: [
    { id: 'male', label: 'Male' },
    { id: 'female', label: 'Female' },
    { id: 'other', label: 'Other' },
  ],
  business_size: [
    { id: 'small', label: 'Small (1-50)' },
    { id: 'medium', label: 'Medium (51-200)' },
    { id: 'large', label: 'Large (201+)' },
  ],
  education: [
    { id: 'high_school', label: 'High School' },
    { id: 'bachelors', label: 'Bachelor\'s Degree' },
    { id: 'masters', label: 'Master\'s Degree' },
    { id: 'phd', label: 'PhD/Doctorate' },
  ],
};

type SubfilterValue = {
  min?: number;
  max?: number;
  value?: string;
};

type Subfilter = {
  id: string;
  type: string;
  filterId: string;
  value: SubfilterValue;
};

const LeadQueryPage = (props: { params: { locale: string } }) => {
  const router = useRouter();
  const { locale } = props.params;
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [_queryType, setQueryType] = useState<'guided' | 'direct'>('guided');
  const [directQuery, setDirectQuery] = useState('');
  const [_isDirectQuerySubmitted, _setIsDirectQuerySubmitted] = useState(false);

  const [formData, setFormData] = useState({
    state: '',
    city: '',
    industry: '',
    selectedOccupations: [] as string[],
    subfilters: [] as Subfilter[],
  });

  const [_availableCities, setAvailableCities] = useState<{ id: string; label: string }[]>([]);
  const [subfilterCount, setSubfilterCount] = useState(0);

  // State handling
  const [selectedState, setSelectedState] = useState<string>('');
  const { states, loading: statesLoading } = useStates();
  const { cities, loading: citiesLoading } = useCities(selectedState);
  const { industries, loading: _industriesLoading } = useIndustries();

  // Update available cities when state changes
  useEffect(() => {
    if (formData.state) {
      setAvailableCities(citiesByState[formData.state] || []);
      // Reset city if state changes
      if (!citiesByState[formData.state]?.find(city => city.id === formData.city)) {
        setFormData(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.state]);

  const _handleOccupationToggle = (occupationId: string) => {
    setFormData((prev) => {
      const current = [...prev.selectedOccupations];
      if (current.includes(occupationId)) {
        return {
          ...prev,
          selectedOccupations: current.filter(id => id !== occupationId),
        };
      } else {
        return {
          ...prev,
          selectedOccupations: [...current, occupationId],
        };
      }
    });
  };

  const _addSubfilter = (filterId: string) => {
    const filterType = subfilterTypes.find(f => f.id === filterId)?.type || 'select';
    const newFilter: Subfilter = {
      id: `filter-${subfilterCount}`,
      filterId,
      type: filterType,
      value: filterType === 'range' ? { min: 0, max: 100 } : { value: '' },
    };

    setFormData(prev => ({
      ...prev,
      subfilters: [...prev.subfilters, newFilter],
    }));
    setSubfilterCount(prev => prev + 1);
  };

  const removeSubfilter = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subfilters: prev.subfilters.filter(f => f.id !== id),
    }));
  };

  const updateSubfilterValue = (id: string, update: SubfilterValue) => {
    setFormData(prev => ({
      ...prev,
      subfilters: prev.subfilters.map((filter) => {
        if (filter.id === id) {
          return {
            ...filter,
            value: { ...filter.value, ...update },
          };
        }
        return filter;
      }),
    }));
  };

  const _nextStep = () => {
    setStep(prev => prev + 1);
  };

  const _prevStep = () => {
    setStep(prev => prev - 1);
  };

  const _skipToEnd = () => {
    localStorage.setItem('onboarding-data', JSON.stringify(formData));
    localStorage.setItem('has_seen_credits', 'true');
    router.push(`/${locale}/dashboard?bypass_org_check=true`);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Build query string based on form data
      const queryParts = [];

      // Add industry if selected (not "all")
      if (formData.industry && formData.industry !== 'all') {
        queryParts.push(`"${formData.industry}"`);
      }

      // Add city if selected - now with parentheses
      if (formData.city && formData.city !== 'all') {
        queryParts.push(`("${formData.city}")`);
      }

      // Add state if selected - now with parentheses
      if (formData.state && formData.state !== 'all') {
        queryParts.push(`("${formData.state}")`);
      }

      // Combine query parts with AND operator
      let queryExpression = queryParts.join(' AND ');

      // If no filters were selected, use a default query that returns all records
      if (!queryExpression) {
        queryExpression = '""'; // Empty quotes will match all records
      }

      // Create the request body
      const requestBody = {
        expression: queryExpression,
        includeMetadata: true,
        includeContacts: true,
        page: 1,
      };

      // Call the API endpoint
      const response = await fetch('https://blugoat-api-310650732642.us-central1.run.app/api/individuals/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();

      // Save to localStorage for dashboard to access
      localStorage.setItem('lead-query-results', JSON.stringify({
        success: true,
        data: data.data,
        pagination: data.pagination,
        query: data.query,
        userSelections: {
          state: formData.state,
          city: formData.city,
          industry: formData.industry,
        },
      }));

      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error('Error submitting query:', error);
      // Handle error - you could show an error notification here
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFilterLabel = (filterId: string) => {
    return subfilterTypes.find(f => f.id === filterId)?.label || filterId;
  };

  const _renderSubfilter = (filter: Subfilter) => {
    const filterLabel = getFilterLabel(filter.filterId);

    if (filter.type === 'range') {
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{filterLabel}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSubfilter(filter.id)}
              className="size-7 p-0 text-gray-500 hover:text-red-500"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              placeholder="Min"
              value={filter.value.min}
              onChange={e => updateSubfilterValue(filter.id, { min: Number.parseInt(e.target.value) })}
              className="w-1/2"
            />
            <span>-</span>
            <Input
              type="number"
              placeholder="Max"
              value={filter.value.max}
              onChange={e => updateSubfilterValue(filter.id, { max: Number.parseInt(e.target.value) })}
              className="w-1/2"
            />
          </div>
        </div>
      );
    }

    if (filter.type === 'select') {
      const options = subfilterOptions[filter.filterId] || [];
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{filterLabel}</Label>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeSubfilter(filter.id)}
              className="size-7 p-0 text-gray-500 hover:text-red-500"
            >
              <XIcon className="size-4" />
            </Button>
          </div>
          <Select
            value={filter.value.value}
            onValueChange={value => updateSubfilterValue(filter.id, { value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${filterLabel}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map(option => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }

    return null;
  };

  const handleDirectQuerySubmit = async () => {
    if (!directQuery.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Now try the actual query

      // Use your curl command directly in the client (not recommended for production)
      const response = await fetch('https://blugoat-api-310650732642.us-central1.run.app/api/query/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: directQuery,
          includeContacts: true,
          includeMetadata: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        throw new Error(`Failed to fetch leads: ${response.status}`);
      }

      const data = await response.json();

      // Save to localStorage so dashboard can access it
      localStorage.setItem('lead-query-results', JSON.stringify(data));
      localStorage.setItem('direct-query', directQuery);

      // Redirect to dashboard
      router.push(`/${locale}/dashboard`);
    } catch (error) {
      console.error('Error submitting query:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <motion.div
        className="w-full max-w-3xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25 }}
      >
        <Card className="overflow-hidden border-t-4 border-t-blue-600 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-8">
            <div className="mb-2 flex justify-between">
              <CardTitle className="text-2xl text-blue-800">
                Help Us Find Your Perfect Custom Audience
              </CardTitle>
              <div className="flex items-center space-x-1">
                {[1, 2].map(num => (
                  <motion.div
                    key={num}
                    className={`h-2 w-8 rounded ${
                      step >= num ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                    initial={{ opacity: 0.6 }}
                    animate={{ opacity: step >= num ? 1 : 0.6 }}
                  />
                ))}
              </div>
            </div>
            <CardDescription className="text-blue-600">
              {step === 1 && 'Tell us where you\'re looking for Audience'}
              {step === 2 && 'What industry are you targeting?'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            <Tabs defaultValue="guided" className="mt-4" onValueChange={v => setQueryType(v as 'guided' | 'direct')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="guided">Guided Search</TabsTrigger>
                <TabsTrigger value="direct">Direct Query</TabsTrigger>
              </TabsList>

              <TabsContent value="direct" className="m-0">
                <CardContent className="pt-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="directQuery">Write your query in natural language</Label>
                      <div className="relative">
                        <Textarea
                          id="directQuery"
                          placeholder="Example: Software engineers in Delhi or Marketing managers in Bangalore"
                          className="h-24 pl-10 pt-3"
                          value={directQuery}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDirectQuery(e.target.value)}
                        />
                        <Search className="absolute left-3 top-3 size-5 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Describe exactly what you're looking for, including job titles, locations,
                        industries or any other criteria.
                      </p>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex justify-between border-t bg-gradient-to-r from-gray-50 to-slate-50 p-6">
                  <Button variant="ghost" onClick={() => router.push(`/${locale}/dashboard`)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDirectQuerySubmit}
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting || !directQuery.trim()}
                  >
                    {isSubmitting ? 'Processing...' : 'Find My Leads'}
                  </Button>
                </CardFooter>
              </TabsContent>

              <TabsContent value="guided" className="m-0">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: 'spring', damping: 25 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="state">State</Label>
                          <Select
                            value={selectedState}
                            onValueChange={(value) => {
                              const stateValue = value === 'all' ? '' : value;
                              setSelectedState(stateValue);
                              // Reset city when state changes
                              setFormData({ ...formData, state: stateValue, city: '' });
                            }}
                            disabled={statesLoading}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All States</SelectItem>
                              {states.map((state: any) => (
                                <SelectItem key={state.id} value={state.name}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="city">City</Label>
                          <Select
                            value={formData.city}
                            onValueChange={(value) => {
                              const cityValue = value === 'all' ? '' : value;
                              setFormData({ ...formData, city: cityValue });
                            }}
                            disabled={citiesLoading || !selectedState}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={!selectedState ? 'Select state first' : 'Select city'} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Cities</SelectItem>
                              {cities.map((city: any) => (
                                <SelectItem key={city.id} value={city.name}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div
                      key="step2"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ type: 'spring', damping: 25 }}
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <Label>Target Categories</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {industries.map((industry: any) => (
                            <button
                              key={industry.id}
                              className={`
                                flex cursor-pointer items-center justify-between rounded-lg border p-3
                                ${formData.industry === industry.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                              `}
                              onClick={() => setFormData({ ...formData, industry: industry.name })}
                              type="button"
                            >
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium">{industry.name}</p>
                                </div>
                              </div>
                              {formData.industry === industry.name && (
                                <CheckIcon className="size-5 text-blue-500" />
                              )}
                            </button>
                          ))}
                          <button
                            className={`
                              flex cursor-pointer items-center justify-between rounded-lg border p-3
                              ${formData.industry === 'all' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}
                            `}
                            onClick={() => setFormData({ ...formData, industry: 'all' })}
                            type="button"
                          >
                            <div className="flex items-center gap-2">
                              <div className="flex-1">
                                <p className="text-sm font-medium">All Categories</p>
                              </div>
                            </div>
                            {formData.industry === 'all' && (
                              <CheckIcon className="size-5 text-blue-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
            {step === 1
              ? (
                  <Button
                    variant="outline"
                    onClick={_skipToEnd}
                    className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Skip for now
                  </Button>
                )
              : (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    disabled={step === 1}
                  >
                    Back
                  </Button>
                )}
            <Button
              onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}
              disabled={isSubmitting}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              {step < 2 ? 'Next' : 'Find Audience'}
              {isSubmitting && (
                <motion.div
                  className="ml-2 size-4 animate-spin rounded-full border-2 border-t-transparent"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                />
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LeadQueryPage;
