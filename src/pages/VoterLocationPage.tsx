
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { SearchableSelect } from '@/components/LocationSearch';
import { 
  getCounties, 
  getSubcountiesByCounty, 
  getWardsBySubcounty,
  County,
  Subcounty,
  Ward
} from '@/data/kenyaLocations';

const VoterLocationPage = () => {
  const [selectedLocation, setSelectedLocation] = useState({
    county: '',
    subcounty: '',
    ward: ''
  });
  
  const [counties] = useState<County[]>(getCounties());
  const [subcounties, setSubcounties] = useState<Subcounty[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  // Update subcounties when county changes
  useEffect(() => {
    if (selectedLocation.county) {
      const newSubcounties = getSubcountiesByCounty(selectedLocation.county);
      setSubcounties(newSubcounties);
      
      // Clear dependent selections
      setSelectedLocation(prev => ({
        ...prev,
        subcounty: '',
        ward: ''
      }));
      setWards([]);
    } else {
      setSubcounties([]);
      setWards([]);
    }
  }, [selectedLocation.county]);

  // Update wards when subcounty changes
  useEffect(() => {
    if (selectedLocation.subcounty) {
      const newWards = getWardsBySubcounty(selectedLocation.subcounty);
      setWards(newWards);
      
      // Clear ward selection
      setSelectedLocation(prev => ({
        ...prev,
        ward: ''
      }));
    } else {
      setWards([]);
    }
  }, [selectedLocation.subcounty]);

  const handleLocationChange = (field: 'county' | 'subcounty' | 'ward', value: string) => {
    setSelectedLocation(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProceed = async () => {
    if (!selectedLocation.county || !selectedLocation.subcounty || !selectedLocation.ward) {
      toast({
        title: "Incomplete Selection",
        description: "Please select your County, Subcounty, and Ward to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Get the full location details
      const selectedCounty = counties.find(c => c.id === selectedLocation.county);
      const selectedSubcounty = subcounties.find(s => s.id === selectedLocation.subcounty);
      const selectedWard = wards.find(w => w.id === selectedLocation.ward);

      if (!selectedCounty || !selectedSubcounty || !selectedWard) {
        throw new Error('Invalid location selection');
      }

      // Store complete location data
      const locationData = {
        county: {
          id: selectedCounty.id,
          name: selectedCounty.name,
          code: selectedCounty.code
        },
        subcounty: {
          id: selectedSubcounty.id,
          name: selectedSubcounty.name
        },
        ward: {
          id: selectedWard.id,
          name: selectedWard.name
        }
      };

      localStorage.setItem('voterLocation', JSON.stringify(locationData));
      
      toast({
        title: "Location Confirmed",
        description: `Selected: ${selectedWard.name} Ward, ${selectedSubcounty.name}, ${selectedCounty.name}`,
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
            Choose your County, Subcounty, and Ward to view relevant candidates. Use the search feature to quickly find your location.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="county" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              County ({counties.length} available)
            </Label>
            <SearchableSelect
              options={counties}
              value={selectedLocation.county}
              onValueChange={(value) => handleLocationChange('county', value)}
              placeholder="Search and select your county"
              searchPlaceholder="Type to search counties..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subcounty" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Subcounty ({subcounties.length} available)
            </Label>
            <SearchableSelect
              options={subcounties}
              value={selectedLocation.subcounty}
              onValueChange={(value) => handleLocationChange('subcounty', value)}
              placeholder={
                selectedLocation.county 
                  ? "Search and select your subcounty" 
                  : "Select a county first"
              }
              searchPlaceholder="Type to search subcounties..."
              disabled={!selectedLocation.county}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ward" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Ward ({wards.length} available)
            </Label>
            <SearchableSelect
              options={wards}
              value={selectedLocation.ward}
              onValueChange={(value) => handleLocationChange('ward', value)}
              placeholder={
                selectedLocation.subcounty 
                  ? "Search and select your ward" 
                  : "Select a subcounty first"
              }
              searchPlaceholder="Type to search wards..."
              disabled={!selectedLocation.subcounty}
            />
          </div>

          {/* Progress indicator */}
          <div className="flex justify-center space-x-2">
            <div className={`h-2 w-8 rounded-full ${selectedLocation.county ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-8 rounded-full ${selectedLocation.subcounty ? 'bg-blue-600' : 'bg-gray-200'}`} />
            <div className={`h-2 w-8 rounded-full ${selectedLocation.ward ? 'bg-blue-600' : 'bg-gray-200'}`} />
          </div>

          {/* Location Summary */}
          {selectedLocation.county && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-sm text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Selected Location:
              </h4>
              <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">County:</span>
                  <span>{counties.find(c => c.id === selectedLocation.county)?.name}</span>
                </div>
                {selectedLocation.subcounty && (
                  <div className="flex justify-between">
                    <span className="font-medium">Subcounty:</span>
                    <span>{subcounties.find(s => s.id === selectedLocation.subcounty)?.name}</span>
                  </div>
                )}
                {selectedLocation.ward && (
                  <div className="flex justify-between">
                    <span className="font-medium">Ward:</span>
                    <span>{wards.find(w => w.id === selectedLocation.ward)?.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <Button 
            onClick={handleProceed}
            className="w-full"
            disabled={!selectedLocation.county || !selectedLocation.subcounty || !selectedLocation.ward || isLoading}
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
