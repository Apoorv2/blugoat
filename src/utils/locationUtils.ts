import { useEffect, useState } from 'react';

// Define types for our hook returns
type State = {
  id: string;
  name: string;
};

type City = {
  id: string;
  name: string;
};

type Industry = {
  id: string;
  name: string;
};

// Dummy data for states
const statesData: State[] = [
  { id: 'maharashtra', name: 'Maharashtra' },
  { id: 'karnataka', name: 'Karnataka' },
  { id: 'tamil_nadu', name: 'Tamil Nadu' },
  { id: 'telangana', name: 'Telangana' },
  { id: 'delhi', name: 'Delhi' },
  { id: 'west_bengal', name: 'West Bengal' },
  { id: 'gujarat', name: 'Gujarat' },
  { id: 'uttar_pradesh', name: 'Uttar Pradesh' },
];

// Dummy data for cities by state
const citiesData: Record<string, City[]> = {
  'maharashtra': [
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'pune', name: 'Pune' },
    { id: 'nagpur', name: 'Nagpur' },
    { id: 'nashik', name: 'Nashik' },
  ],
  'karnataka': [
    { id: 'bengaluru', name: 'Bengaluru' },
    { id: 'mysuru', name: 'Mysuru' },
    { id: 'hubli', name: 'Hubli' },
    { id: 'mangaluru', name: 'Mangaluru' },
  ],
  'tamil_nadu': [
    { id: 'chennai', name: 'Chennai' },
    { id: 'coimbatore', name: 'Coimbatore' },
    { id: 'madurai', name: 'Madurai' },
    { id: 'tiruchirappalli', name: 'Tiruchirappalli' },
  ],
  // Add other cities for other states...
  '': [], // Default for no state selected
};

// Dummy data for industries
const industriesData: Industry[] = [
  { id: 'healthcare', name: 'Healthcare' },
  { id: 'legal', name: 'Legal' },
  { id: 'tech', name: 'Technology' },
  { id: 'finance', name: 'Finance' },
  { id: 'education', name: 'Education' },
  { id: 'retail', name: 'Retail' },
  { id: 'manufacturing', name: 'Manufacturing' },
  { id: 'hospitality', name: 'Hospitality' },
];

// Hook for states
export function useStates() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { states: statesData, loading };
}

// Hook for cities based on state
export function useCities(stateId: string) {
  const [loading, setLoading] = useState(true);
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    setLoading(true);

    // Simulate API call delay
    const timer = setTimeout(() => {
      setCities(citiesData[stateId] || []);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [stateId]);

  return { cities, loading };
}

// Hook for industries
export function useIndustries() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return { industries: industriesData, loading };
}
