'use client';

import { useState } from 'react';

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

type PreferencesFormProps = {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  onSkip: () => void;
  initialData?: any;
};

export const PreferencesForm = ({ onSubmit, onCancel, onSkip, initialData }: PreferencesFormProps) => {
  const [formData, setFormData] = useState({
    city: initialData?.city || '',
    state: initialData?.state || '',
    industry: initialData?.industry || '',
    selectedOccupations: initialData?.selectedOccupations || [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      onSubmit(formData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-3xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Customize Your Lead Preferences</CardTitle>
          <CardDescription>
            Tell us what leads you're looking for to see more relevant results
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  placeholder="Enter state"
                  value={formData.state}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, state: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={formData.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
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

            <div className="space-y-3">
              <Label>Target Occupations</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {occupations.map(occupation => (
                  <div key={occupation.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={occupation.id}
                      checked={formData.selectedOccupations.includes(occupation.id)}
                      onCheckedChange={() => handleOccupationToggle(occupation.id)}
                    />
                    <Label htmlFor={occupation.id} className="cursor-pointer">
                      {occupation.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div>
              <Button type="button" variant="outline" onClick={onCancel} className="mr-2">
                Cancel
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={onSkip}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip for now
              </Button>
            </div>
            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? 'Saving...' : 'Search Leads'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};
