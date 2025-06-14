
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import Index from "./pages/Index";
import VoterLoginPage from "./pages/VoterLoginPage";
import VoterLocationPage from "./pages/VoterLocationPage";
import VoterCandidatesPage from "./pages/VoterCandidatesPage";
import VotingPage from "./pages/VotingPage";
import VoteSuccessPage from "./pages/VoteSuccessPage";
import ClerkLoginPage from "./pages/ClerkLoginPage";
import ClerkDashboard from "./pages/ClerkDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import VoteVerificationPage from "./pages/VoteVerificationPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <div className="min-h-screen bg-background text-foreground">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/voter-login" element={<VoterLoginPage />} />
              <Route path="/voter-location" element={<VoterLocationPage />} />
              <Route path="/voter-candidates" element={<VoterCandidatesPage />} />
              <Route path="/voting" element={<VotingPage />} />
              <Route path="/vote-success" element={<VoteSuccessPage />} />
              <Route path="/clerk-login" element={<ClerkLoginPage />} />
              <Route path="/clerk-dashboard" element={<ClerkDashboard />} />
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/vote-verification" element={<VoteVerificationPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
