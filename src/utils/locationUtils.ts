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
  { id: 'madhya_pradesh', name: 'Madhya Pradesh' },
  { id: 'punjab', name: 'Punjab' },
  { id: 'rajasthan', name: 'Rajasthan' },
  { id: 'chhattisgarh', name: 'Chhattisgarh' },
  { id: 'goa', name: 'Goa' },
];

// Expand the city data with more comprehensive city lists for each state
const citiesData: Record<string, City[]> = {
  'maharashtra': [
    { id: 'mumbai', name: 'Mumbai' },
    { id: 'pune', name: 'Pune' },
    { id: 'nagpur', name: 'Nagpur' },
    { id: 'nashik', name: 'Nashik' },
    { id: 'aurangabad', name: 'Aurangabad' },
    { id: 'solapur', name: 'Solapur' },
    { id: 'amravati', name: 'Amravati' },
  ],
  'karnataka': [
    { id: 'bengaluru', name: 'Bengaluru' },
    { id: 'mysuru', name: 'Mysuru' },
    { id: 'hubli', name: 'Hubli-Dharwad' },
    { id: 'mangaluru', name: 'Mangaluru' },
    { id: 'belgaum', name: 'Belgaum' },
    { id: 'davangere', name: 'Davangere' },
    { id: 'bellary', name: 'Bellary' },
  ],
  'tamil_nadu': [
    { id: 'chennai', name: 'Chennai' },
    { id: 'coimbatore', name: 'Coimbatore' },
    { id: 'madurai', name: 'Madurai' },
    { id: 'tiruchirappalli', name: 'Tiruchirappalli' },
    { id: 'salem', name: 'Salem' },
    { id: 'tirunelveli', name: 'Tirunelveli' },
    { id: 'erode', name: 'Erode' },
  ],
  'delhi': [
    { id: 'new_delhi', name: 'New Delhi' },
    { id: 'north_delhi', name: 'North Delhi' },
    { id: 'south_delhi', name: 'South Delhi' },
    { id: 'east_delhi', name: 'East Delhi' },
    { id: 'west_delhi', name: 'West Delhi' },
  ],
  'gujarat': [
    { id: 'ahmedabad', name: 'Ahmedabad' },
    { id: 'surat', name: 'Surat' },
    { id: 'vadodara', name: 'Vadodara' },
    { id: 'rajkot', name: 'Rajkot' },
    { id: 'bhavnagar', name: 'Bhavnagar' },
    { id: 'jamnagar', name: 'Jamnagar' },
  ],
  'uttar_pradesh': [
    { id: 'lucknow', name: 'Lucknow' },
    { id: 'kanpur', name: 'Kanpur' },
    { id: 'ghaziabad', name: 'Ghaziabad' },
    { id: 'agra', name: 'Agra' },
    { id: 'varanasi', name: 'Varanasi' },
    { id: 'meerut', name: 'Meerut' },
    { id: 'allahabad', name: 'Prayagraj' },
  ],
  'west_bengal': [
    { id: 'kolkata', name: 'Kolkata' },
    { id: 'howrah', name: 'Howrah' },
    { id: 'durgapur', name: 'Durgapur' },
    { id: 'asansol', name: 'Asansol' },
    { id: 'siliguri', name: 'Siliguri' },
  ],
  'telangana': [
    { id: 'hyderabad', name: 'Hyderabad' },
    { id: 'warangal', name: 'Warangal' },
    { id: 'nizamabad', name: 'Nizamabad' },
    { id: 'karimnagar', name: 'Karimnagar' },
    { id: 'ramagundam', name: 'Ramagundam' },
  ],
  'madhya_pradesh': [
    { id: 'bhopal', name: 'Bhopal' },
    { id: 'indore', name: 'Indore' },
    { id: 'jabalpur', name: 'Jabalpur' },
    { id: 'gwalior', name: 'Gwalior' },
    { id: 'ujjain', name: 'Ujjain' },
    { id: 'sagar', name: 'Sagar' },
    { id: 'dewas', name: 'Dewas' },
    { id: 'satna', name: 'Satna' },
    { id: 'ratlam', name: 'Ratlam' },
  ],
  'punjab': [
    { id: 'ludhiana', name: 'Ludhiana' },
    { id: 'amritsar', name: 'Amritsar' },
    { id: 'jalandhar', name: 'Jalandhar' },
    { id: 'patiala', name: 'Patiala' },
    { id: 'bathinda', name: 'Bathinda' },
    { id: 'mohali', name: 'Mohali' },
    { id: 'pathankot', name: 'Pathankot' },
    { id: 'hoshiarpur', name: 'Hoshiarpur' },
  ],
  'rajasthan': [
    { id: 'jaipur', name: 'Jaipur' },
    { id: 'jodhpur', name: 'Jodhpur' },
    { id: 'udaipur', name: 'Udaipur' },
    { id: 'kota', name: 'Kota' },
    { id: 'bikaner', name: 'Bikaner' },
    { id: 'ajmer', name: 'Ajmer' },
    { id: 'sikar', name: 'Sikar' },
    { id: 'bharatpur', name: 'Bharatpur' },
    { id: 'alwar', name: 'Alwar' },
  ],
  'chhattisgarh': [
    { id: 'raipur', name: 'Raipur' },
    { id: 'bhilai', name: 'Bhilai' },
    { id: 'bilaspur', name: 'Bilaspur' },
    { id: 'korba', name: 'Korba' },
    { id: 'durg', name: 'Durg' },
    { id: 'rajnandgaon', name: 'Rajnandgaon' },
    { id: 'jagdalpur', name: 'Jagdalpur' },
  ],
  'goa': [
    { id: 'panaji', name: 'Panaji' },
    { id: 'margao', name: 'Margao' },
    { id: 'vasco', name: 'Vasco da Gama' },
    { id: 'mapusa', name: 'Mapusa' },
    { id: 'ponda', name: 'Ponda' },
    { id: 'bicholim', name: 'Bicholim' },
    { id: 'canacona', name: 'Canacona' },
  ],
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
  { id: 'construction', name: 'Construction' },
  { id: 'agriculture', name: 'Agriculture' },
  { id: 'tourism', name: 'Tourism' },
  { id: 'transportation', name: 'Transportation' },
  { id: 'real_estate', name: 'Real Estate' },
  { id: 'media', name: 'Media' },
  { id: 'HNIs', name: 'HNI' },
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

    // Debug which cities will be loaded
    console.log(`Getting cities for state ID: "${stateId}"`);
    console.log(`Available states: ${Object.keys(citiesData).join(', ')}`);
    console.log(`Found ${citiesData[stateId]?.length || 0} cities for this state`);

    // Simulate API call delay
    const timer = setTimeout(() => {
      // Get cities for the specific state ID
      const stateCities = citiesData[stateId] || [];
      setCities(stateCities);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [stateId]);

  return { cities, loading };
}

// Hook for industries - updated to fetch from API
export function useIndustries() {
  const [loading, setLoading] = useState(true);
  const [industries, setIndustries] = useState<Industry[]>([]);

  useEffect(() => {
    const fetchIndustries = async () => {
      setLoading(true);
      try {
        const response = await fetch('https://blugoat-api-310650732642.us-central1.run.app/api/tags/category/Industry');

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && Array.isArray(data.data)) {
          // Transform API data to match expected format
          const transformedData = data.data.map((item: any) => ({
            id: item.id,
            name: item.name,
          }));

          setIndustries(transformedData);
        } else {
          // Fallback to static data if API response is not as expected
          console.error('Invalid API response format');
          setIndustries(industriesData);
        }
      } catch (error) {
        console.error('Error fetching industries:', error);
        // Fallback to static data on error
        setIndustries(industriesData);
      } finally {
        setLoading(false);
      }
    };

    fetchIndustries();
  }, []);

  return { industries, loading };
}
