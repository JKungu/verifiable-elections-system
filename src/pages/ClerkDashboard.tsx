import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Users, LogOut, Shield, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { COUNTIES } from '@/data/kenyaLocations';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ClerkData {
  registrationNumber: string;
  name: string;
  phoneNumber: string;
  idNumber: string;
}

interface VoteData {
  position: string;
  candidate_id: string;
  candidate_name: string;
  party: string;
  votes: number;
  location: string;
}

interface LocationVoteStats {
  totalVotes: number;
  voterTurnout: number;
  lastUpdated: string;
}

const ClerkDashboard = () => {
  const [location, setLocation] = useState({
    county: '',
    constituency: '',
    ward: ''
  });
  const [clerkData, setClerkData] = useState<ClerkData | null>(null);
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [locationStats, setLocationStats] = useState<LocationVoteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get counties from Kenya locations data
  const counties = COUNTIES.map(county => county.name);
  
  // Get constituencies for selected county
  const getConstituencies = (countyName: string) => {
    const county = COUNTIES.find(c => c.name === countyName);
    return county ? county.subcounties.map(sc => sc.name) : [];
  };

  // Get wards for selected constituency
  const getWards = (countyName: string, constituencyName: string) => {
    const county = COUNTIES.find(c => c.name === countyName);
    if (!county) return [];
    const constituency = county.subcounties.find(sc => sc.name === constituencyName);
    return constituency ? constituency.wards.map(w => w.name) : [];
  };

  useEffect(() => {
    // Load clerk data
    const storedClerkData = localStorage.getItem('clerkData');
    if (!storedClerkData) {
      navigate('/clerk-login');
      return;
    }
    setClerkData(JSON.parse(storedClerkData));
  }, [navigate]);

  const handleLocationChange = (field: string, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'county' && { constituency: '', ward: '' }),
      ...(field === 'constituency' && { ward: '' })
    }));
  };

  const loadVoteData = async () => {
    if (!location.county) return;
    
    setLoading(true);
    try {
      console.log('Loading vote data for location:', location);

      // Fetch all votes from the database
      const { data: votes, error: votesError } = await supabase
        .from('votes')
        .select(`
          position_id,
          candidate_id,
          created_at,
          voter_id
        `);

      if (votesError) {
        console.error('Error fetching votes:', votesError);
        toast({
          title: "Error",
          description: "Failed to load vote data from database",
          variant: "destructive",
        });
        return;
      }

      console.log('Fetched votes from database:', votes);

      // Fetch voter data to get location information
      const { data: voters, error: votersError } = await supabase
        .from('voters')
        .select('id, location_id');

      if (votersError) {
        console.error('Error fetching voters:', votersError);
      }

      console.log('Fetched voters:', voters);

      // Create a map of voter_id to location
      const voterLocationMap = new Map();
      voters?.forEach(voter => {
        if (voter.location_id) {
          voterLocationMap.set(voter.id, voter.location_id);
        }
      });

      // Filter votes by location - simplified logic
      let filteredVotes = votes || [];
      if (voterLocationMap.size > 0 && location.county) {
        filteredVotes = votes?.filter(vote => {
          if (!vote.voter_id) return false;
          const voterLocation = voterLocationMap.get(vote.voter_id);
          if (!voterLocation) return false;
          
          // For now, show all votes for the selected county
          // In a real system, you would have proper location matching
          // Since we're in demo mode, let's show all available votes
          return true;
        }) || [];
      }

      console.log('Filtered votes for location:', filteredVotes);

      // Process vote data - group by position and candidate
      const votesByCandidate: { [key: string]: number } = {};
      filteredVotes.forEach(vote => {
        const key = `${vote.position_id}-${vote.candidate_id}`;
        votesByCandidate[key] = (votesByCandidate[key] || 0) + 1;
      });

      console.log('Votes by candidate:', votesByCandidate);

      // Create candidate information based on the database structure
      const candidateInfo: { [key: string]: { name: string; party: string } } = {
        'p1': { name: 'John Kamau', party: 'Democratic Alliance' },
        'p2': { name: 'Mary Wanjiku', party: 'Unity Party' },
        'p3': { name: 'David Otieno', party: 'Progressive Movement' },
        'g1': { name: `Peter Mwangi (${location.county})`, party: 'County First' },
        'g2': { name: `Grace Akinyi (${location.county})`, party: 'Development Party' },
        'w1': { name: `Susan Njeri (${location.county})`, party: 'Women First' },
        'w2': { name: `Margaret Wambui (${location.county})`, party: 'Equality Party' },
        'm1': { name: `Robert Macharia (${location.constituency || location.county})`, party: 'Grassroots Party' },
        'm2': { name: `Lucy Wambui (${location.constituency || location.county})`, party: 'Youth Movement' },
        'c1': { name: `Francis Mutua (${location.ward || location.constituency || location.county})`, party: 'Local Development' },
        'c2': { name: `Catherine Wairimu (${location.ward || location.constituency || location.county})`, party: 'Community First' }
      };

      const processedData: VoteData[] = [];
      
      // Process each position
      const positions = [
        { id: 'President', candidates: ['p1', 'p2', 'p3'] },
        { id: 'Governor', candidates: ['g1', 'g2'] },
        { id: 'Women Representative', candidates: ['w1', 'w2'] },
        { id: 'Member of Parliament', candidates: ['m1', 'm2'] },
        { id: 'Member of County Assembly', candidates: ['c1', 'c2'] }
      ];

      let totalVotesCount = 0;
      
      positions.forEach(position => {
        position.candidates.forEach(candidateId => {
          const key = `${position.id}-${candidateId}`;
          const votes = votesByCandidate[key] || 0;
          totalVotesCount += votes;
          const candidate = candidateInfo[candidateId];
          
          if (candidate) {
            processedData.push({
              position: position.id,
              candidate_id: candidateId,
              candidate_name: candidate.name,
              party: candidate.party,
              votes: votes,
              location: `${location.county}${location.constituency ? `, ${location.constituency}` : ''}${location.ward ? `, ${location.ward}` : ''}`
            });
          }
        });
      });

      setVoteData(processedData);

      // Set location statistics
      setLocationStats({
        totalVotes: totalVotesCount,
        voterTurnout: totalVotesCount,
        lastUpdated: new Date().toLocaleString()
      });

      console.log('Processed vote data:', processedData);
      console.log('Location stats:', { totalVotes: totalVotesCount });

    } catch (error) {
      console.error('Error loading vote data:', error);
      toast({
        title: "Error",
        description: "Failed to load vote data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.county) {
      loadVoteData();
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('clerkData');
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    navigate('/clerk-login');
  };

  const exportData = () => {
    const csvData = voteData.map(vote => ({
      Position: vote.position,
      Candidate: vote.candidate_name,
      Party: vote.party,
      Votes: vote.votes,
      Location: vote.location
    }));

    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-data-${location.county}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Export Complete",
      description: "Vote data has been exported successfully.",
    });
  };

  const getVotesByPosition = (position: string) => {
    return voteData.filter(vote => vote.position === position);
  };

  const getTotalVotesForPosition = (position: string) => {
    return getVotesByPosition(position).reduce((total, vote) => total + vote.votes, 0);
  };

  const getLeadingCandidate = (position: string) => {
    const positionVotes = getVotesByPosition(position);
    return positionVotes.reduce((leader, current) => 
      current.votes > (leader?.votes || 0) ? current : leader
    , null);
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
              <div className="flex space-x-2">
                {voteData.length > 0 && (
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                )}
                <Button onClick={handleLogout} variant="outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Location Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              Select Location to Monitor Votes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>County ({counties.length} counties)</Label>
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
                <Label>Constituency ({getConstituencies(location.county).length} constituencies)</Label>
                <Select 
                  value={location.constituency} 
                  onValueChange={(value) => handleLocationChange('constituency', value)}
                  disabled={!location.county}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select constituency" />
                  </SelectTrigger>
                  <SelectContent>
                    {getConstituencies(location.county).map((constituency) => (
                      <SelectItem key={constituency} value={constituency}>{constituency}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Ward ({getWards(location.county, location.constituency).length} wards)</Label>
                <Select 
                  value={location.ward} 
                  onValueChange={(value) => handleLocationChange('ward', value)}
                  disabled={!location.constituency}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    {getWards(location.county, location.constituency).map((ward) => (
                      <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Statistics */}
        {location.county && locationStats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Vote Statistics for {location.county}
                {location.constituency && `, ${location.constituency}`}
                {location.ward && `, ${location.ward}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{locationStats.totalVotes}</div>
                  <div className="text-sm text-blue-500">Total Votes Cast</div>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{locationStats.voterTurnout}</div>
                  <div className="text-sm text-green-500">Voter Participation</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="text-sm font-medium text-purple-600">{locationStats.lastUpdated}</div>
                  <div className="text-sm text-purple-500">Last Updated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vote Results */}
        {location.county && (
          <div className="space-y-6">
            {loading ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Loading vote data from database...</p>
                </CardContent>
              </Card>
            ) : (
              ['President', 'Governor', 'Women Representative', 'Member of Parliament', 'Member of County Assembly'].map((position) => {
                const positionVotes = getVotesByPosition(position);
                const totalVotes = getTotalVotesForPosition(position);
                const leadingCandidate = getLeadingCandidate(position);

                return (
                  <Card key={position}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">{position}</CardTitle>
                          <CardDescription>
                            {location.ward && `${location.ward}, `}
                            {location.constituency && `${location.constituency}, `}
                            {location.county}
                          </CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-2">
                            <Users className="h-4 w-4 text-gray-500" />
                            <span className="text-sm text-gray-600">Total Votes: {totalVotes}</span>
                          </div>
                          {leadingCandidate && (
                            <Badge variant="secondary" className="mt-1">
                              Leading: {leadingCandidate.candidate_name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {positionVotes.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Candidate</TableHead>
                              <TableHead>Party</TableHead>
                              <TableHead className="text-right">Votes</TableHead>
                              <TableHead className="text-right">Percentage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {positionVotes.map((vote) => {
                              const percentage = totalVotes > 0 ? (vote.votes / totalVotes * 100).toFixed(1) : '0.0';
                              const isLeading = leadingCandidate?.candidate_id === vote.candidate_id;

                              return (
                                <TableRow key={vote.candidate_id}>
                                  <TableCell className={`font-medium ${isLeading ? 'text-green-700' : ''}`}>
                                    {vote.candidate_name}
                                    {isLeading && <span className="ml-2">👑</span>}
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{vote.party}</Badge>
                                  </TableCell>
                                  <TableCell className={`text-right font-bold ${isLeading ? 'text-green-600' : ''}`}>
                                    {vote.votes}
                                  </TableCell>
                                  <TableCell className="text-right text-sm text-gray-500">
                                    {percentage}%
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No votes recorded for this position in the selected location.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {!location.county && (
          <Card>
            <CardContent className="text-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">Select Location to Monitor Votes</h3>
              <p className="text-gray-500">Please select a county to view real-time voting data. All 47 counties available.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ClerkDashboard;
