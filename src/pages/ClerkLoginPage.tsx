
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { supabase } from '@/integrations/supabase/client';

const ClerkLoginPage = () => {
  const [formData, setFormData] = useState({
    registrationNumber: '',
    name: '',
    phoneNumber: '',
    idNumber: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate all fields are filled
      if (!formData.registrationNumber || !formData.name || !formData.phoneNumber || !formData.idNumber) {
        toast({
          title: "Missing Information",
          description: "Please fill in all required fields.",
          variant: "destructive",
        });
        return;
      }

      // Check if clerk exists in the database
      const { data: existingClerk, error: fetchError } = await supabase
        .from('citizens')
        .select('*')
        .eq('national_id', formData.idNumber)
        .eq('user_role', 'election_authority')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking clerk:', fetchError);
        toast({
          title: "Database Error", 
          description: "Failed to verify clerk credentials.",
          variant: "destructive",
        });
        return;
      }

      // If clerk doesn't exist, we'll create a simple session without database insertion
      // In a real system, clerk records would be pre-registered by system administrators
      if (!existingClerk) {
        console.log('Clerk not found in database, creating temporary session');
        
        // For this demo, we'll allow the clerk to login without database verification
        // In production, all clerks should be pre-registered in the system
        toast({
          title: "Login Successful",
          description: "Welcome to the clerk portal! (Demo mode)",
        });
      } else {
        toast({
          title: "Login Successful",
          description: "Welcome back to the clerk portal!",
        });
      }

      // Store clerk data in localStorage for session management
      localStorage.setItem('clerkData', JSON.stringify(formData));
      
      // Log the clerk login activity
      console.log('Clerk logged in:', formData.registrationNumber);

      // Navigate to clerk dashboard
      navigate('/clerk-dashboard');
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-green-800 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="absolute top-4 left-4">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Button>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-green-600 p-3 rounded-full">
              <Shield className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Clerk Login</CardTitle>
          <CardDescription>
            Enter your credentials to access the clerk portal for data collection from all 47 counties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>
              <Input
                id="registrationNumber"
                name="registrationNumber"
                type="text"
                placeholder="Enter your registration number"
                value={formData.registrationNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input
                id="idNumber"
                name="idNumber"
                type="text"
                placeholder="Enter your ID number"
                value={formData.idNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              <Shield className="h-4 w-4 mr-2" />
              {isLoading ? 'Logging in...' : 'Login as Clerk'}
            </Button>

            <div className="text-center pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/voter-login')}
              >
                Login as Voter Instead
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClerkLoginPage;
