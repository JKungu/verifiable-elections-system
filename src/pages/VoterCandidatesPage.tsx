
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Vote, CheckCircle, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  name: string;
  idNumber: string;
  position: string;
  party: string;
  image?: string;
}

const VoterCandidatesPage = () => {
  const [selectedCandidates, setSelectedCandidates] = useState<{ [position: string]: string }>({});
  const [showCongratulations, setShowCongratulations] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Sample candidates data - in real app, this would come from API based on location
  const candidatesByPosition = {
    'President': [
      { id: 'p1', name: 'John Kamau', idNumber: '12345678', position: 'President', party: 'Democratic Alliance' },
      { id: 'p2', name: 'Mary Wanjiku', idNumber: '87654321', position: 'President', party: 'Unity Party' },
      { id: 'p3', name: 'David Otieno', idNumber: '11223344', position: 'President', party: 'Progressive Movement' }
    ],
    'Governor': [
      { id: 'g1', name: 'Peter Mwangi', idNumber: '55667788', position: 'Governor', party: 'County First' },
      { id: 'g2', name: 'Grace Akinyi', idNumber: '99887766', position: 'Governor', party: 'Development Party' }
    ],
    'Senator': [
      { id: 's1', name: 'James Kiprotich', idNumber: '33445566', position: 'Senator', party: 'Reform Alliance' },
      { id: 's2', name: 'Susan Njeri', idNumber: '77889900', position: 'Senator', party: 'People\'s Choice' }
    ],
    'Member of Parliament': [
      { id: 'm1', name: 'Robert Macharia', idNumber: '44556677', position: 'Member of Parliament', party: 'Grassroots Party' },
      { id: 'm2', name: 'Lucy Wambui', idNumber: '66778899', position: 'Member of Parliament', party: 'Youth Movement' },
      { id: 'm3', name: 'Joseph Kiplagat', idNumber: '22334455', position: 'Member of Parliament', party: 'Economic Freedom' }
    ],
    'Member of County Assembly': [
      { id: 'c1', name: 'Francis Mutua', idNumber: '11335577', position: 'Member of County Assembly', party: 'Local Development' },
      { id: 'c2', name: 'Catherine Wairimu', idNumber: '99113355', position: 'Member of County Assembly', party: 'Community First' }
    ]
  };

  const positions = Object.keys(candidatesByPosition);

  const handleCandidateSelect = (position: string, candidateId: string) => {
    setSelectedCandidates(prev => ({
      ...prev,
      [position]: candidateId
    }));
  };

  const handleSubmitVotes = () => {
    // Check if all positions have selections
    const missingSelections = positions.filter(position => !selectedCandidates[position]);
    
    if (missingSelections.length > 0) {
      toast({
        title: "Incomplete Voting",
        description: `Please select candidates for: ${missingSelections.join(', ')}`,
        variant: "destructive",
      });
      return;
    }

    // Store votes (in real app, this would be sent to backend)
    const votes = positions.map(position => {
      const candidateId = selectedCandidates[position];
      const candidate = candidatesByPosition[position as keyof typeof candidatesByPosition]
        .find(c => c.id === candidateId);
      return {
        position,
        candidate,
        timestamp: new Date().toISOString()
      };
    });

    localStorage.setItem('voterVotes', JSON.stringify(votes));
    
    // Update vote counts in localStorage for clerk access
    const existingVotes = JSON.parse(localStorage.getItem('allVotes') || '{}');
    votes.forEach(vote => {
      if (!existingVotes[vote.candidate!.id]) {
        existingVotes[vote.candidate!.id] = 0;
      }
      existingVotes[vote.candidate!.id]++;
    });
    localStorage.setItem('allVotes', JSON.stringify(existingVotes));

    setShowCongratulations(true);
  };

  const handleLogout = () => {
    // Clear all voter data
    localStorage.removeItem('voterData');
    localStorage.removeItem('voterLocation');
    localStorage.removeItem('voterVotes');
    
    toast({
      title: "Logged Out",
      description: "Thank you for participating in the election!",
    });
    
    navigate('/');
  };

  if (showCongratulations) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-4 rounded-full">
                <CheckCircle className="h-12 w-12 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-green-800">Congratulations!</CardTitle>
            <CardDescription className="text-lg">
              Your votes have been successfully submitted and recorded.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
            <Card key={position}>
              <CardHeader>
                <CardTitle className="text-xl">{position}</CardTitle>
                <CardDescription>
                  Select one candidate for {position}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {candidatesByPosition[position as keyof typeof candidatesByPosition].map((candidate) => (
                    <div 
                      key={candidate.id} 
                      className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedCandidates[position] === candidate.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleCandidateSelect(position, candidate.id)}
                    >
                      <Checkbox 
                        checked={selectedCandidates[position] === candidate.id}
                        onChange={() => handleCandidateSelect(position, candidate.id)}
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{candidate.name}</h3>
                            <p className="text-sm text-gray-600">ID: {candidate.idNumber}</p>
                            <Badge variant="outline" className="mt-1">
                              {candidate.party}
                            </Badge>
                          </div>
                          {selectedCandidates[position] === candidate.id && (
                            <CheckCircle className="h-6 w-6 text-blue-600" />
                          )}
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
                <p className="text-sm text-gray-600">
                  Please review your selections before submitting. This action cannot be undone.
                </p>
              </div>
              <Button
                onClick={handleSubmitVotes}
                size="lg"
                className="px-8"
                disabled={positions.some(position => !selectedCandidates[position])}
              >
                <Vote className="h-4 w-4 mr-2" />
                Submit All Votes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoterCandidatesPage;
