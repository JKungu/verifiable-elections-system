
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, LogOut, Shield, Download, Radio, Users, Vote, BarChart3, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { COUNTIES } from '@/data/kenyaLocations';

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

interface LocationVoterData {
  totalRegistered: number;
  totalVoted: number;
  turnoutPercentage: number;
}

const ClerkDashboard = () => {
  const [location, setLocation] = useState({
    county: 'all',
    constituency: 'all',
    ward: 'all'
  });
  const [clerkData, setClerkData] = useState<ClerkData | null>(null);
  const [voteData, setVoteData] = useState<VoteData[]>([]);
  const [voterStats, setVoterStats] = useState<LocationVoterData | null>(null);
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

  // Set up real-time subscription for votes and voters
  useEffect(() => {
    console.log('Setting up real-time subscriptions...');
    
    const votesChannel = supabase
      .channel('votes-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        (payload) => {
          console.log('Real-time vote update received:', payload);
          const newData = payload.new as any;
          toast({
            title: "New Vote Cast",
            description: `Vote recorded for ${newData?.position_id || 'position'}`,
          });
          loadVoteData();
        }
      )
      .subscribe((status) => {
        console.log('Votes subscription status:', status);
        setIsRealTimeConnected(status === 'SUBSCRIBED');
      });

    const votersChannel = supabase
      .channel('voters-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'voters'
        },
        (payload) => {
          console.log('Real-time voter update received:', payload);
          const newData = payload.new as any;
          if (payload.eventType === 'UPDATE' && newData?.has_voted) {
            toast({
              title: "Voter Registered",
              description: `${newData.first_name} ${newData.last_name} has voted`,
            });
          }
          loadVoterData();
          loadVoteData();
        }
      )
      .subscribe();

    if (isRealTimeConnected) {
      toast({
        title: "Real-time Connected",
        description: "Live updates are now active for votes and voters",
      });
    }

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up real-time subscriptions');
      supabase.removeChannel(votesChannel);
      supabase.removeChannel(votersChannel);
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

  const getLocationFilter = () => {
    if (location.county === 'all') return null;
    
    if (location.ward !== 'all') {
      const county = COUNTIES.find(c => c.name === location.county);
      if (county) {
        const constituency = county.subcounties.find(sc => sc.name === location.constituency);
        if (constituency) {
          const ward = constituency.wards.find(w => w.name === location.ward);
          return ward?.id || null;
        }
      }
    }
    
    if (location.constituency !== 'all') {
      const county = COUNTIES.find(c => c.name === location.county);
      if (county) {
        const constituency = county.subcounties.find(sc => sc.name === location.constituency);
        if (constituency) {
          return constituency.wards.map(w => w.id);
        }
      }
    }
    
    const county = COUNTIES.find(c => c.name === location.county);
    if (county) {
      return county.subcounties.flatMap(sc => sc.wards.map(w => w.id));
    }
    
    return null;
  };

  const getCandidateDisplayName = (candidateId: string, positionId: string) => {
    const candidateInfo: { [key: string]: { name: string; party: string } } = {
      '1': { name: 'John Kamau', party: 'Democratic Alliance' },
      '2': { name: 'Mary Wanjiku', party: 'Unity Party' },
      '3': { name: 'David Otieno', party: 'Progressive Movement' },
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

  const loadVoterData = async () => {
    try {
      console.log('Loading voter data for location:', getLocationDisplayName());
      
      let query = supabase.from('voters').select('*');
      
      const locationFilter = getLocationFilter();
      if (locationFilter) {
        if (Array.isArray(locationFilter)) {
          query = query.in('location_id', locationFilter);
        } else {
          query = query.eq('location_id', locationFilter);
        }
      }

      const { data: allVoters, error: allError } = await query;
      const { data: votedVoters, error: votedError } = await query.eq('has_voted', true);

      if (allError || votedError) {
        console.error('Error loading voter data:', allError || votedError);
        return;
      }

      const totalRegistered = 25000;
      const totalVoted = votedVoters?.length || 0;
      const turnoutPercentage = totalRegistered > 0 ? (totalVoted / totalRegistered * 100) : 0;

      setVoterStats({
        totalRegistered,
        totalVoted,
        turnoutPercentage
      });

      console.log(`Voter stats for ${getLocationDisplayName()}: ${totalVoted}/${totalRegistered} (${turnoutPercentage.toFixed(1)}%)`);

    } catch (error) {
      console.error('Error loading voter data:', error);
    }
  };

  const loadVoteData = async () => {
    setLoading(true);
    try {
      console.log('=== LOADING VOTE DATA ===');
      console.log('Loading vote data for location:', getLocationDisplayName());

      const { data: votes, error } = await supabase
        .from('votes')
        .select('*');

      if (error) {
        console.error('Error loading votes:', error);
        return;
      }

      console.log('Raw votes from database:', votes);
      console.log('Number of votes in database:', votes?.length || 0);

      const votesByCandidate: { [key: string]: number } = {};
      
      (votes || []).forEach((vote: any) => {
        const key = `${vote.position_id}-${vote.candidate_id}`;
        votesByCandidate[key] = (votesByCandidate[key] || 0) + 1;
        console.log(`Vote found: Position ${vote.position_id}, Candidate ${vote.candidate_id}, Voter ${vote.voter_id}`);
      });

      console.log('Processed votes by candidate:', votesByCandidate);

      const processedData: VoteData[] = [];
      
      const positions = [
        { 
          id: 'President', 
          position_ids: ['1'], 
          candidates: ['1', '2', '3']
        },
        { 
          id: 'Governor', 
          position_ids: ['2'], 
          candidates: ['g1', 'g2'] 
        },
        { 
          id: 'Women Representative', 
          position_ids: ['3'], 
          candidates: ['w1', 'w2'] 
        },
        { 
          id: 'Member of Parliament', 
          position_ids: ['4'], 
          candidates: ['m1', 'm2'] 
        },
        { 
          id: 'Member of County Assembly', 
          position_ids: ['5'], 
          candidates: ['c1', 'c2'] 
        }
      ];

      positions.forEach(position => {
        console.log(`Processing position: ${position.id}`);
        position.candidates.forEach(candidateId => {
          let actualVotes = 0;
          
          position.position_ids.forEach(positionId => {
            const key = `${positionId}-${candidateId}`;
            const voteCount = votesByCandidate[key] || 0;
            actualVotes += voteCount;
            console.log(`  Candidate ${candidateId} in position ${positionId}: ${voteCount} votes`);
          });

          const candidateInfo = getCandidateDisplayName(candidateId, position.id);
          
          console.log(`  Total votes for ${candidateInfo.name}: ${actualVotes}`);
          
          processedData.push({
            position: position.id,
            candidate_id: candidateId,
            candidate_name: candidateInfo.name,
            party: candidateInfo.party,
            votes: actualVotes,
            location: getLocationDisplayName()
          });
        });
      });

      console.log('Final processed vote data:', processedData);
      setVoteData(processedData);

      console.log('=== VOTE DATA LOADING COMPLETED ===');

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

  // Load data when component mounts and when location changes
  useEffect(() => {
    loadVoterData();
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
      LastUpdated: new Date().toLocaleString()
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

  const getTotalVotesAcrossAllPositions = () => {
    return voteData.reduce((total, vote) => total + vote.votes, 0);
  };

  if (!clerkData) {
    return <div>Loading...</div>;
  }

  const electionPositions = [
    { id: 'President', icon: '🏛️', description: 'Presidential Election' },
    { id: 'Governor', icon: '🏢', description: 'County Governor' },
    { id: 'Women Representative', icon: '👩‍💼', description: 'Women Representative' },
    { id: 'Member of Parliament', icon: '🏛️', description: 'Parliamentary Seat' },
    { id: 'Member of County Assembly', icon: '🏛️', description: 'County Assembly Seat' }
  ];

  const renderPositionTable = (position: any) => {
    const positionVotes = voteData.filter(vote => vote.position === position.id);
    const totalVotes = positionVotes.reduce((total, vote) => total + vote.votes, 0);
    const sortedVotes = positionVotes.sort((a, b) => b.votes - a.votes);

    return (
      <Card key={position.id} className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <span className="text-xl">{position.icon}</span>
              {position.id}
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline" className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                Turnout: {totalVotes}
              </Badge>
              <Badge variant="outline" className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                {sortedVotes.length} Candidates
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedVotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="dark:bg-gray-800 hover:dark:bg-gray-700 border-b dark:border-gray-700">
                  <TableHead className="font-semibold dark:text-gray-200">Candidate</TableHead>
                  <TableHead className="font-semibold dark:text-gray-200">Party</TableHead>
                  <TableHead className="font-semibold text-center dark:text-gray-200">Votes</TableHead>
                  <TableHead className="font-semibold text-center dark:text-gray-200">Percentage</TableHead>
                  <TableHead className="font-semibold text-center dark:text-gray-200">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedVotes.map((vote, index) => {
                  const percentage = totalVotes > 0 ? (vote.votes / totalVotes * 100) : 0;
                  const isLeading = index === 0 && totalVotes > 0;
                  
                  return (
                    <TableRow key={vote.candidate_id} className={`hover:dark:bg-gray-800 border-b dark:border-gray-700 ${isLeading ? 'dark:bg-green-900/20' : 'dark:bg-transparent'}`}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {isLeading && <span className="text-lg">🏆</span>}
                          {vote.candidate_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200">
                          {vote.party}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${isLeading ? 'text-green-400' : ''}`}>
                          {vote.votes.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-medium ${isLeading ? 'text-green-400' : ''}`}>
                          {percentage.toFixed(1)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {isLeading ? (
                          <Badge className="bg-green-800 text-green-200 border-green-700 hover:bg-green-700">
                            Leading
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400">
                            #{index + 1}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-2">📊</div>
              <p>No votes recorded yet for this position</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
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
                    Election Monitoring Dashboard
                    <div className="flex items-center gap-1">
                      <Radio className={`h-4 w-4 ${isRealTimeConnected ? 'text-green-500' : 'text-red-500'}`} />
                      <span className={`text-sm font-medium ${isRealTimeConnected ? 'text-green-600' : 'text-red-600'}`}>
                        {isRealTimeConnected ? 'LIVE' : 'OFFLINE'}
                      </span>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    Welcome, {clerkData.name} (Reg: {clerkData.registrationNumber}) - Real-time vote monitoring and analytics
                  </CardDescription>
                </div>
              </div>
              <div className="flex space-x-2">
                {voteData.length > 0 && (
                  <Button onClick={exportData} variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
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
              Select Location to Monitor
            </CardTitle>
            <CardDescription>
              Choose a specific location to view detailed voting statistics and candidate performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>County ({counties.length} available)</Label>
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
                <Label>Constituency ({getConstituencies(location.county).length} available)</Label>
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
                <Label>Ward ({getWards(location.county, location.constituency).length} available)</Label>
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

        {/* Real-time Election Statistics */}
        {voterStats && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-time Election Statistics - {getLocationDisplayName()}
                <Badge variant={isRealTimeConnected ? "default" : "destructive"}>
                  {isRealTimeConnected ? "LIVE DATA" : "OFFLINE"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {voterStats.totalRegistered.toLocaleString()}
                      </div>
                      <div className="text-sm text-blue-500 dark:text-blue-300">Registered Voters</div>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
                
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {voterStats.totalVoted.toLocaleString()}
                      </div>
                      <div className="text-sm text-green-500 dark:text-green-300">Voters Participated</div>
                    </div>
                    <Vote className="h-8 w-8 text-green-400" />
                  </div>
                </div>
                
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {voterStats.turnoutPercentage.toFixed(1)}%
                      </div>
                      <div className="text-sm text-purple-500 dark:text-purple-300">Voter Turnout</div>
                    </div>
                    <TrendingUp className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
                
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {getTotalVotesAcrossAllPositions().toLocaleString()}
                      </div>
                      <div className="text-sm text-orange-500 dark:text-orange-300">Total Votes Cast</div>
                    </div>
                    <Vote className="h-8 w-8 text-orange-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Vote Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Quick Vote Summary - {getLocationDisplayName()}</CardTitle>
            <CardDescription>Current vote distribution by electoral positions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {electionPositions.map((position) => {
                const positionVotes = voteData.filter(vote => vote.position === position.id);
                const totalVotes = positionVotes.reduce((total, vote) => total + vote.votes, 0);
                const leader = positionVotes.sort((a, b) => b.votes - a.votes)[0];
                
                return (
                  <div key={position.id} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{position.icon}</span>
                      <div className="text-sm font-medium">{position.id}</div>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Leading: {leader?.candidate_name || 'None'}
                    </div>
                    <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {totalVotes.toLocaleString()} votes
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Election Results by Position */}
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detailed Election Results by Position - {getLocationDisplayName()}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time vote counts and candidate performance across all electoral positions
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading vote data...</p>
              </CardContent>
            </Card>
          ) : (
            electionPositions.map(renderPositionTable)
          )}
        </div>
      </div>
    </div>
  );
};

export default ClerkDashboard;
