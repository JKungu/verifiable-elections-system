
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Vote, BarChart3, TrendingUp } from 'lucide-react';

interface VoteStatsOverviewProps {
  totalRegistered: number;
  totalVoted: number;
  totalVotes: number;
  turnoutPercentage: number;
  locationName: string;
  isRealTimeConnected: boolean;
}

const VoteStatsOverview: React.FC<VoteStatsOverviewProps> = ({
  totalRegistered,
  totalVoted,
  totalVotes,
  turnoutPercentage,
  locationName,
  isRealTimeConnected
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Vote Distribution Overview - {locationName}
          <Badge variant={isRealTimeConnected ? "default" : "destructive"}>
            {isRealTimeConnected ? "LIVE" : "OFFLINE"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {totalRegistered.toLocaleString()}
                </div>
                <div className="text-sm text-blue-500">Registered Voters</div>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {totalVoted.toLocaleString()}
                </div>
                <div className="text-sm text-green-500">Voters Participated</div>
              </div>
              <Vote className="h-8 w-8 text-green-400" />
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {turnoutPercentage.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-500">Voter Turnout</div>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {totalVotes.toLocaleString()}
                </div>
                <div className="text-sm text-orange-500">Total Votes Cast</div>
              </div>
              <Vote className="h-8 w-8 text-orange-400" />
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-gray-600">Participation Rate</div>
              <div className="text-lg font-semibold text-green-600">
                {totalRegistered > 0 ? ((totalVoted / totalRegistered) * 100).toFixed(1) : 0}%
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Avg Votes per Voter</div>
              <div className="text-lg font-semibold text-blue-600">
                {totalVoted > 0 ? (totalVotes / totalVoted).toFixed(1) : 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Remaining Voters</div>
              <div className="text-lg font-semibold text-gray-600">
                {(totalRegistered - totalVoted).toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Vote Efficiency</div>
              <div className="text-lg font-semibold text-purple-600">
                {totalRegistered > 0 ? ((totalVotes / (totalRegistered * 5)) * 100).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VoteStatsOverview;
