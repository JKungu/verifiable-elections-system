
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
      id: '1', // Use numeric IDs that match what ClerkDashboard expects
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
    try {
      console.log('=== STARTING VOTE SUBMISSION PROCESS ===');
      console.log('Voter data received:', voterData);
      console.log('Selections made:', selections);
      console.log('Voter UUID for database operations:', voterData.id);

      // Step 1: Verify voter exists and hasn't voted yet
      console.log('STEP 1: Checking voter status in database...');
      const { data: existingVoter, error: voterCheckError } = await supabase
        .from('voters')
        .select('*')
        .eq('id', voterData.id)
        .single();

      if (voterCheckError) {
        console.error('CRITICAL ERROR: Cannot find voter in database:', voterCheckError);
        console.error('Searched for voter with ID:', voterData.id);
        throw new Error(`Voter verification failed: ${voterCheckError.message}`);
      }

      console.log('SUCCESS: Found voter in database:', existingVoter);

      if (existingVoter?.has_voted) {
        console.log('ABORT: Voter has already voted');
        toast({
          title: "Already Voted",
          description: "You have already cast your vote.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Step 2: Prepare and validate vote data
      console.log('STEP 2: Preparing vote data for insertion...');
      const votesToInsert = [];
      
      for (const [positionId, candidateId] of Object.entries(selections)) {
        const voteRecord = {
          position_id: positionId,
          candidate_id: candidateId,
          voter_id: voterData.id  // This MUST be the UUID from the voters table
        };
        
        console.log(`Preparing vote: Position ${positionId} -> Candidate ${candidateId} for Voter ${voterData.id}`);
        votesToInsert.push(voteRecord);
      }

      console.log('All votes prepared for insertion:', votesToInsert);
      console.log('Total votes to insert:', votesToInsert.length);

      // Step 3: Insert votes with detailed error handling
      console.log('STEP 3: Inserting votes into database...');
      const { data: insertedVotes, error: voteError } = await supabase
        .from('votes')
        .insert(votesToInsert)
        .select('*'); // Select all fields to see what was actually inserted

      if (voteError) {
        console.error('CRITICAL ERROR: Vote insertion failed:', voteError);
        console.error('Vote error code:', voteError.code);
        console.error('Vote error message:', voteError.message);
        console.error('Vote error details:', voteError.details);
        console.error('Vote error hint:', voteError.hint);
        console.error('Failed to insert votes:', votesToInsert);
        throw new Error(`Failed to save votes: ${voteError.message}`);
      }

      console.log('SUCCESS: Votes inserted into database:', insertedVotes);
      console.log('Number of votes successfully inserted:', insertedVotes?.length || 0);

      // Step 4: CRITICAL - Verify votes are actually in the database
      console.log('STEP 4: Verifying votes were saved to database...');
      const { data: verificationVotes, error: verifyError } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', voterData.id);

      if (verifyError) {
        console.error('ERROR: Could not verify votes in database:', verifyError);
        throw new Error(`Vote verification failed: ${verifyError.message}`);
      }

      console.log('VERIFICATION RESULT: Votes found in database:', verificationVotes);
      console.log('Number of votes verified in database:', verificationVotes?.length || 0);

      if (!verificationVotes || verificationVotes.length === 0) {
        console.error('CRITICAL ERROR: No votes found in database after insertion!');
        console.error('This means the insertion silently failed or was rolled back');
        throw new Error('CRITICAL: Votes were not saved to database - insertion failed');
      }

      if (verificationVotes.length !== votesToInsert.length) {
        console.error('PARTIAL FAILURE: Not all votes were saved!');
        console.error('Expected votes:', votesToInsert.length);
        console.error('Actual votes saved:', verificationVotes.length);
        throw new Error(`Only ${verificationVotes.length} of ${votesToInsert.length} votes were saved`);
      }

      console.log('SUCCESS: All votes verified in database');

      // Step 5: Now that votes are confirmed saved, update voter status
      console.log('STEP 5: Updating voter status to has_voted=true...');
      const { data: updatedVoter, error: voterUpdateError } = await supabase
        .from('voters')
        .update({ 
          has_voted: true,
          voted_at: new Date().toISOString()
        })
        .eq('id', voterData.id)
        .select()
        .single();

      if (voterUpdateError) {
        console.error('ERROR: Failed to update voter status:', voterUpdateError);
        // This is not critical since votes are already saved
        console.log('WARNING: Votes are saved but voter status update failed');
      } else {
        console.log('SUCCESS: Voter status updated:', updatedVoter);
      }

      // Step 6: Final verification
      console.log('STEP 6: Final verification - checking complete state...');
      const { data: finalCheck } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', voterData.id);

      console.log('FINAL CHECK: Total votes in database for this voter:', finalCheck?.length || 0);
      console.log('=== VOTE SUBMISSION COMPLETED SUCCESSFULLY ===');

      toast({
        title: "Vote Submitted Successfully",
        description: "Thank you for participating in the election!",
      });

      // Navigate to success page
      navigate('/vote-success', { 
        state: { 
          voter: voterData,
          selections: selections 
        }
      });

    } catch (error: any) {
      console.error('=== CRITICAL VOTING ERROR ===');
      console.error('Error type:', typeof error);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      console.error('Voter ID that failed:', voterData?.id);
      console.error('Selections that failed:', selections);
      
      toast({
        title: "Vote Submission Failed",
        description: `Critical error: ${error.message}. Please contact support.`,
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
