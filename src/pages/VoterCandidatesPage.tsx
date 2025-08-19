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
  location_id?: string; // For location-specific candidates
}

interface Position {
  id: string;
  name: string;
  level: string;
}

// Helper functions to map database position_id to component position id
const getPositionIdFromDb = (dbPositionId: string): string => {
  const mapping: Record<string, string> = {
    'president': '1',
    'governor': '2', 
    'women_rep': '3',
    'mp': '4',
    'mca': '5'
  };
  return mapping[dbPositionId] || dbPositionId;
};

const getPositionName = (dbPositionId: string): string => {
  const mapping: Record<string, string> = {
    'president': 'President',
    'governor': 'Governor',
    'women_rep': 'Women Representative', 
    'mp': 'Member of Parliament',
    'mca': 'Member of County Assembly'
  };
  return mapping[dbPositionId] || dbPositionId;
};

const getPositionLevel = (dbPositionId: string): string => {
  const mapping: Record<string, string> = {
    'president': 'country',
    'governor': 'county',
    'women_rep': 'county',
    'mp': 'constituency', 
    'mca': 'ward'
  };
  return mapping[dbPositionId] || 'unknown';
};

const VoterCandidatesPage = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<{ [positionId: string]: string }>({});
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [showCongratulations, setShowCongratulations] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voterLocation, setVoterLocation] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const loadCandidatesAndPositions = async () => {
      try {
        const voterLocationData = localStorage.getItem('voterLocation');
        if (!voterLocationData) {
          navigate('/voter-location');
          return;
        }

        const location = JSON.parse(voterLocationData);
        setVoterLocation(location);

        // Hardcoded positions
        const hardcodedPositions: Position[] = [
          { id: '1', name: 'President', level: 'country' },
          { id: '2', name: 'Governor', level: 'county' },
          { id: '3', name: 'Women Representative', level: 'county' },
          { id: '4', name: 'Member of Parliament', level: 'constituency' },
          { id: '5', name: 'Member of County Assembly', level: 'ward' }
        ];
        
        setPositions(hardcodedPositions);

        // Load candidates from database instead of hardcoded data
        const { data: candidatesData, error: candidatesError } = await supabase
          .from('election_candidates')
          .select(`
            id,
            name,
            party,
            position_id,
            location_id,
            location_level,
            image_url
          `)
          .order('position_id', { ascending: true });

        if (candidatesError) {
          console.error('Error loading candidates:', candidatesError);
          throw candidatesError;
        }

        // Transform database candidates to match component interface
        const transformedCandidates: Candidate[] = candidatesData?.map(candidate => ({
          id: candidate.id,
          candidate_id: candidate.id,
          full_name: candidate.name,
          name: candidate.name.split(' ')[0] + ' ' + (candidate.name.split(' ')[1] || ''),
          party: candidate.party,
          image_url: candidate.image_url || '/placeholder.svg',
          position: {
            id: getPositionIdFromDb(candidate.position_id),
            name: getPositionName(candidate.position_id),
            level: candidate.location_level || getPositionLevel(candidate.position_id)
          },
          location_id: candidate.location_id
        })) || [];

        // Filter candidates based on voter's location
        console.log('Voter location:', location);
        console.log('All candidates:', transformedCandidates);
        
        const filteredCandidates = transformedCandidates.filter(candidate => {
          // Always include presidential candidates (national level)
          if (candidate.position.id === '1') return true;
          
          // County level positions (governor, women_rep)
          if (candidate.position.id === '2' || candidate.position.id === '3') {
            const voterCounty = location.county.name.toLowerCase();
            const candidateLocation = candidate.location_id?.toLowerCase();
            
            // Enhanced county matching
            const countyMatches = candidateLocation === voterCounty || 
                                candidateLocation === voterCounty.replace(' ', '') ||
                                candidateLocation === voterCounty.replace(' county', '') ||
                                // Specific mappings
                                (voterCounty.includes('kiambu') && candidateLocation === 'kiambu') ||
                                (voterCounty.includes('nairobi') && candidateLocation === 'nairobi') ||
                                (voterCounty.includes('mombasa') && candidateLocation === 'mombasa') ||
                                (voterCounty.includes('nakuru') && candidateLocation === 'nakuru') ||
                                (voterCounty.includes('kisumu') && candidateLocation === 'kisumu');
            
            console.log(`County check for ${candidate.name}: voter=${voterCounty}, candidate=${candidateLocation}, matches=${countyMatches}`);
            return countyMatches;
          }
          
          // Constituency level positions (mp)
          if (candidate.position.id === '4') {
            const constituency = location.subcounty.name.toLowerCase();
            const candidateLocation = candidate.location_id?.toLowerCase();
            
            const constituencyMatches = candidateLocation === constituency || 
                                      candidateLocation === constituency.replace(' ', '') ||
                                      // Specific mappings
                                      (constituency.includes('juja') && candidateLocation === 'kiambutown') ||
                                      (constituency.includes('westlands') && candidateLocation === 'westlands') ||
                                      (constituency.includes('mvita') && candidateLocation === 'mvita') ||
                                      (constituency.includes('nakuru') && candidateLocation === 'nakurutowneast') ||
                                      (constituency.includes('kisumu') && candidateLocation === 'kisumueast');
            
            console.log(`Constituency check for ${candidate.name}: voter=${constituency}, candidate=${candidateLocation}, matches=${constituencyMatches}`);
            return constituencyMatches;
          }
          
          // Ward level positions (mca)
          if (candidate.position.id === '5') {
            const ward = location.ward.name.toLowerCase();
            const candidateLocation = candidate.location_id?.toLowerCase();
            
            const wardMatches = candidateLocation === ward || 
                              candidateLocation === ward.replace(' ', '') ||
                              candidateLocation === ward.replace(' ward', '') ||
                              // Specific mappings for common ward variations
                              (ward.includes('biashara') && candidateLocation === 'biashara') ||
                              (ward.includes('murera') && candidateLocation === 'murera') ||
                              (ward.includes('parklands') && candidateLocation === 'parklands') ||
                              (ward.includes('township') && candidateLocation === 'township') ||
                              (ward.includes('majengo') && candidateLocation === 'majengo') ||
                              (ward.includes('kolwa') && candidateLocation === 'kolwacentral');
            
            console.log(`Ward check for ${candidate.name}: voter=${ward}, candidate=${candidateLocation}, matches=${wardMatches}`);
            return wardMatches;
          }
          
          return false;
        });

        setCandidates(filteredCandidates);
      } catch (error: any) {
        console.error('Error loading candidates:', error);
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
      console.log('Starting vote submission process...');
      
      // Check if voter already exists
      const { data: existingVoter, error: fetchError } = await supabase
        .from('voters')
        .select('*')
        .eq('id_number', voter.idNumber)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching voter:', fetchError);
        throw fetchError;
      }

      if (existingVoter?.has_voted) {
        toast({
          title: "Already Voted",
          description: "You have already cast your vote in this election.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      let voterRecord;

      if (existingVoter) {
        // Update existing voter record
        const { data: updatedVoter, error: updateError } = await supabase
          .from('voters')
          .update({
            has_voted: true,
            voted_at: new Date().toISOString(),
            location_id: location.ward.id
          })
          .eq('id', existingVoter.id)
          .select()
          .single();

        if (updateError) {
          console.error('Error updating voter:', updateError);
          throw updateError;
        }
        
        voterRecord = updatedVoter;
      } else {
        // Insert new voter record
        const { data: newVoter, error: insertError } = await supabase
          .from('voters')
          .insert({
            id_number: voter.idNumber,
            first_name: voter.firstName,
            last_name: voter.lastName,
            phone_number: voter.phoneNumber,
            location_id: location.ward.id,
            has_voted: true,
            voted_at: new Date().toISOString()
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting voter:', insertError);
          throw insertError;
        }
        
        voterRecord = newVoter;
      }

      console.log('Voter record created/updated:', voterRecord);

      // Insert votes for each position
      const votesToInsert = Object.entries(selectedCandidates).map(([positionId, candidateId]) => ({
        voter_id: voterRecord.id,
        position_id: positionId,
        candidate_id: candidateId
      }));

      console.log('Inserting votes:', votesToInsert);

      const { error: votesError } = await supabase
        .from('votes')
        .insert(votesToInsert);

      if (votesError) {
        console.error('Error inserting votes:', votesError);
        throw votesError;
      }

      console.log('Votes submitted successfully');
      setShowCongratulations(true);
      
      toast({
        title: "Votes Submitted",
        description: "Your votes have been successfully recorded!",
      });

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
              {voterLocation && (
                <div className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Voting in: {voterLocation.ward.name} Ward, {voterLocation.subcounty.name}, {voterLocation.county.name} County
                </div>
              )}
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
                  {position.level !== 'country' && voterLocation && (
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      (for your {position.level === 'county' ? 'county' : position.level === 'constituency' ? 'constituency' : 'ward'})
                    </span>
                  )}
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
