import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Users, LogOut, Shield, Download, Radio } from 'lucide-react';
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
    county: 'all',
    constituency: 'all',
    ward: 'all'
  });
  const [clerkData, setClerkData] = useState<ClerkData | null>(null);
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [locationStats, setLocationStats] = useState<LocationVoteStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Get counties from Kenya locations data
  const counties = COUNTIES.map(county => county.name);
  
  // Get constituencies for selected county
  const getConstituencies = (countyName: string) => {
    if (countyName === 'all') return [];
    const county = COUNTIES.find(c => c.name === countyName);
    return county ? county.subcounties.map(sc => sc.name) : [];
  };

  // Get wards for selected constituency
  const getWards = (countyName: string, constituencyName: string) => {
    if (countyName === 'all' || constituencyName === 'all') return [];
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

  // Set up real-time subscription for votes
  useEffect(() => {
    console.log('Setting up real-time subscription for votes...');
    
    const channel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          console.log('Real-time vote update received:', payload);
          
          // Show toast notification for new votes
          if (payload.eventType === 'INSERT') {
            toast({
              title: "New Vote Cast",
              description: `Vote received for ${payload.new.position_id}`,
            });
          }
          
          // Refresh vote data immediately when changes occur
          loadVoteData();
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
        
        if (status === 'SUBSCRIBED') {
          toast({
            title: "Real-time Connected",
            description: "Live vote updates are now active",
          });
        }
      });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(channel);
      setIsRealTimeConnected(false);
    };
  }, [toast]);

  const handleLocationChange = (field: string, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value,
      ...(field === 'county' && { constituency: 'all', ward: 'all' }),
      ...(field === 'constituency' && { ward: 'all' })
    }));
  };

  const getLocationDisplayName = () => {
    if (location.county === 'all') return 'All Locations';
    
    let displayName = location.county;
    if (location.constituency !== 'all') {
      displayName += `, ${location.constituency}`;
    }
    if (location.ward !== 'all') {
      displayName += `, ${location.ward}`;
    }
    return displayName;
  };

  const getCandidateDisplayName = (candidateId: string, positionId: string) => {
    // Map position names to readable format
    const positionMap: { [key: string]: string } = {
      '1': 'President',
      '2': 'Governor', 
      '3': 'Women Representative',
      '4': 'Member of Parliament',
      '5': 'Member of County Assembly'
    };

    const readablePosition = positionMap[positionId] || positionId;

    // Base candidate information with more candidates
    const candidateInfo: { [key: string]: { name: string; party: string } } = {
      // Presidential candidates
      '1': { name: 'John Kamau', party: 'Democratic Alliance' },
      '2': { name: 'Mary Wanjiku', party: 'Unity Party' },
      '3': { name: 'David Otieno', party: 'Progressive Movement' },
      
      // Governor candidates (county specific)
      'gov-county-022-1': { name: 'Peter Mwangi', party: 'County First' },
      'gov-county-022-2': { name: 'Grace Akinyi', party: 'Development Party' },
      
      // Women Representative candidates (county specific)
      'wr-county-022-1': { name: 'Susan Njeri', party: 'Women First' },
      'wr-county-022-2': { name: 'Margaret Wambui', party: 'Equality Party' },
      
      // MP candidates (constituency specific)
      'mp-subcounty-111-1': { name: 'Robert Macharia', party: 'Grassroots Party' },
      'mp-subcounty-111-2': { name: 'Lucy Wambui', party: 'Youth Movement' },
      
      // MCA candidates (ward specific)
      'mca-ward-0547-1': { name: 'Francis Mutua', party: 'Local Development' },
      'mca-ward-0547-2': { name: 'Catherine Wairimu', party: 'Community First' },
      
      // Additional fallback candidates for different IDs
      'p1': { name: 'John Kamau', party: 'Democratic Alliance' },
      'p2': { name: 'Mary Wanjiku', party: 'Unity Party' },
      'p3': { name: 'David Otieno', party: 'Progressive Movement' },
      'g1': { name: 'Peter Mwangi', party: 'County First' },
      'g2': { name: 'Grace Akinyi', party: 'Development Party' },
      'w1': { name: 'Susan Njeri', party: 'Women First' },
      'w2': { name: 'Margaret Wambui', party: 'Equality Party' },
      'm1': { name: 'Robert Macharia', party: 'Grassroots Party' },
      'm2': { name: 'Lucy Wambui', party: 'Youth Movement' },
      'c1': { name: 'Francis Mutua', party: 'Local Development' },
      'c2': { name: 'Catherine Wairimu', party: 'Community First' }
    };

    const candidate = candidateInfo[candidateId];
    if (!candidate) return { name: `Candidate ${candidateId}`, party: 'Independent' };

    return { name: candidate.name, party: candidate.party };
  };

  const loadVoteData = async () => {
    setLoading(true);
    try {
      console.log('=== DEBUGGING VOTE DATA LOADING ===');

      // Check the votes table first
      console.log('Checking votes table...');
      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*');
      
      console.log('Votes table data:', votesData);
      console.log('Votes table error:', votesError);

      // Check the voters table to see who has voted
      console.log('Checking voters table...');
      const { data: votersData, error: votersError } = await supabase
        .from('voters')
        .select('*')
        .eq('has_voted', true);
      
      console.log('Voters who have voted:', votersData);
      console.log('Voters table error:', votersError);

      // Check ballots table
      console.log('Checking ballots table...');
      const { data: ballotsData, error: ballotsError } = await supabase
        .from('ballots')
        .select('*');
      
      console.log('Ballots table data:', ballotsData);
      console.log('Ballots table error:', ballotsError);

      // Check voter_ballots table
      console.log('Checking voter_ballots table...');
      const { data: voterBallotsData, error: voterBallotsError } = await supabase
        .from('voter_ballots')
        .select('*');
      
      console.log('Voter ballots table data:', voterBallotsData);
      console.log('Voter ballots table error:', voterBallotsError);

      // Use the votes table data if it exists, otherwise try to work with available data
      const votes = votesData || [];
      console.log('Processing votes:', votes);

      // If we have no votes in the votes table but have voters who voted, 
      // this indicates a data consistency issue
      if (votes.length === 0 && votersData && votersData.length > 0) {
        console.log('ISSUE FOUND: Voters have voted but no votes recorded in votes table');
        console.log(`Found ${votersData.length} voters who have voted, but 0 votes in votes table`);
        
        // For now, show a message to the user about this data inconsistency
        toast({
          title: "Data Inconsistency Detected",
          description: `Found ${votersData.length} voters who have voted, but no vote records. This may indicate a database sync issue.`,
          variant: "destructive",
        });
      }

      if (votes.length === 0) {
        console.log('No votes found in votes table');
        setVoteData([]);
        setLocationStats({
          totalVotes: 0,
          voterTurnout: votersData ? votersData.length : 0, // Show voter turnout even if votes aren't recorded properly
          lastUpdated: new Date().toLocaleString()
        });
        return;
      }

      // Process vote data - group by position and candidate
      const votesByCandidate: { [key: string]: number } = {};
      
      votes.forEach((vote: any) => {
        console.log('Processing vote:', vote);
        const key = `${vote.position_id}-${vote.candidate_id}`;
        votesByCandidate[key] = (votesByCandidate[key] || 0) + 1;
      });

      console.log('Votes grouped by candidate:', votesByCandidate);

      const processedData: VoteData[] = [];
      
      // Define all possible positions and their candidates
      const positions = [
        { 
          id: 'President', 
          position_ids: ['1'], 
          candidates: ['1', '2', '3', 'p1', 'p2', 'p3'] 
        },
        { 
          id: 'Governor', 
          position_ids: ['2'], 
          candidates: ['gov-county-022-1', 'gov-county-022-2', 'g1', 'g2'] 
        },
        { 
          id: 'Women Representative', 
          position_ids: ['3'], 
          candidates: ['wr-county-022-1', 'wr-county-022-2', 'w1', 'w2'] 
        },
        { 
          id: 'Member of Parliament', 
          position_ids: ['4'], 
          candidates: ['mp-subcounty-111-1', 'mp-subcounty-111-2', 'm1', 'm2'] 
        },
        { 
          id: 'Member of County Assembly', 
          position_ids: ['5'], 
          candidates: ['mca-ward-0547-1', 'mca-ward-0547-2', 'c1', 'c2'] 
        }
      ];

      let totalVotesCount = 0;
      
      positions.forEach(position => {
        position.candidates.forEach(candidateId => {
          let votes = 0;
          
          // Check all possible position IDs for this candidate
          position.position_ids.forEach(positionId => {
            const key = `${positionId}-${candidateId}`;
            votes += votesByCandidate[key] || 0;
          });
          
          totalVotesCount += votes;
          
          const candidateInfo = getCandidateDisplayName(candidateId, position.id);
          
          processedData.push({
            position: position.id,
            candidate_id: candidateId,
            candidate_name: candidateInfo.name,
            party: candidateInfo.party,
            votes: votes,
            location: getLocationDisplayName()
          });
        });
      });

      console.log('Final processed vote data:', processedData);
      console.log('Total votes counted:', totalVotesCount);

      setVoteData(processedData);

      // Set location statistics
      setLocationStats({
        totalVotes: totalVotesCount,
        voterTurnout: votersData ? votersData.length : totalVotesCount, // Use actual voter count if available
        lastUpdated: new Date().toLocaleString()
      });

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

  // Load vote data when component mounts and when location changes
  useEffect(() => {
    loadVoteData();
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
      Location: vote.location,
      LastUpdated: locationStats?.lastUpdated || new Date().toLocaleString()
    }));

    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vote-data-${location.county !== 'all' ? location.county : 'all'}-${Date.now()}.csv`;
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
                  <CardTitle className="text-2xl flex items-center gap-2">
                    Clerk Dashboard
                    <div className="flex items-center gap-1">
                      <Radio className={`h-4 w-4 ${isRealTimeConnected ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm ${isRealTimeConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isRealTimeConnected ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Welcome, {clerkData.name} (Reg: {clerkData.registrationNumber}) - Monitoring vote updates
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
              Select Location to Filter Results (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>County ({counties.length} counties)</Label>
                <Select value={location.county} onValueChange={(value) => handleLocationChange('county', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="All counties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Counties</SelectItem>
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
                  disabled={location.county === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All constituencies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Constituencies</SelectItem>
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
                  disabled={location.constituency === 'all'}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All wards" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Wards</SelectItem>
                    {getWards(location.county, location.constituency).map((ward) => (
                      <SelectItem key={ward} value={ward}>{ward}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vote Statistics */}
        {locationStats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Vote Statistics for {getLocationDisplayName()}
                <Badge variant={isRealTimeConnected ? "default" : "destructive"} className="ml-2">
                  {isRealTimeConnected ? "LIVE UPDATES" : "OFFLINE"}
                </Badge>
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
                        <CardTitle className="text-xl flex items-center gap-2">
                          {position}
                          {isRealTimeConnected && (
                            <Badge variant="outline" className="text-xs">
                              <Radio className="h-3 w-3 mr-1 text-green-500" />
                              Live
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {getLocationDisplayName()} - Results
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Total Votes: {totalVotes}</span>
                        </div>
                        {leadingCandidate && totalVotes > 0 && (
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
                            const isLeading = leadingCandidate?.candidate_id === vote.candidate_id && totalVotes > 0;

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
                                  {isRealTimeConnected && vote.votes > 0 && (
                                    <span className="text-xs text-green-500 ml-1">●</span>
                                  )}
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
                        <Radio className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                        No votes recorded yet for this position. Monitoring for updates.
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ClerkDashboard;
