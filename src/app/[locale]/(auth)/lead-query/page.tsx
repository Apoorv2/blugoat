'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Industry options
const industries = [
  { id: 'healthcare', label: 'Healthcare' },
  { id: 'legal', label: 'Legal' },
  { id: 'tech', label: 'Technology' },
  { id: 'finance', label: 'Finance' },
  { id: 'education', label: 'Education' },
  { id: 'retail', label: 'Retail' },
  { id: 'manufacturing', label: 'Manufacturing' },
  { id: 'hospitality', label: 'Hospitality' },
];

// Occupation options
const occupations = [
  { id: 'doctors', label: 'Doctors' },
  { id: 'lawyers', label: 'Lawyers' },
  { id: 'engineers', label: 'Engineers' },
  { id: 'teachers', label: 'Teachers' },
  { id: 'managers', label: 'Managers' },
  { id: 'executives', label: 'Executives' },
  { id: 'salespeople', label: 'Sales People' },
  { id: 'marketers', label: 'Marketers' },
];

// Indian States
const states = [
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

  const [formData, setFormData] = useState({
    state: '',
    city: '',
    industry: '',
    selectedOccupations: [] as string[],
    subfilters: [] as Subfilter[],
  });

  const [availableCities, setAvailableCities] = useState<{ id: string; label: string }[]>([]);
  const [subfilterCount, setSubfilterCount] = useState(0);

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

  const handleOccupationToggle = (occupationId: string) => {
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

  const addSubfilter = (filterId: string) => {
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

  const nextStep = () => {
    setStep(prev => prev + 1);
  };

  const prevStep = () => {
    setStep(prev => prev - 1);
  };

  const skipToEnd = () => {
    localStorage.setItem('onboarding-data', JSON.stringify(formData));
    localStorage.setItem('has_seen_credits', 'true');
    router.push(`/${locale}/dashboard?bypass_org_check=true`);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    localStorage.setItem('onboarding-data', JSON.stringify(formData));
    localStorage.setItem('has_seen_credits', 'true');

    setTimeout(() => {
      router.push(`/${locale}/dashboard?bypass_org_check=true`);
    }, 1000);
  };

  const getFilterLabel = (filterId: string) => {
    return subfilterTypes.find(f => f.id === filterId)?.label || filterId;
  };

  const renderSubfilter = (filter: Subfilter) => {
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
                Help Us Find Your Perfect Leads
              </CardTitle>
              <div className="flex items-center space-x-1">
                {[1, 2, 3].map(num => (
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
              {step === 1 && 'Tell us where you\'re looking for leads'}
              {step === 2 && 'What industry are you targeting?'}
              {step === 3 && 'Select the occupations you\'re most interested in'}
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Select
                        value={formData.state}
                        onValueChange={(value: string) => setFormData({ ...formData, state: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent>
                          {states.map(state => (
                            <SelectItem key={state.id} value={state.id}>
                              {state.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Select
                        value={formData.city}
                        onValueChange={(value: string) => setFormData({ ...formData, city: value })}
                        disabled={!formData.state}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={formData.state ? 'Select city' : 'Choose a state first'} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableCities.map(city => (
                            <SelectItem key={city.id} value={city.id}>
                              {city.label}
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
                    <Label htmlFor="industry">Primary Industry</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value: string) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {industries.map(industry => (
                          <SelectItem key={industry.id} value={industry.id}>
                            {industry.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ type: 'spring', damping: 25 }}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <Label>Target Occupations</Label>
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                      {occupations.map(occupation => (
                        <motion.div
                          key={occupation.id}
                          className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                            formData.selectedOccupations.includes(occupation.id)
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => handleOccupationToggle(occupation.id)}
                        >
                          <Checkbox
                            id={occupation.id}
                            checked={formData.selectedOccupations.includes(occupation.id)}
                            onCheckedChange={() => handleOccupationToggle(occupation.id)}
                            className="mr-2"
                          />
                          <Label htmlFor={occupation.id} className="cursor-pointer">
                            {occupation.label}
                          </Label>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 space-y-3 border-t pt-6">
                    <div className="flex items-center justify-between">
                      <Label>Additional Filters (Optional)</Label>
                      <Select
                        value=""
                        onValueChange={addSubfilter}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Add filter" />
                        </SelectTrigger>
                        <SelectContent>
                          {subfilterTypes
                            .filter(type => !formData.subfilters.some(f => f.filterId === type.id))
                            .map(type => (
                              <SelectItem key={type.id} value={type.id}>
                                {type.label}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      {formData.subfilters.map(filter => (
                        <motion.div
                          key={filter.id}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="rounded-md border border-gray-200 p-3"
                        >
                          {renderSubfilter(filter)}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>

          <CardFooter className="flex justify-between border-t bg-gradient-to-r from-gray-50 to-slate-50 p-6">
            <div>
              {step > 1
                ? (
                    <Button variant="outline" onClick={prevStep} type="button">
                      Back
                    </Button>
                  )
                : (
                    <Button variant="ghost" onClick={skipToEnd} type="button">
                      Skip for now
                    </Button>
                  )}
            </div>
            <Button
              onClick={step < 3 ? nextStep : handleSubmit}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {step < 3 ? 'Next' : isSubmitting ? 'Processing...' : 'Find My Leads'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default LeadQueryPage;
