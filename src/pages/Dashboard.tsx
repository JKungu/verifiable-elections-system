
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Vote, Clock, CheckCircle, Users } from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { citizen } = useAuth();

  const { data: activeElections, isLoading: electionsLoading } = useQuery({
    queryKey: ['activeElections'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*, candidates(*)')
        .eq('status', 'active')
        .order('voting_start', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const { data: votingHistory, isLoading: historyLoading } = useQuery({
    queryKey: ['votingHistory', citizen?.id],
    queryFn: async () => {
      if (!citizen?.id) return [];
      
      const { data, error } = await supabase
        .from('voter_ballots')
        .select(`
          *,
          elections (
            title,
            status,
            voting_start,
            voting_end
          )
        `)
        .eq('citizen_id', citizen.id)
        .order('voted_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!citizen?.id,
  });

  if (!citizen) return null;

  const getElectionStatus = (election: any) => {
    const now = new Date();
    const votingStart = new Date(election.voting_start);
    const votingEnd = new Date(election.voting_end);

    if (now < votingStart) return 'upcoming';
    if (now > votingEnd) return 'ended';
    return 'active';
  };

  const hasVoted = (electionId: string) => {
    return votingHistory?.some(vote => vote.election_id === electionId);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome, {citizen.first_name} {citizen.last_name}
        </h1>
        <p className="text-blue-100 mb-4">
          Your secure voting dashboard - participate in democracy digitally
        </p>
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {citizen.user_role === 'voter' ? 'Voter' : 
             citizen.user_role === 'election_authority' ? 'Election Authority' : 
             'System Auditor'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {citizen.verification_status === 'verified' ? 'Verified' : 
             citizen.verification_status === 'pending' ? 'Pending Verification' : 
             'Verification Required'}
          </Badge>
        </div>
      </div>

      {/* Active Elections */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Active Elections</h2>
        {electionsLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-32 bg-gray-200 rounded"></CardContent>
              </Card>
            ))}
          </div>
        ) : activeElections?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active elections at this time</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {activeElections?.map((election) => {
              const status = getElectionStatus(election);
              const voted = hasVoted(election.id);
              
              return (
                <Card key={election.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{election.title}</CardTitle>
                        <CardDescription className="mt-2">
                          {election.description}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {voted && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Voted
                          </Badge>
                        )}
                        <Badge variant={status === 'active' ? 'default' : 'secondary'}>
                          {status === 'active' ? 'Live' : status === 'upcoming' ? 'Upcoming' : 'Ended'}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
                        <div className="flex items-center space-x-1 mb-1">
                          <Clock className="h-4 w-4" />
                          <span>
                            Voting: {format(new Date(election.voting_start), 'MMM d')} - {format(new Date(election.voting_end), 'MMM d, yyyy')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{election.candidates?.length || 0} candidates</span>
                        </div>
                      </div>
                      <div className="space-x-2">
                        <Link to={`/results/${election.id}`}>
                          <Button variant="outline" size="sm">
                            View Results
                          </Button>
                        </Link>
                        {status === 'active' && citizen.verification_status === 'verified' && (
                          <Link to={`/vote/${election.id}`}>
                            <Button size="sm" variant={voted ? 'outline' : 'default'}>
                              <Vote className="h-4 w-4 mr-2" />
                              {voted ? 'Change Vote' : 'Vote Now'}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Voting History */}
      <div>
        <h2 className="text-2xl font-bold mb-6">Your Voting History</h2>
        {historyLoading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-20 bg-gray-200 rounded"></CardContent>
              </Card>
            ))}
          </div>
        ) : votingHistory?.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Vote className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">You haven't participated in any elections yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {votingHistory?.map((vote) => (
              <Card key={vote.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{vote.elections?.title}</h3>
                      <p className="text-sm text-gray-600">
                        Voted on {format(new Date(vote.voted_at!), 'MMM d, yyyy \'at\' h:mm a')}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {vote.elections?.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
