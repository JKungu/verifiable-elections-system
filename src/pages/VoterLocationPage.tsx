
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
      // For now, use hardcoded counties until the database schema is fully updated
      const hardcodedCounties: Location[] = [
        { id: '1', name: 'Nairobi County', type: 'county', parent_id: null },
        { id: '2', name: 'Mombasa County', type: 'county', parent_id: null },
        { id: '3', name: 'Kisumu County', type: 'county', parent_id: null },
        { id: '4', name: 'Nakuru County', type: 'county', parent_id: null },
        { id: '5', name: 'Kiambu County', type: 'county', parent_id: null },
      ];
      setCounties(hardcodedCounties);
    };

    loadCounties();
  }, []);

  // Load constituencies when county changes
  useEffect(() => {
    if (location.county) {
      const loadConstituencies = async () => {
        // Hardcoded constituencies based on selected county
        let hardcodedConstituencies: Location[] = [];
        
        if (location.county === 'Nairobi County') {
          hardcodedConstituencies = [
            { id: '6', name: 'Westlands', type: 'constituency', parent_id: '1' },
            { id: '7', name: 'Langata', type: 'constituency', parent_id: '1' },
            { id: '8', name: 'Kasarani', type: 'constituency', parent_id: '1' },
            { id: '9', name: 'Starehe', type: 'constituency', parent_id: '1' },
          ];
        } else if (location.county === 'Mombasa County') {
          hardcodedConstituencies = [
            { id: '10', name: 'Mvita', type: 'constituency', parent_id: '2' },
            { id: '11', name: 'Changamwe', type: 'constituency', parent_id: '2' },
            { id: '12', name: 'Jomba', type: 'constituency', parent_id: '2' },
          ];
        } else {
          hardcodedConstituencies = [
            { id: '13', name: 'Sample Constituency 1', type: 'constituency', parent_id: '3' },
            { id: '14', name: 'Sample Constituency 2', type: 'constituency', parent_id: '3' },
          ];
        }

        setConstituencies(hardcodedConstituencies);
      };

      loadConstituencies();
    } else {
      setConstituencies([]);
    }
  }, [location.county]);

  // Load wards when constituency changes
  useEffect(() => {
    if (location.constituency) {
      const loadWards = async () => {
        // Hardcoded wards based on selected constituency
        let hardcodedWards: Location[] = [];
        
        if (location.constituency === 'Westlands') {
          hardcodedWards = [
            { id: '15', name: 'Kitisuru', type: 'ward', parent_id: '6' },
            { id: '16', name: 'Parklands', type: 'ward', parent_id: '6' },
            { id: '17', name: 'Highridge', type: 'ward', parent_id: '6' },
          ];
        } else if (location.constituency === 'Langata') {
          hardcodedWards = [
            { id: '18', name: 'Karen', type: 'ward', parent_id: '7' },
            { id: '19', name: 'Nairobi West', type: 'ward', parent_id: '7' },
            { id: '20', name: 'Mugumo-ini', type: 'ward', parent_id: '7' },
          ];
        } else {
          hardcodedWards = [
            { id: '21', name: 'Sample Ward 1', type: 'ward', parent_id: '8' },
            { id: '22', name: 'Sample Ward 2', type: 'ward', parent_id: '8' },
          ];
        }

        setWards(hardcodedWards);
      };

      loadWards();
    } else {
      setWards([]);
    }
  }, [location.constituency]);

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
