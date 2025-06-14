
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/contexts/ThemeContext"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"
import Index from '@/pages/Index';
import VoteVerificationPage from '@/pages/VoteVerificationPage';
import NotFound from '@/pages/NotFound';
import Navbar from '@/components/layout/Navbar';
import VoterLoginPage from '@/pages/VoterLoginPage';
import VoterLocationPage from '@/pages/VoterLocationPage';
import VoterCandidatesPage from '@/pages/VoterCandidatesPage';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import VotingPage from './pages/VotingPage';
import VoteSuccessPage from './pages/VoteSuccessPage';
import ClerkLoginPage from './pages/ClerkLoginPage';
import ClerkDashboard from './pages/ClerkDashboard';

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/verify" element={<VoteVerificationPage />} />
                
                {/* Voter Routes */}
                <Route path="/voter-login" element={<VoterLoginPage />} />
                <Route path="/voter-location" element={<VoterLocationPage />} />
                <Route path="/voter-candidates" element={<VoterCandidatesPage />} />
                <Route path="/voting" element={<VotingPage />} />
                <Route path="/vote-success" element={<VoteSuccessPage />} />
                
                {/* Clerk Routes */}
                <Route path="/clerk-login" element={<ClerkLoginPage />} />
                <Route path="/clerk-dashboard" element={<ClerkDashboard />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </BrowserRouter>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
