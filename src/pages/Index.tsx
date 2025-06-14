
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
            Secure Digital Voting for Kenya
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Experience transparent, secure, and accessible elections with our advanced 
            digital voting platform. Every vote counts, every voice matters.
          </p>
          <div className="space-x-4">
            <Link to="/voter-login">
              <Button size="lg" className="px-8 py-3 bg-gray-800 hover:bg-gray-900">
                Vote Now
              </Button>
            </Link>
            <Link to="/clerk-login">
              <Button variant="outline" size="lg" className="px-8 py-3">
                Clerk Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Shield className="h-12 w-12 text-green-600 mb-4 mx-auto" />
              <CardTitle className="text-lg">Secure & Encrypted</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Federal-grade encryption technology and multi-layered security for a safe voting experience.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Lock className="h-12 w-12 text-blue-600 mb-4 mx-auto" />
              <CardTitle className="text-lg">Transparent Process</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Real-time verification and audit trail to ensure complete transparency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Eye className="h-12 w-12 text-purple-600 mb-4 mx-auto" />
              <CardTitle className="text-lg">Easy Access</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Simple, intuitive interface accessible from any device, anywhere.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <FileText className="h-12 w-12 text-orange-600 mb-4 mx-auto" />
              <CardTitle className="text-lg">Verified Results</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Guaranteed vote verification and instant result reporting.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Make Your Voice Heard?</h2>
          <p className="text-lg text-gray-600 mb-6">
            Join millions of Kenyans in shaping the future of our nation through secure digital voting.
          </p>
          <Link to="/voter-login">
            <Button size="lg" className="px-8 py-3 bg-gray-800 hover:bg-gray-900">
              Start Voting Process
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
