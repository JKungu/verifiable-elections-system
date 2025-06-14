
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Search, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const VoteVerificationPage = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isValid: boolean;
    message: string;
  } | null>(null);
  
  const { toast } = useToast();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);
    
    // Simulate verification process
    setTimeout(() => {
      // For demo purposes, consider codes starting with 'V' as valid
      const isValid = verificationCode.startsWith('V');
      
      setVerificationResult({
        isValid,
        message: isValid 
          ? "Your vote has been successfully verified and recorded."
          : "Invalid verification code. Please check and try again."
      });
      
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-6 w-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Vote Verification</CardTitle>
            <CardDescription>
              Enter your verification code to confirm your vote was recorded
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <Label htmlFor="verificationCode">Verification Code</Label>
                <Input
                  id="verificationCode"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter your verification code"
                  className="text-center font-mono"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isVerifying}
              >
                {isVerifying ? 'Verifying...' : 'Verify Vote'}
              </Button>
            </form>

            {verificationResult && (
              <Alert className={`mt-6 ${verificationResult.isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center">
                  {verificationResult.isValid ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={`ml-2 ${verificationResult.isValid ? 'text-green-800' : 'text-red-800'}`}>
                    {verificationResult.message}
                  </AlertDescription>
                </div>
              </Alert>
            )}

            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">How to use vote verification:</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Enter the verification code you received after voting</li>
                <li>• The system will confirm if your vote was recorded</li>
                <li>• Your vote remains anonymous and secure</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default VoteVerificationPage;
