
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VoterLocationPage = () => {
  const [location, setLocation] = useState({
    county: '',
    constituency: '',
    ward: ''
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample data - in real app, this would come from API
  const counties = [
    'Nairobi County',
    'Mombasa County',
    'Kisumu County',
    'Nakuru County',
    'Uasin Gishu County'
  ];

  const constituencies = {
    'Nairobi County': ['Westlands', 'Dagoretti North', 'Langata', 'Kasarani', 'Embakasi East'],
    'Mombasa County': ['Mvita', 'Changamwe', 'Jomba', 'Kisauni', 'Nyali'],
    'Kisumu County': ['Kisumu East', 'Kisumu West', 'Kisumu Central', 'Seme', 'Nyando'],
    'Nakuru County': ['Nakuru Town East', 'Nakuru Town West', 'Bahati', 'Subukia', 'Rongai'],
    'Uasin Gishu County': ['Eldoret East', 'Eldoret West', 'Turbo', 'Ainabkoi', 'Kapseret']
  };

  const wards = {
    'Westlands': ['Kitisuru', 'Parklands/Highridge', 'Karura', 'Kangemi', 'Mountain View'],
    'Dagoretti North': ['Kilimani', 'Kawangware', 'Gatina', 'Kileleshwa', 'Kabiro'],
    'Mvita': ['Mji Wa Kale/Makadara', 'Tudor', 'Tononoka', 'Shimanzi/Ganjoni', 'Majengo'],
    'Changamwe': ['Port Reitz', 'Kipevu', 'Airport', 'Changamwe', 'Chaani']
  };

  const handleLocationChange = (field: string, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
      // Reset dependent fields when parent changes
      ...(field === 'county' && { constituency: '', ward: '' }),
      ...(field === 'constituency' && { ward: '' })
    }));
  };

  const handleProceed = () => {
    if (!location.county || !location.constituency || !location.ward) {
      toast({
        title: "Incomplete Selection",
        description: "Please select your County, Constituency, and Ward.",
        variant: "destructive",
      });
      return;
    }

    // Store location data
    localStorage.setItem('voterLocation', JSON.stringify(location));
    
    toast({
      title: "Location Confirmed",
      description: "Proceeding to candidate selection...",
    });

    navigate('/voter-candidates');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
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
                  <SelectItem key={county} value={county}>
                    {county}
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
                {location.county && constituencies[location.county as keyof typeof constituencies]?.map((constituency) => (
                  <SelectItem key={constituency} value={constituency}>
                    {constituency}
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
                {location.constituency && wards[location.constituency as keyof typeof wards]?.map((ward) => (
                  <SelectItem key={ward} value={ward}>
                    {ward}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleProceed}
            className="w-full"
            disabled={!location.county || !location.constituency || !location.ward}
          >
            <ArrowRight className="h-4 w-4 mr-2" />
            Proceed to Candidate Selection
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
