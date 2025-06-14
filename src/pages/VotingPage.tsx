
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Vote, ArrowLeft, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface Candidate {
  id: string;
  name: string;
  party: string;
  image?: string;
}

interface Position {
  id: string;
  title: string;
  candidates: Candidate[];
}

interface VoteSelection {
  [positionId: string]: string; // position -> candidate id
}

const VotingPage = () => {
  const [positions] = useState<Position[]>([
    {
      id: '1',
      title: 'President of Kenya',
      candidates: [
        { id: '1', name: 'John Kamau', party: 'Democratic Alliance' },
        { id: '2', name: 'Mary Wanjiku', party: 'Unity Party' },
        { id: '3', name: 'David Otieno', party: 'Progressive Movement' }
      ]
    },
    {
      id: '2',
      title: 'Governor',
      candidates: [
        { id: 'g1', name: 'Peter Mwangi', party: 'County First' },
        { id: 'g2', name: 'Grace Akinyi', party: 'Development Party' }
      ]
    },
    {
      id: '3',
      title: 'Women Representative',
      candidates: [
        { id: 'w1', name: 'Susan Njeri', party: 'Women First' },
        { id: 'w2', name: 'Margaret Wambui', party: 'Equality Party' }
      ]
    },
    {
      id: '4',
      title: 'Member of Parliament',
      candidates: [
        { id: 'm1', name: 'Robert Macharia', party: 'Grassroots Party' },
        { id: 'm2', name: 'Lucy Wambui', party: 'Youth Movement' }
      ]
    },
    {
      id: '5',
      title: 'Member of County Assembly',
      candidates: [
        { id: 'c1', name: 'Francis Mutua', party: 'Local Development' },
        { id: 'c2', name: 'Catherine Wairimu', party: 'Community First' }
      ]
    }
  ]);

  const [selections, setSelections] = useState<VoteSelection>({});
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voterData, setVoterData] = useState<any>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Get voter data from navigation state
    const voter = location.state?.voter;
    if (!voter) {
      toast({
        title: "Access Denied",
        description: "Please login first to access voting.",
        variant: "destructive",
      });
      navigate('/voter-login');
      return;
    }
    setVoterData(voter);
  }, [location.state, navigate, toast]);

  const handleCandidateSelect = (positionId: string, candidateId: string) => {
    setSelections(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const handleNext = () => {
    if (currentPositionIndex < positions.length - 1) {
      setCurrentPositionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPositionIndex > 0) {
      setCurrentPositionIndex(prev => prev - 1);
    }
  };

  const handleSubmitVote = async () => {
    if (!voterData) {
      toast({
        title: "Error",
        description: "Voter data not found. Please login again.",
        variant: "destructive",
      });
      return;
    }

    // Check if all positions have selections
    const unselectedPositions = positions.filter(pos => !selections[pos.id]);
    if (unselectedPositions.length > 0) {
      toast({
        title: "Incomplete Ballot",
        description: `Please select candidates for: ${unselectedPositions.map(p => p.title).join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    console.log('=== STARTING BULLETPROOF VOTE SUBMISSION ===');

    try {
      // PHASE 1: CRITICAL PRE-CHECKS
      console.log('PHASE 1: Running critical pre-checks...');
      
      // Verify voter exists and hasn't voted
      const { data: currentVoter, error: voterCheckError } = await supabase
        .from('voters')
        .select('id, has_voted, first_name, last_name, id_number')
        .eq('id', voterData.id)
        .single();

      if (voterCheckError) {
        console.error('Voter check failed:', voterCheckError);
        throw new Error(`Cannot verify voter: ${voterCheckError.message}`);
      }

      if (!currentVoter) {
        throw new Error('Voter record not found');
      }

      if (currentVoter.has_voted) {
        throw new Error('This voter has already cast their vote');
      }

      console.log('✅ Voter verified:', currentVoter);

      // PHASE 2: PREPARE VOTE BATCH WITH VALIDATION
      console.log('PHASE 2: Preparing vote batch...');
      
      const voteBatch = [];
      for (const [positionId, candidateId] of Object.entries(selections)) {
        if (!positionId || !candidateId) {
          throw new Error(`Invalid vote data: position=${positionId}, candidate=${candidateId}`);
        }

        const voteRecord = {
          voter_id: voterData.id,
          position_id: positionId,
          candidate_id: candidateId
        };

        console.log('Prepared vote:', voteRecord);
        voteBatch.push(voteRecord);
      }

      if (voteBatch.length !== positions.length) {
        throw new Error(`Vote count mismatch: expected ${positions.length}, prepared ${voteBatch.length}`);
      }

      console.log('✅ Vote batch prepared:', voteBatch);

      // PHASE 3: EXECUTE ATOMIC VOTE INSERTION
      console.log('PHASE 3: Executing atomic vote insertion...');
      
      const { data: insertedVotes, error: voteInsertError } = await supabase
        .from('votes')
        .insert(voteBatch)
        .select('*');

      if (voteInsertError) {
        console.error('Vote insertion failed:', voteInsertError);
        throw new Error(`Failed to insert votes: ${voteInsertError.message}`);
      }

      if (!insertedVotes || insertedVotes.length === 0) {
        throw new Error('Vote insertion returned no data - operation may have failed');
      }

      if (insertedVotes.length !== voteBatch.length) {
        throw new Error(`Vote insertion incomplete: expected ${voteBatch.length}, inserted ${insertedVotes.length}`);
      }

      console.log('✅ Votes successfully inserted:', insertedVotes);

      // PHASE 4: VERIFY VOTES IN DATABASE
      console.log('PHASE 4: Verifying votes in database...');
      
      const { data: verificationVotes, error: verifyError } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', voterData.id);

      if (verifyError) {
        console.error('Vote verification failed:', verifyError);
        throw new Error(`Vote verification error: ${verifyError.message}`);
      }

      if (!verificationVotes || verificationVotes.length !== voteBatch.length) {
        console.error('Vote verification mismatch:', {
          expected: voteBatch.length,
          found: verificationVotes?.length || 0,
          votes: verificationVotes
        });
        throw new Error(`Vote verification failed: found ${verificationVotes?.length || 0} votes, expected ${voteBatch.length}`);
      }

      console.log('✅ Votes verified in database:', verificationVotes);

      // PHASE 5: MARK VOTER AS VOTED (ONLY AFTER SUCCESSFUL VERIFICATION)
      console.log('PHASE 5: Marking voter as voted...');
      
      const { data: updatedVoter, error: updateError } = await supabase
        .from('voters')
        .update({ 
          has_voted: true,
          voted_at: new Date().toISOString()
        })
        .eq('id', voterData.id)
        .select('*')
        .single();

      if (updateError) {
        console.error('Failed to mark voter as voted:', updateError);
        // This is critical - votes are saved but voter not marked
        throw new Error(`CRITICAL: Votes saved but voter update failed: ${updateError.message}`);
      }

      if (!updatedVoter || !updatedVoter.has_voted) {
        throw new Error('Voter was not properly marked as voted');
      }

      console.log('✅ Voter marked as voted:', updatedVoter);

      // PHASE 6: FINAL SYSTEM VERIFICATION
      console.log('PHASE 6: Final system verification...');
      
      const { data: finalVotes, error: finalVotesError } = await supabase
        .from('votes')
        .select('id, position_id, candidate_id')
        .eq('voter_id', voterData.id);

      const { data: finalVoter, error: finalVoterError } = await supabase
        .from('voters')
        .select('has_voted, voted_at')
        .eq('id', voterData.id)
        .single();

      if (finalVotesError || finalVoterError) {
        console.error('Final verification failed:', { finalVotesError, finalVoterError });
        throw new Error('Final verification failed');
      }

      if (!finalVoter?.has_voted || !finalVotes || finalVotes.length !== voteBatch.length) {
        console.error('Final state invalid:', {
          voterHasVoted: finalVoter?.has_voted,
          voteCount: finalVotes?.length,
          expectedVotes: voteBatch.length
        });
        throw new Error('Final verification: system state is invalid');
      }

      console.log('✅ FINAL VERIFICATION SUCCESSFUL');
      console.log('Final votes:', finalVotes);
      console.log('Final voter state:', finalVoter);
      console.log('=== BULLETPROOF VOTE SUBMISSION COMPLETED ===');

      toast({
        title: "Vote Submitted Successfully",
        description: "Thank you for participating in the election!",
      });

      navigate('/vote-success', { 
        state: { 
          voter: voterData,
          selections: selections 
        }
      });

    } catch (error: any) {
      console.error('=== VOTE SUBMISSION FAILED ===');
      console.error('Error:', error);
      console.error('Stack:', error.stack);
      
      toast({
        title: "Vote Submission Failed",
        description: error.message || "An unexpected error occurred during vote submission",
        variant: "destructive",
      });
      
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!voterData) {
    return <div>Loading...</div>;
  }

  const currentPosition = positions[currentPositionIndex];
  const selectedCandidate = selections[currentPosition.id];
  const isLastPosition = currentPositionIndex === positions.length - 1;
  const allPositionsSelected = positions.every(pos => selections[pos.id]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-3 rounded-full">
                  <Vote className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Electronic Voting System</CardTitle>
                  <CardDescription>
                    Voter: {voterData.first_name} {voterData.last_name} ({voterData.id_number})
                  </CardDescription>
                </div>
              </div>
              <Badge variant="secondary">
                Position {currentPositionIndex + 1} of {positions.length}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Bar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-500">
                {Object.keys(selections).length} of {positions.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(Object.keys(selections).length / positions.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>

        {/* Current Position */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl">{currentPosition.title}</CardTitle>
            <CardDescription>Select one candidate for this position</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {currentPosition.candidates.map((candidate) => (
                <div
                  key={candidate.id}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedCandidate === candidate.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:bg-blue-25 dark:hover:bg-blue-900/10'
                  }`}
                  onClick={() => handleCandidateSelect(currentPosition.id, candidate.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full">
                        <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{candidate.name}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{candidate.party}</p>
                      </div>
                    </div>
                    {selectedCandidate === candidate.id && (
                      <CheckCircle className="h-6 w-6 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentPositionIndex === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              {isLastPosition ? (
                <Button
                  onClick={handleSubmitVote}
                  disabled={!allPositionsSelected || isSubmitting}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Vote'}
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={!selectedCandidate}
                >
                  Next
                  <Vote className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VotingPage;
