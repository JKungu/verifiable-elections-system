
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { 
  getCounties, 
  getConstituenciesByCounty, 
  getWardsByConstituency,
  County,
  Constituency,
  Ward
} from '@/data/kenyaLocations';

const VoterLocationPage = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    county: '',
    constituency: '',
    ward: ''
  });
  
  const [counties] = useState<County[]>(getCounties());
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update constituencies when county changes
  useEffect(() => {
    if (selectedLocation.county) {
      const newConstituencies = getConstituenciesByCounty(selectedLocation.county);
      setConstituencies(newConstituencies);
      
      // Clear dependent selections
      setSelectedLocation(prev => ({
        ...prev,
        constituency: '',
        ward: ''
      }));
      setWards([]);
    } else {
      setConstituencies([]);
      setWards([]);
    }
  }, [selectedLocation.county]);

  // Update wards when constituency changes
  useEffect(() => {
    if (selectedLocation.constituency) {
      const newWards = getWardsByConstituency(selectedLocation.constituency);
      setWards(newWards);
      
      // Clear ward selection
      setSelectedLocation(prev => ({
        ...prev,
        ward: ''
      }));
    } else {
      setWards([]);
    }
  }, [selectedLocation.constituency]);

  const handleLocationChange = (field: 'county' | 'constituency' | 'ward', value: string) => {
    setSelectedLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceed = async () => {
    if (!selectedLocation.county || !selectedLocation.constituency || !selectedLocation.ward) {
      toast({
        title: "Incomplete Selection",
        description: "Please select your County, Constituency, and Ward.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the full location details
      const selectedCounty = counties.find(c => c.id === selectedLocation.county);
      const selectedConstituency = constituencies.find(c => c.id === selectedLocation.constituency);
      const selectedWard = wards.find(w => w.id === selectedLocation.ward);

      if (!selectedCounty || !selectedConstituency || !selectedWard) {
        throw new Error('Invalid location selection');
      }

      // Store complete location data
      const locationData = {
        county: {
          id: selectedCounty.id,
          name: selectedCounty.name,
          code: selectedCounty.code
        },
        constituency: {
          id: selectedConstituency.id,
          name: selectedConstituency.name
        },
        ward: {
          id: selectedWard.id,
          name: selectedWard.name
        }
      };

      localStorage.setItem('voterLocation', JSON.stringify(locationData));
      
      toast({
        title: "Location Confirmed",
        description: `Selected: ${selectedWard.name} Ward, ${selectedConstituency.name}, ${selectedCounty.name}`,
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
            <Select value={selectedLocation.county} onValueChange={(value) => handleLocationChange('county', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your county" />
              </SelectTrigger>
              <SelectContent>
                {counties.map((county) => (
                  <SelectItem key={county.id} value={county.id}>
                    {county.name} {county.code && `(${county.code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="constituency">Constituency</Label>
            <Select 
              value={selectedLocation.constituency} 
              onValueChange={(value) => handleLocationChange('constituency', value)}
              disabled={!selectedLocation.county}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedLocation.county 
                    ? "Select your constituency" 
                    : "Select a county first"
                } />
              </SelectTrigger>
              <SelectContent>
                {constituencies.map((constituency) => (
                  <SelectItem key={constituency.id} value={constituency.id}>
                    {constituency.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward">Ward</Label>
            <Select 
              value={selectedLocation.ward} 
              onValueChange={(value) => handleLocationChange('ward', value)}
              disabled={!selectedLocation.constituency}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  selectedLocation.constituency 
                    ? "Select your ward" 
                    : "Select a constituency first"
                } />
              </SelectTrigger>
              <SelectContent>
                {wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    {ward.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Location Summary */}
          {selectedLocation.county && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2">Selected Location:</h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <div>County: {counties.find(c => c.id === selectedLocation.county)?.name}</div>
                {selectedLocation.constituency && (
                  <div>Constituency: {constituencies.find(c => c.id === selectedLocation.constituency)?.name}</div>
                )}
                {selectedLocation.ward && (
                  <div>Ward: {wards.find(w => w.id === selectedLocation.ward)?.name}</div>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={handleProceed}
            className="w-full"
            disabled={!selectedLocation.county || !selectedLocation.constituency || !selectedLocation.ward || isLoading}
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
