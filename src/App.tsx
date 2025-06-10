
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Index from '@/pages/Index';
import HomePage from '@/pages/HomePage';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import VotingPage from '@/pages/VotingPage';
import VoterLoginPage from '@/pages/VoterLoginPage';
import ClerkLoginPage from '@/pages/ClerkLoginPage';
import VoterLocationPage from '@/pages/VoterLocationPage';
import VoterCandidatesPage from '@/pages/VoterCandidatesPage';
import ClerkDashboard from '@/pages/ClerkDashboard';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/voter-login" element={<VoterLoginPage />} />
              <Route path="/clerk-login" element={<ClerkLoginPage />} />
              <Route path="/voter-location" element={<VoterLocationPage />} />
              <Route path="/voter-candidates" element={<VoterCandidatesPage />} />
              <Route path="/clerk-dashboard" element={<ClerkDashboard />} />
              
              {/* Original system routes with navbar */}
              <Route path="/system/*" element={
                <div>
                  <Navbar />
                  <main className="container mx-auto px-4 py-8">
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      
                      <Route path="/vote/:electionId" element={
                        <ProtectedRoute>
                          <VotingPage />
                        </ProtectedRoute>
                      } />
                    </Routes>
                  </main>
                </div>
              } />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
