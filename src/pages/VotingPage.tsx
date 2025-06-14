
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
      console.log('=== STARTING VOTE SUBMISSION ===');
      console.log('Voter data:', voterData);
      console.log('Vote selections:', selections);

      // First, check if the voter has already voted
      const { data: existingVoter, error: voterCheckError } = await supabase
        .from('voters')
        .select('has_voted, id')
        .eq('id', voterData.id)
        .single();

      if (voterCheckError) {
        console.error('Error checking voter status:', voterCheckError);
        throw voterCheckError;
      }

      console.log('Voter check result:', existingVoter);

      if (existingVoter?.has_voted) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare votes for insertion - THIS IS THE CRITICAL FIX
      const votesToInsert = [];
      for (const [positionId, candidateId] of Object.entries(selections)) {
        console.log(`Preparing vote for position: ${positionId}, candidate: ${candidateId}, voter: ${voterData.id}`);
        
        votesToInsert.push({
          position_id: positionId,
          candidate_id: candidateId,
          voter_id: voterData.id
        });
      }

      console.log('Votes to insert:', votesToInsert);

      // Insert all votes - CRITICAL: This must happen BEFORE updating voter status
      const { data: insertedVotes, error: voteError } = await supabase
        .from('votes')
        .insert(votesToInsert)
        .select();

      if (voteError) {
        console.error('Error inserting votes:', voteError);
        console.error('Vote error details:', {
          message: voteError.message,
          details: voteError.details,
          hint: voteError.hint,
          code: voteError.code
        });
        throw new Error(`Failed to save votes: ${voteError.message}`);
      }

      console.log('Successfully inserted votes:', insertedVotes);

      // Verify votes were actually inserted by checking the database
      console.log('Verifying votes were inserted...');
      const { data: verifyVotes, error: verifyError } = await supabase
        .from('votes')
        .select('*')
        .eq('voter_id', voterData.id);

      if (verifyError) {
        console.error('Error verifying votes:', verifyError);
        throw new Error(`Failed to verify votes: ${verifyError.message}`);
      } else {
        console.log('Verification - Votes found in database:', verifyVotes);
        if (!verifyVotes || verifyVotes.length === 0) {
          throw new Error('Votes were not saved to database - verification failed');
        }
      }

      // ONLY update voter status AFTER successfully saving votes
      console.log('Updating voter status...');
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
        console.error('Error updating voter status:', voterUpdateError);
        throw new Error(`Failed to update voter status: ${voterUpdateError.message}`);
      }

      console.log('Voter status updated successfully:', updatedVoter);
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
      console.error('=== ERROR DURING VOTE SUBMISSION ===');
      console.error('Full error object:', error);
      
      toast({
        title: "Submission Failed",
        description: `There was an error submitting your vote: ${error.message || 'Unknown error'}. Please try again.`,
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
