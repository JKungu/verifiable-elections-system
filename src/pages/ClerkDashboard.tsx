
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { MapPin, BarChart3, Users, LogOut, Shield, Download, Radio, Vote } from 'lucide-react';
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
  registeredVoters: number;
  lastUpdated: string;
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
  const [locationStats, setLocationStats] = useState<LocationVoteStats | null>(null);
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
          toast({
            title: "New Vote Cast",
            description: `Vote recorded for ${payload.new?.position_id || 'position'}`,
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
          if (payload.eventType === 'UPDATE' && payload.new?.has_voted) {
            toast({
              title: "Voter Registered",
              description: `${payload.new.first_name} ${payload.new.last_name} has voted`,
            });
          }
          loadVoterData();
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
    
    // Find the ward ID for the selected location
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
    
    // If no specific ward, but constituency is selected, get all wards in that constituency
    if (location.constituency !== 'all') {
      const county = COUNTIES.find(c => c.name === location.county);
      if (county) {
        const constituency = county.subcounties.find(sc => sc.name === location.constituency);
        if (constituency) {
          return constituency.wards.map(w => w.id);
        }
      }
    }
    
    // If only county is selected, get all wards in that county
    const county = COUNTIES.find(c => c.name === location.county);
    if (county) {
      return county.subcounties.flatMap(sc => sc.wards.map(w => w.id));
    }
    
    return null;
  };

  const getCandidateDisplayName = (candidateId: string, positionId: string) => {
    const candidateInfo: { [key: string]: { name: string; party: string } } = {
      // Presidential candidates (position 1)
      '1': { name: 'John Kamau', party: 'Democratic Alliance' },
      '2': { name: 'Mary Wanjiku', party: 'Unity Party' },
      '3': { name: 'David Otieno', party: 'Progressive Movement' },
      
      // Governor candidates (position 2)
      'g1': { name: 'Peter Mwangi', party: 'County First' },
      'g2': { name: 'Grace Akinyi', party: 'Development Party' },
      
      // Women Representative candidates (position 3)
      'w1': { name: 'Susan Njeri', party: 'Women First' },
      'w2': { name: 'Margaret Wambui', party: 'Equality Party' },
      
      // MP candidates (position 4)
      'm1': { name: 'Robert Macharia', party: 'Grassroots Party' },
      'm2': { name: 'Lucy Wambui', party: 'Youth Movement' },
      
      // MCA candidates (position 5)
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

      const totalRegistered = allVoters?.length || 0;
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
      console.log('Loading vote data for location:', getLocationDisplayName());

      const { data: votes, error } = await supabase
        .from('votes')
        .select('*');

      if (error) {
        console.error('Error loading votes:', error);
        return;
      }

      // Process vote data - group by position and candidate
      const votesByCandidate: { [key: string]: number } = {};
      
      (votes || []).forEach((vote: any) => {
        const key = `${vote.position_id}-${vote.candidate_id}`;
        votesByCandidate[key] = (votesByCandidate[key] || 0) + 1;
      });

      const processedData: VoteData[] = [];
      
      // Define all positions and their candidates
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

      let totalVotesCount = 0;
      
      positions.forEach(position => {
        position.candidates.forEach(candidateId => {
          let votes = 0;
          
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

      setVoteData(processedData);

      // Set location statistics
      setLocationStats({
        totalVotes: totalVotesCount,
        voterTurnout: voterStats?.totalVoted || 0,
        registeredVoters: voterStats?.totalRegistered || 0,
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

  const electionPositions = [
    { id: 'President', icon: '🏛️', description: 'Presidential Election' },
    { id: 'Governor', icon: '🏢', description: 'County Governor' },
    { id: 'Women Representative', icon: '👩‍💼', description: 'Women Representative' },
    { id: 'Member of Parliament', icon: '🏛️', description: 'Parliamentary Seat' },
    { id: 'Member of County Assembly', icon: '🏛️', description: 'County Assembly Seat' }
  ];

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
                    Welcome, {clerkData.name} (Reg: {clerkData.registrationNumber}) - Real-time election monitoring
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
              Select Location to Monitor
            </CardTitle>
            <CardDescription>
              Choose a specific location to view voter turnout and vote counts for that area
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

        {/* Voter Statistics */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Real-time Voter Statistics - {getLocationDisplayName()}
              <Badge variant={isRealTimeConnected ? "default" : "destructive"} className="ml-2">
                {isRealTimeConnected ? "LIVE UPDATES" : "OFFLINE"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {voterStats?.totalRegistered || 0}
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
                      {voterStats?.totalVoted || 0}
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
                      {voterStats ? `${voterStats.turnoutPercentage.toFixed(1)}%` : '0%'}
                    </div>
                    <div className="text-sm text-purple-500 dark:text-purple-300">Voter Turnout</div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                      {locationStats?.lastUpdated || new Date().toLocaleString()}
                    </div>
                    <div className="text-sm text-orange-500 dark:text-orange-300">Last Updated</div>
                  </div>
                  <Radio className={`h-8 w-8 ${isRealTimeConnected ? 'text-green-500' : 'text-orange-400'}`} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Election Results by Position */}
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Election Results by Position - {getLocationDisplayName()}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              Real-time vote counts for all electoral positions
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Loading live election data...</p>
              </CardContent>
            </Card>
          ) : (
            electionPositions.map((position) => {
              const positionVotes = getVotesByPosition(position.id);
              const totalVotes = getTotalVotesForPosition(position.id);
              const leadingCandidate = getLeadingCandidate(position.id);

              return (
                <Card key={position.id} className="border-l-4 border-l-blue-500">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-3">
                          <span className="text-2xl">{position.icon}</span>
                          {position.id}
                          {isRealTimeConnected && (
                            <Badge variant="outline" className="text-xs">
                              <Radio className="h-3 w-3 mr-1 text-green-500 animate-pulse" />
                              Live
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {position.description} - {getLocationDisplayName()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-3">
                          <div className="bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span className="text-sm font-medium">Total Votes: {totalVotes}</span>
                            </div>
                          </div>
                        </div>
                        {leadingCandidate && totalVotes > 0 && (
                          <Badge variant="secondary" className="mt-2">
                            🏆 Leading: {leadingCandidate.candidate_name}
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
                            <TableHead className="w-[300px]">Candidate</TableHead>
                            <TableHead>Party</TableHead>
                            <TableHead className="text-right">Votes</TableHead>
                            <TableHead className="text-right">Percentage</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {positionVotes
                            .sort((a, b) => b.votes - a.votes)
                            .map((vote, index) => {
                              const percentage = totalVotes > 0 ? (vote.votes / totalVotes * 100).toFixed(1) : '0.0';
                              const isLeading = index === 0 && totalVotes > 0;

                              return (
                                <TableRow key={vote.candidate_id} className={isLeading ? 'bg-green-50 dark:bg-green-900/20' : ''}>
                                  <TableCell className={`font-medium ${isLeading ? 'text-green-700 dark:text-green-300' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      {isLeading && <span className="text-lg">👑</span>}
                                      {vote.candidate_name}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="outline">{vote.party}</Badge>
                                  </TableCell>
                                  <TableCell className={`text-right font-bold text-lg ${isLeading ? 'text-green-600 dark:text-green-400' : ''}`}>
                                    {vote.votes}
                                    {isRealTimeConnected && vote.votes > 0 && (
                                      <span className="text-xs text-green-500 ml-2 animate-pulse">●</span>
                                    )}
                                  </TableCell>
                                  <TableCell className="text-right text-sm">
                                    <div className={`font-medium ${isLeading ? 'text-green-600' : 'text-gray-600'}`}>
                                      {percentage}%
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-center">
                                    {isLeading ? (
                                      <Badge className="bg-green-600">Leading</Badge>
                                    ) : vote.votes > 0 ? (
                                      <Badge variant="secondary">Active</Badge>
                                    ) : (
                                      <Badge variant="outline">No votes</Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Vote className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-medium mb-2">No votes recorded yet</h3>
                        <p className="text-sm">Monitoring for votes in this position for {getLocationDisplayName()}</p>
                        {isRealTimeConnected && (
                          <div className="mt-4">
                            <Badge variant="outline">
                              <Radio className="h-3 w-3 mr-1 text-green-500 animate-pulse" />
                              Waiting for votes...
                            </Badge>
                          </div>
                        )}
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
