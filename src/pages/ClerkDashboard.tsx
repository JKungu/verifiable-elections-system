
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Users, LogOut, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoteCount {
  [candidateId: string]: number;
}

interface Candidate {
  id: string;
  name: string;
  idNumber: string;
  position: string;
  party: string;
}

const ClerkDashboard = () => {
  const [location, setLocation] = useState({
    county: '',
    constituency: '',
    ward: ''
  });
  const [voteCounts, setVoteCounts] = useState<VoteCount>({});
  const [clerkData, setClerkData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample data
  const counties = ['Nairobi County', 'Mombasa County', 'Kisumu County', 'Nakuru County'];
  const constituencies = {
    'Nairobi County': ['Westlands', 'Dagoretti North', 'Langata', 'Kasarani'],
    'Mombasa County': ['Mvita', 'Changamwe', 'Jomba', 'Kisauni'],
  };
  const wards = {
    'Westlands': ['Kitisuru', 'Parklands/Highridge', 'Karura', 'Kangemi'],
    'Mvita': ['Mji Wa Kale/Makadara', 'Tudor', 'Tononoka', 'Shimanzi/Ganjoni'],
  };

  const candidatesByPosition = {
    'President': [
      { id: 'p1', name: 'John Kamau', idNumber: '12345678', position: 'President', party: 'Democratic Alliance' },
      { id: 'p2', name: 'Mary Wanjiku', idNumber: '87654321', position: 'President', party: 'Unity Party' },
      { id: 'p3', name: 'David Otieno', idNumber: '11223344', position: 'President', party: 'Progressive Movement' }
    ],
    'Governor': [
      { id: 'g1', name: 'Peter Mwangi', idNumber: '55667788', position: 'Governor', party: 'County First' },
      { id: 'g2', name: 'Grace Akinyi', idNumber: '99887766', position: 'Governor', party: 'Development Party' }
    ],
    'Senator': [
      { id: 's1', name: 'James Kiprotich', idNumber: '33445566', position: 'Senator', party: 'Reform Alliance' },
      { id: 's2', name: 'Susan Njeri', idNumber: '77889900', position: 'Senator', party: 'People\'s Choice' }
    ],
    'Member of Parliament': [
      { id: 'm1', name: 'Robert Macharia', idNumber: '44556677', position: 'Member of Parliament', party: 'Grassroots Party' },
      { id: 'm2', name: 'Lucy Wambui', idNumber: '66778899', position: 'Member of Parliament', party: 'Youth Movement' },
      { id: 'm3', name: 'Joseph Kiplagat', idNumber: '22334455', position: 'Member of Parliament', party: 'Economic Freedom' }
    ],
    'Member of County Assembly': [
      { id: 'c1', name: 'Francis Mutua', idNumber: '11335577', position: 'Member of County Assembly', party: 'Local Development' },
      { id: 'c2', name: 'Catherine Wairimu', idNumber: '99113355', position: 'Member of County Assembly', party: 'Community First' }
    ]
  };

  useEffect(() => {
    // Load clerk data
    const storedClerkData = localStorage.getItem('clerkData');
    if (!storedClerkData) {
      navigate('/clerk-login');
      return;
    }
    setClerkData(JSON.parse(storedClerkData));

    // Load vote counts
    const storedVotes = localStorage.getItem('allVotes');
    if (storedVotes) {
      setVoteCounts(JSON.parse(storedVotes));
    }
  }, [navigate]);

  const handleLocationChange = (field: string, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'county' && { constituency: '', ward: '' }),
      ...(field === 'constituency' && { ward: '' })
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem('clerkData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/clerk-login');
  };

  const getVoteCount = (candidateId: string): number => {
    return voteCounts[candidateId] || 0;
  };

  const getTotalVotesForPosition = (position: string): number => {
    const candidates = candidatesByPosition[position as keyof typeof candidatesByPosition];
    return candidates.reduce((total, candidate) => total + getVoteCount(candidate.id), 0);
  };

  const getLeadingCandidate = (position: string): Candidate | null => {
    const candidates = candidatesByPosition[position as keyof typeof candidatesByPosition];
    let leadingCandidate = null;
    let maxVotes = 0;

    candidates.forEach(candidate => {
      const votes = getVoteCount(candidate.id);
      if (votes > maxVotes) {
        maxVotes = votes;
        leadingCandidate = candidate;
      }
    });

    return leadingCandidate;
  };

  if (!clerkData) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-green-600 p-3 rounded-full">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Clerk Dashboard</CardTitle>
                  <CardDescription>
                    Welcome, {clerkData.name} (Reg: {clerkData.registrationNumber})
                  </CardDescription>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Location Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Select Location to View Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>County</Label>
                <Select value={location.county} onValueChange={(value) => handleLocationChange('county', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select county" />
                  </SelectTrigger>
                  <SelectContent>
                    {counties.map((county) => (
                      <SelectItem key={county} value={county}>{county}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Constituency</Label>
                <Select 
                  value={location.constituency} 
                  onValueChange={(value) => handleLocationChange('constituency', value)}
                  disabled={!location.county}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select constituency" />
                  </SelectTrigger>
                  <SelectContent>
                    {location.county && constituencies[location.county as keyof typeof constituencies]?.map((constituency) => (
                      <SelectItem key={constituency} value={constituency}>{constituency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ward</Label>
                <Select 
                  value={location.ward} 
                  onValueChange={(value) => handleLocationChange('ward', value)}
                  disabled={!location.constituency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {location.constituency && wards[location.constituency as keyof typeof wards]?.map((ward) => (
                      <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vote Results */}
        {location.ward && (
          <div className="space-y-6">
            {Object.keys(candidatesByPosition).map((position) => {
              const candidates = candidatesByPosition[position as keyof typeof candidatesByPosition];
              const totalVotes = getTotalVotesForPosition(position);
              const leadingCandidate = getLeadingCandidate(position);

              return (
                <Card key={position}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{position}</CardTitle>
                        <CardDescription>
                          {location.ward}, {location.constituency}, {location.county}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Total Votes: {totalVotes}</span>
                        </div>
                        {leadingCandidate && (
                          <Badge variant="secondary" className="mt-1">
                            Leading: {leadingCandidate.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {candidates.map((candidate) => {
                        const votes = getVoteCount(candidate.id);
                        const percentage = totalVotes > 0 ? (votes / totalVotes * 100).toFixed(1) : '0.0';
                        const isLeading = leadingCandidate?.id === candidate.id;

                        return (
                          <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center space-x-4">
                                <div>
                                  <h3 className={`font-semibold ${isLeading ? 'text-green-700' : ''}`}>
                                    {candidate.name}
                                    {isLeading && <span className="ml-2 text-green-600">👑</span>}
                                  </h3>
                                  <p className="text-sm text-gray-600">ID: {candidate.idNumber}</p>
                                  <Badge variant="outline" className="mt-1">
                                    {candidate.party}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-2xl font-bold ${isLeading ? 'text-green-600' : 'text-gray-900'}`}>
                                {votes}
                              </div>
                              <div className="text-sm text-gray-500">
                                {percentage}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!location.ward && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Select Location to View Results</h3>
              <p className="text-gray-500">Please select a county, constituency, and ward to view voting results.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClerkDashboard;
