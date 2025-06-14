
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Vote, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const [electionStatus, setElectionStatus] = useState<'pending' | 'active' | 'closed'>('pending');
  const { toast } = useToast();

  // Fetch election statistics
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [votersResult, votesResult] = await Promise.all([
        supabase.from('voters').select('*'),
        supabase.from('votes').select('*')
      ]);

      const totalVoters = votersResult.data?.length || 0;
      const totalVotes = votesResult.data?.length || 0;
      const votersWhoVoted = votersResult.data?.filter(v => v.has_voted).length || 0;
      const turnoutRate = totalVoters > 0 ? (votersWhoVoted / totalVoters) * 100 : 0;

      return {
        totalVoters,
        totalVotes,
        votersWhoVoted,
        turnoutRate: Math.round(turnoutRate * 100) / 100
      };
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const handleElectionStatusChange = (newStatus: 'pending' | 'active' | 'closed') => {
    setElectionStatus(newStatus);
    toast({
      title: "Election Status Updated",
      description: `Election status changed to ${newStatus}`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'active': return <CheckCircle className="h-4 w-4" />;
      case 'closed': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-600 p-3 rounded-full">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
                  <CardDescription>Election Management System</CardDescription>
                </div>
              </div>
              <Badge className={`${getStatusColor(electionStatus)} flex items-center space-x-2`}>
                {getStatusIcon(electionStatus)}
                <span className="capitalize">{electionStatus}</span>
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Voters</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats?.totalVoters || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Votes Cast</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats?.totalVotes || 0}</p>
                </div>
                <Vote className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Voters Participated</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : stats?.votersWhoVoted || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Turnout Rate</p>
                  <p className="text-2xl font-bold">{isLoading ? '...' : `${stats?.turnoutRate || 0}%`}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="election-control">Election Control</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Election Overview</CardTitle>
                <CardDescription>Real-time election monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Election is currently {electionStatus}. Monitor the statistics above for real-time updates.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">System Status</h3>
                      <p className="text-blue-700 text-sm">All systems operational</p>
                    </div>
                    
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-800 mb-2">Security</h3>
                      <p className="text-green-700 text-sm">All votes encrypted and secure</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="election-control">
            <Card>
              <CardHeader>
                <CardTitle>Election Control</CardTitle>
                <CardDescription>Manage election status and settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Election Status Control</h3>
                    <div className="flex space-x-4">
                      <Button
                        variant={electionStatus === 'pending' ? 'default' : 'outline'}
                        onClick={() => handleElectionStatusChange('pending')}
                      >
                        Set Pending
                      </Button>
                      <Button
                        variant={electionStatus === 'active' ? 'default' : 'outline'}
                        onClick={() => handleElectionStatusChange('active')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Start Election
                      </Button>
                      <Button
                        variant={electionStatus === 'closed' ? 'default' : 'outline'}
                        onClick={() => handleElectionStatusChange('closed')}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Close Election
                      </Button>
                    </div>
                  </div>

                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Warning:</strong> Changing election status will affect all voters and clerks. 
                      Make sure to coordinate with your team before making changes.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Election Reports</CardTitle>
                <CardDescription>Detailed election analytics and reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" className="h-20 flex-col">
                      <BarChart3 className="h-6 w-6 mb-2" />
                      <span>Voting Statistics</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <Users className="h-6 w-6 mb-2" />
                      <span>Voter Demographics</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <Vote className="h-6 w-6 mb-2" />
                      <span>Results Summary</span>
                    </Button>
                    
                    <Button variant="outline" className="h-20 flex-col">
                      <Settings className="h-6 w-6 mb-2" />
                      <span>System Logs</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
