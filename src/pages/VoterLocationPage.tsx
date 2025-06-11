
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Location {
  id: string;
  name: string;
  type: string;
  parent_id: string | null;
}

const VoterLocationPage = () => {
  const [location, setLocation] = useState({
    county: '',
    constituency: '',
    ward: ''
  });
  const [counties, setCounties] = useState<Location[]>([]);
  const [constituencies, setConstituencies] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Load counties on component mount
  useEffect(() => {
    const loadCounties = async () => {
      const { data, error } = await supabase
        .from('locations')
        .select('*')
        .eq('type', 'county')
        .order('name');

      if (error) {
        console.error('Error loading counties:', error);
        return;
      }

      setCounties(data || []);
    };

    loadCounties();
  }, []);

  // Load constituencies when county changes
  useEffect(() => {
    if (location.county) {
      const loadConstituencies = async () => {
        const selectedCounty = counties.find(c => c.name === location.county);
        if (!selectedCounty) return;

        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('type', 'constituency')
          .eq('parent_id', selectedCounty.id)
          .order('name');

        if (error) {
          console.error('Error loading constituencies:', error);
          return;
        }

        setConstituencies(data || []);
      };

      loadConstituencies();
    } else {
      setConstituencies([]);
    }
  }, [location.county, counties]);

  // Load wards when constituency changes
  useEffect(() => {
    if (location.constituency) {
      const loadWards = async () => {
        const selectedConstituency = constituencies.find(c => c.name === location.constituency);
        if (!selectedConstituency) return;

        const { data, error } = await supabase
          .from('locations')
          .select('*')
          .eq('type', 'ward')
          .eq('parent_id', selectedConstituency.id)
          .order('name');

        if (error) {
          console.error('Error loading wards:', error);
          return;
        }

        setWards(data || []);
      };

      loadWards();
    } else {
      setWards([]);
    }
  }, [location.constituency, constituencies]);

  const handleLocationChange = (field: string, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields when parent changes
      ...(field === 'county' && { constituency: '', ward: '' }),
      ...(field === 'constituency' && { ward: '' })
    }));
  };

  const handleProceed = async () => {
    if (!location.county || !location.constituency || !location.ward) {
      toast({
        title: "Incomplete Selection",
        description: "Please select your County, Constituency, and Ward.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Find the selected ward ID
      const selectedWard = wards.find(w => w.name === location.ward);
      if (!selectedWard) {
        throw new Error('Selected ward not found');
      }

      // Store location data with ward ID
      const locationData = {
        ...location,
        wardId: selectedWard.id
      };
      localStorage.setItem('voterLocation', JSON.stringify(locationData));
      
      toast({
        title: "Location Confirmed",
        description: "Proceeding to candidate selection...",
      });

      navigate('/voter-candidates');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to proceed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <MapPin className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Select Your Location</CardTitle>
          <CardDescription>
            Choose your County, Constituency, and Ward to view relevant candidates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="county">County</Label>
            <Select value={location.county} onValueChange={(value) => handleLocationChange('county', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county.id} value={county.name}>
                    {county.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constituency">Constituency</Label>
            <Select 
              value={location.constituency} 
              onValueChange={(value) => handleLocationChange('constituency', value)}
              disabled={!location.county}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your constituency" />
              </SelectTrigger>
              <SelectContent>
                {constituencies.map((constituency) => (
                  <SelectItem key={constituency.id} value={constituency.name}>
                    {constituency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">Ward</Label>
            <Select 
              value={location.ward} 
              onValueChange={(value) => handleLocationChange('ward', value)}
              disabled={!location.constituency}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your ward" />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.name}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleProceed}
            className="w-full"
            disabled={!location.county || !location.constituency || !location.ward || isLoading}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            {isLoading ? 'Processing...' : 'Proceed to Candidate Selection'}
          </Button>

          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => navigate('/voter-login')}
            >
              Back to Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterLocationPage;
