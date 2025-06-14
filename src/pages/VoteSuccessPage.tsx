
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Home } from 'lucide-react';

const VoteSuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { voter, selections } = location.state || {};

  useEffect(() => {
    if (!voter || !selections) {
      navigate('/voter-login');
    }
  }, [voter, selections, navigate]);

  if (!voter || !selections) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="bg-green-600 p-6 rounded-full">
                <CheckCircle className="h-16 w-16 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl text-green-700">Vote Submitted Successfully!</CardTitle>
            <CardDescription className="text-lg">
              Thank you for participating in the democratic process, {voter.first_name} {voter.last_name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-8">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Your Vote Summary</h3>
                <p className="text-green-700">
                  You have successfully voted for {Object.keys(selections).length} positions.
                  Your votes have been securely recorded and encrypted.
                </p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">What's Next?</h3>
                <p className="text-blue-700">
                  Election results will be available after the voting period ends.
                  Thank you for exercising your democratic right!
                </p>
              </div>
            </div>

            <Button onClick={() => navigate('/')} className="bg-green-600 hover:bg-green-700">
              <Home className="h-4 w-4 mr-2" />
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoteSuccessPage;
