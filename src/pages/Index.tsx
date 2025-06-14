
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Lock, Eye, FileText } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Secure Digital Voting Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience democracy in the digital age with Estonia-inspired i-Voting technology. 
            Secure, anonymous, and verifiable elections at your fingertips.
          </p>
          <div className="space-x-4">
            <Link to="/voter-login">
              <Button size="lg" className="px-8 py-3">
                Vote Now
              </Button>
            </Link>
            <Link to="/clerk-login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Clerk Login
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-600 mb-4" />
              <CardTitle>Secure Authentication</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                ID-based verification system for secure voter authentication
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Lock className="h-12 w-12 text-green-600 mb-4" />
              <CardTitle>Anonymous Voting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your vote is encrypted and anonymized to protect your privacy
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Eye className="h-12 w-12 text-purple-600 mb-4" />
              <CardTitle>Transparent & Verifiable</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Verify your vote was counted without revealing your identity
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-12 w-12 text-orange-600 mb-4" />
              <CardTitle>Comprehensive Audit</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Complete election integrity with detailed audit trails
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Enter ID Details</h3>
              <p className="text-gray-600">
                Use your national ID number and personal details to access the voting system
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cast Your Vote</h3>
              <p className="text-gray-600">
                Select your location and securely vote for your preferred candidates
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Verify & Track</h3>
              <p className="text-gray-600">
                Confirm your vote was counted and view election results
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
