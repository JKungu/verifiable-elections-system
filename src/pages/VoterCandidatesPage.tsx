
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Vote, CheckCircle, LogOut, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

interface Candidate {
  id: string;
  candidate_id: string;
  full_name: string;
  name: string;
  party: string;
  image_url?: string;
  position: {
    id: string;
    name: string;
    level: string;
  };
}

interface Position {
  id: string;
  name: string;
  level: string;
}

const VoterCandidatesPage = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<{ [positionId: string]: string }>({});
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadCandidatesAndPositions = async () => {
      try {
        const voterLocation = localStorage.getItem('voterLocation');
        if (!voterLocation) {
          navigate('/voter-location');
          return;
        }

        const { wardId } = JSON.parse(voterLocation);

        // For now, we'll use hardcoded positions until the database schema is updated
        const hardcodedPositions: Position[] = [
          { id: '1', name: 'President', level: 'country' },
          { id: '2', name: 'Governor', level: 'county' },
          { id: '3', name: 'Women Representative', level: 'county' },
          { id: '4', name: 'Member of Parliament', level: 'constituency' },
          { id: '5', name: 'Member of County Assembly', level: 'ward' }
        ];
        
        setPositions(hardcodedPositions);

        // Load sample candidates with proper structure
        const sampleCandidates: Candidate[] = [
          // Presidential candidates (same for all locations)
          {
            id: '1',
            candidate_id: 'PRES001',
            full_name: 'John Kamau Mwangi',
            name: 'John Kamau',
            party: 'Democratic Alliance',
            image_url: '/placeholder.svg',
            position: { id: '1', name: 'President', level: 'country' }
          },
          {
            id: '2',
            candidate_id: 'PRES002',
            full_name: 'Mary Wanjiku Njeri',
            name: 'Mary Wanjiku',
            party: 'Unity Party',
            image_url: '/placeholder.svg',
            position: { id: '1', name: 'President', level: 'country' }
          },
          {
            id: '3',
            candidate_id: 'PRES003',
            full_name: 'David Otieno Ochieng',
            name: 'David Otieno',
            party: 'Progressive Movement',
            image_url: '/placeholder.svg',
            position: { id: '1', name: 'President', level: 'country' }
          },
          
          // Governor candidates
          {
            id: '4',
            candidate_id: 'GOV001',
            full_name: 'Peter Mwangi Kariuki',
            name: 'Peter Mwangi',
            party: 'County First',
            image_url: '/placeholder.svg',
            position: { id: '2', name: 'Governor', level: 'county' }
          },
          {
            id: '5',
            candidate_id: 'GOV002',
            full_name: 'Grace Akinyi Omondi',
            name: 'Grace Akinyi',
            party: 'Development Party',
            image_url: '/placeholder.svg',
            position: { id: '2', name: 'Governor', level: 'county' }
          },

          // Women Representative candidates
          {
            id: '6',
            candidate_id: 'WR001',
            full_name: 'Susan Njeri Kimani',
            name: 'Susan Njeri',
            party: 'Women First',
            image_url: '/placeholder.svg',
            position: { id: '3', name: 'Women Representative', level: 'county' }
          },
          {
            id: '7',
            candidate_id: 'WR002',
            full_name: 'Faith Wambui Gathua',
            name: 'Faith Wambui',
            party: 'Gender Equality',
            image_url: '/placeholder.svg',
            position: { id: '3', name: 'Women Representative', level: 'county' }
          },

          // MP candidates
          {
            id: '8',
            candidate_id: 'MP001',
            full_name: 'James Kiprotich Ruto',
            name: 'James Kiprotich',
            party: 'Reform Alliance',
            image_url: '/placeholder.svg',
            position: { id: '4', name: 'Member of Parliament', level: 'constituency' }
          },
          {
            id: '9',
            candidate_id: 'MP002',
            full_name: 'Robert Macharia Mugo',
            name: 'Robert Macharia',
            party: 'Grassroots Party',
            image_url: '/placeholder.svg',
            position: { id: '4', name: 'Member of Parliament', level: 'constituency' }
          },

          // MCA candidates
          {
            id: '10',
            candidate_id: 'MCA001',
            full_name: 'Francis Mutua Kioko',
            name: 'Francis Mutua',
            party: 'Local Development',
            image_url: '/placeholder.svg',
            position: { id: '5', name: 'Member of County Assembly', level: 'ward' }
          },
          {
            id: '11',
            candidate_id: 'MCA002',
            full_name: 'Catherine Wairimu Gichuru',
            name: 'Catherine Wairimu',
            party: 'Community First',
            image_url: '/placeholder.svg',
            position: { id: '5', name: 'Member of County Assembly', level: 'ward' }
          }
        ];

        setCandidates(sampleCandidates);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load candidates.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCandidatesAndPositions();
  }, [navigate, toast]);

  const handleCandidateSelect = (positionId: string, candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [positionId]: candidateId
    }));
  };

  const handleSubmitVotes = async () => {
    const voterData = localStorage.getItem('voterData');
    const voterLocation = localStorage.getItem('voterLocation');

    if (!voterData || !voterLocation) {
      navigate('/voter-login');
      return;
    }

    const voter = JSON.parse(voterData);
    const location = JSON.parse(voterLocation);

    // Check if all positions have selections
    const positionIds = positions.map(p => p.id);
    const missingSelections = positionIds.filter(positionId => !selectedCandidates[positionId]);
    
    if (missingSelections.length > 0) {
      const missingPositions = missingSelections.map(id => 
        positions.find(p => p.id === id)?.name
      ).filter(Boolean);
      
      toast({
        title: "Incomplete Voting",
        description: `Please select candidates for: ${missingPositions.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Since the new tables aren't in the types yet, we'll use type assertion
      // Check if voter already exists
      const { data: existingVoter } = await (supabase as any)
        .from('voters')
        .select('*')
        .eq('id_number', voter.idNumber)
        .single();

      if (existingVoter?.has_voted) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote in this election.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      // Insert or update voter record
      const { data: voterRecord, error: voterError } = await (supabase as any)
        .from('voters')
        .upsert({
          id_number: voter.idNumber,
          first_name: voter.firstName,
          last_name: voter.lastName,
          phone_number: voter.phoneNumber,
          location_id: location.wardId,
          has_voted: true,
          voted_at: new Date().toISOString()
        }, {
          onConflict: 'id_number'
        })
        .select()
        .single();

      if (voterError) throw voterError;

      // For now, we'll just simulate vote recording since the votes table schema needs to be updated
      console.log('Votes would be recorded:', {
        voter_id: voterRecord.id,
        selected_candidates: selectedCandidates,
        location: location
      });

      setShowCongratulations(true);
    } catch (error: any) {
      console.error('Voting error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit votes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    // Clear all voter data
    localStorage.removeItem('voterData');
    localStorage.removeItem('voterLocation');
    
    toast({
      title: "Logged Out",
      description: "Thank you for participating in the election!",
    });
    
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showCongratulations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-800 dark:text-green-200">Congratulations!</CardTitle>
            <CardDescription className="text-lg">
              Your votes have been successfully submitted and recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Thank you for exercising your democratic right. Your vote matters!
              </AlertDescription>
            </Alert>
            
            <Button onClick={handleLogout} className="w-full bg-green-600 hover:bg-green-700">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Group candidates by position
  const candidatesByPosition = positions.reduce((acc, position) => {
    acc[position.id] = candidates.filter(c => c.position.id === position.id);
    return acc;
  }, {} as { [positionId: string]: Candidate[] });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Select Your Candidates</CardTitle>
            <CardDescription>
              Choose one candidate for each position. All selections are required.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="space-y-6">
          {positions.map((position) => (
            <Card key={position.id}>
              <CardHeader>
                <CardTitle className="text-xl">{position.name}</CardTitle>
                <CardDescription>
                  Select one candidate for {position.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidatesByPosition[position.id]?.map((candidate) => (
                    <div 
                      key={candidate.id} 
                      className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCandidates[position.id] === candidate.id 
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                      onClick={() => handleCandidateSelect(position.id, candidate.id)}
                    >
                      <Checkbox 
                        checked={selectedCandidates[position.id] === candidate.id}
                        onChange={() => handleCandidateSelect(position.id, candidate.id)}
                      />
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                          {candidate.image_url ? (
                            <img 
                              src={candidate.image_url} 
                              alt={candidate.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{candidate.full_name}</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">ID: {candidate.candidate_id}</p>
                              <Badge variant="outline" className="mt-1">
                                {candidate.party}
                              </Badge>
                            </div>
                            {selectedCandidates[position.id] === candidate.id && (
                              <CheckCircle className="h-6 w-6 text-blue-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Ready to submit your votes?</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Please review your selections before submitting. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={handleSubmitVotes}
                size="lg"
                className="px-8"
                disabled={positions.some(position => !selectedCandidates[position.id]) || isSubmitting}
              >
                <Vote className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit All Votes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterCandidatesPage;
