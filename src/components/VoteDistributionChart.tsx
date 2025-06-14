
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface VoteData {
  position: string;
  candidate_id: string;
  candidate_name: string;
  party: string;
  votes: number;
  location: string;
}

interface VoteDistributionChartProps {
  voteData: VoteData[];
  position: string;
  positionIcon: string;
}

const VoteDistributionChart: React.FC<VoteDistributionChartProps> = ({
  voteData,
  position,
  positionIcon
}) => {
  const positionVotes = voteData.filter(vote => vote.position === position);
  const totalVotes = positionVotes.reduce((total, vote) => total + vote.votes, 0);
  
  // Sort candidates by vote count (highest first)
  const sortedVotes = positionVotes.sort((a, b) => b.votes - a.votes);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-xl">{positionIcon}</span>
          {position} - Vote Distribution
          <Badge variant="outline">{totalVotes} total votes</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedVotes.length > 0 ? (
          <div className="space-y-4">
            {sortedVotes.map((vote, index) => {
              const percentage = totalVotes > 0 ? (vote.votes / totalVotes * 100) : 0;
              const isLeading = index === 0 && totalVotes > 0;
              
              return (
                <div key={vote.candidate_id} className={`p-4 rounded-lg border ${isLeading ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isLeading && <span className="text-lg">🏆</span>}
                      <div>
                        <h4 className={`font-semibold ${isLeading ? 'text-green-700' : ''}`}>
                          {vote.candidate_name}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {vote.party}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-bold ${isLeading ? 'text-green-600' : ''}`}>
                        {vote.votes}
                      </div>
                      <div className="text-sm text-gray-500">
                        {percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={percentage} 
                    className="h-3"
                  />
                  
                  <div className="mt-2 text-xs text-gray-600 flex justify-between">
                    <span>Rank: #{index + 1}</span>
                    <span>{vote.votes} out of {totalVotes} votes</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">📊</div>
            <p>No votes recorded yet for this position</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoteDistributionChart;
