
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Navbar from '@/components/layout/Navbar';
import Index from '@/pages/Index';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import Dashboard from '@/pages/Dashboard';
import VotingPage from '@/pages/VotingPage';
import ElectionResults from '@/pages/ElectionResults';
import AdminPanel from '@/pages/admin/AdminPanel';
import ManageElections from '@/pages/admin/ManageElections';
import ManageCitizens from '@/pages/admin/ManageCitizens';
import AuditLogs from '@/pages/admin/AuditLogs';
import VoteVerification from '@/pages/VoteVerification';
import Profile from '@/pages/Profile';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
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
                
                <Route path="/results/:electionId" element={<ElectionResults />} />
                
                <Route path="/verify" element={
                  <ProtectedRoute>
                    <VoteVerification />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute requiredRole="election_authority">
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/elections" element={
                  <ProtectedRoute requiredRole="election_authority">
                    <ManageElections />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/citizens" element={
                  <ProtectedRoute requiredRole="election_authority">
                    <ManageCitizens />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/audit" element={
                  <ProtectedRoute requiredRole="system_auditor">
                    <AuditLogs />
                  </ProtectedRoute>
                } />
              </Routes>
            </main>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
