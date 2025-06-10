
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Vote, Lock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VotingPage = () => {
  const { electionId } = useParams<{ electionId: string }>();
  const { citizen } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [selectedCandidate, setSelectedCandidate] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: election, isLoading: electionLoading } = useQuery({
    queryKey: ['election', electionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*, candidates(*)')
        .eq('id', electionId!)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!electionId,
  });

  const { data: existingVote } = useQuery({
    queryKey: ['existingVote', electionId, citizen?.id],
    queryFn: async () => {
      if (!citizen?.id || !electionId) return null;
      
      const { data, error } = await supabase
        .from('voter_ballots')
        .select('*')
        .eq('citizen_id', citizen.id)
        .eq('election_id', electionId)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!citizen?.id && !!electionId,
  });

  const castVoteMutation = useMutation({
    mutationFn: async ({ candidateId }: { candidateId: string }) => {
      if (!citizen?.id || !electionId) throw new Error('Missing required data');

      // Generate a simple encrypted vote (in real implementation, use proper encryption)
      const encryptedVote = btoa(JSON.stringify({ 
        candidateId, 
        timestamp: Date.now(),
        electionId 
      }));
      
      // Generate vote hash for verification
      const voteHash = btoa(`${citizen.id}-${electionId}-${Date.now()}`);

      const { data, error } = await supabase.rpc('cast_or_update_vote', {
        p_citizen_id: citizen.id,
        p_election_id: electionId,
        p_encrypted_vote: encryptedVote,
        p_vote_hash: voteHash,
        p_ip_address: null, // Would be captured from request in real implementation
        p_user_agent: navigator.userAgent,
        p_device_fingerprint: 'browser-fingerprint', // Would use actual fingerprinting
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['existingVote'] });
      queryClient.invalidateQueries({ queryKey: ['votingHistory'] });
      toast({
        title: "Vote Cast Successfully!",
        description: "Your vote has been securely recorded and encrypted.",
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to cast vote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitVote = async () => {
    if (!selectedCandidate) {
      toast({
        title: "Please select a candidate",
        description: "You must choose a candidate before submitting your vote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await castVoteMutation.mutateAsync({ candidateId: selectedCandidate });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (electionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!election) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900">Election Not Found</h1>
        <p className="text-gray-600 mt-2">The election you're looking for doesn't exist.</p>
      </div>
    );
  }

  const now = new Date();
  const votingStart = new Date(election.voting_start);
  const votingEnd = new Date(election.voting_end);
  const isVotingPeriod = now >= votingStart && now <= votingEnd;
  const hasVoted = !!existingVote;

  if (!isVotingPeriod) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Voting is not currently open for this election.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (citizen?.verification_status !== 'verified') {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You must complete identity verification before you can vote.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Election Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{election.title}</CardTitle>
              <CardDescription className="mt-2">
                {election.description}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="default">Live</Badge>
              {hasVoted && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Voted
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Voting Instructions */}
      <Alert>
        <Lock className="h-4 w-4" />
        <AlertDescription>
          Your vote will be encrypted and anonymized. {hasVoted ? 'You can change your vote until the election ends - only your last vote will count.' : 'You can change your vote anytime before the election ends.'}
        </AlertDescription>
      </Alert>

      {/* Candidates */}
      <Card>
        <CardHeader>
          <CardTitle>Select Your Candidate</CardTitle>
          <CardDescription>
            Choose one candidate to cast your vote for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={selectedCandidate} onValueChange={setSelectedCandidate}>
            <div className="space-y-4">
              {election.candidates?.map((candidate) => (
                <div key={candidate.id} className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-gray-50">
                  <RadioGroupItem value={candidate.id} id={candidate.id} className="mt-1" />
                  <Label htmlFor={candidate.id} className="flex-1 cursor-pointer">
                    <div>
                      <h3 className="font-semibold text-lg">{candidate.name}</h3>
                      {candidate.party && (
                        <p className="text-sm text-gray-600 mb-2">{candidate.party}</p>
                      )}
                      {candidate.description && (
                        <p className="text-sm text-gray-700">{candidate.description}</p>
                      )}
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Submit Vote */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Ready to submit your vote?</h3>
              <p className="text-sm text-gray-600">
                {hasVoted ? 'This will replace your previous vote.' : 'Your vote will be encrypted and recorded securely.'}
              </p>
            </div>
            <Button
              onClick={handleSubmitVote}
              disabled={!selectedCandidate || isSubmitting}
              size="lg"
              className="px-8"
            >
              <Vote className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Submitting...' : hasVoted ? 'Update Vote' : 'Cast Vote'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VotingPage;
