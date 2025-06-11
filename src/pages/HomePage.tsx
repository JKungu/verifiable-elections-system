
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Vote, Shield, Users, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/components/ThemeToggle';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header with theme toggle */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Vote className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SecureVote Kenya</h1>
        </div>
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Secure Digital Voting for Kenya
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience transparent, secure, and accessible elections with our advanced digital voting platform. 
            Every vote counts, every voice matters.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/voter-login')}
              className="px-8 py-4 text-lg"
            >
              <Vote className="h-5 w-5 mr-2" />
              Vote Now
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate('/clerk-login')}
              className="px-8 py-4 text-lg"
            >
              <Shield className="h-5 w-5 mr-2" />
              Clerk Portal
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle>Secure & Encrypted</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                End-to-end encryption ensures your vote remains private and secure throughout the entire process.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Users className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle>Transparent Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time monitoring and audit trails provide complete transparency in the electoral process.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Vote className="h-12 w-12 text-purple-600 dark:text-purple-400" />
              </div>
              <CardTitle>Easy Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simple, intuitive interface makes voting accessible to all eligible citizens across Kenya.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-orange-600 dark:text-orange-400" />
              </div>
              <CardTitle>Verified Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Cryptographic verification ensures accurate counting and prevents electoral fraud.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Make Your Voice Heard?
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Join millions of Kenyans in shaping the future of our nation through secure digital voting.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/voter-login')}
            className="px-8 py-4 text-lg"
          >
            Start Voting Process
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
