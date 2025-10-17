
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, ArrowRight, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { z } from 'zod';

const voterSchema = z.object({
  idNumber: z.string().length(8, "ID must be 8 digits").regex(/^\d+$/, "ID must contain only numbers"),
  firstName: z.string().trim().min(1, "First name required").max(50).regex(/^[a-zA-Z\s]+$/, "Only letters allowed"),
  lastName: z.string().trim().min(1, "Last name required").max(50).regex(/^[a-zA-Z\s]+$/, "Only letters allowed"),
  phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/, "Invalid phone number")
});

const VoterLoginPage = () => {
  const [formData, setFormData] = useState({
    idNumber: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
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
      // Validate input
      const validation = voterSchema.safeParse(formData);
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      // Store voter session data (not authentication - this is for voting session only)
      const voterData = {
        idNumber: formData.idNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: formData.phoneNumber,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('voterData', JSON.stringify(voterData));
      
      toast({
        title: "Login Successful",
        description: "Please select your location to continue.",
      });

      navigate('/voter-location');
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
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
            <div className="bg-blue-600 p-3 rounded-full">
              <User className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Voter Login</CardTitle>
          <CardDescription>
            Enter your details to access the voting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="idNumber">National ID Number</Label>
              <Input
                id="idNumber"
                name="idNumber"
                type="text"
                placeholder="Enter your 8-digit ID number"
                value={formData.idNumber}
                onChange={handleInputChange}
                maxLength={8}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
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

            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {isLoading ? 'Logging in...' : 'Continue to Location Selection'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VoterLoginPage;
