import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext';
import Index from '@/pages/Index';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import VoteVerificationPage from '@/pages/VoteVerificationPage';
import AdminDashboard from '@/pages/AdminDashboard';
import NotFound from '@/pages/NotFound';
import Navbar from '@/components/layout/Navbar';
import VoterLoginPage from '@/pages/VoterLoginPage';
import VoterLocationPage from '@/pages/VoterLocationPage';
import VoterCandidatesPage from '@/pages/VoterCandidatesPage';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
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
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <div className="min-h-screen bg-background">
              <Navbar />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/verify" element={
                  <ProtectedRoute>
                    <VoteVerificationPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="election_authority">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
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
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
