'use client';

import { useEffect, useState } from 'react';
import { 
  Card, 
  CardContent 
} from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  BarChart3,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ModerationStatsProps {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  className?: string;
}

export function ModerationStats({ 
  pendingCount, 
  approvedCount, 
  rejectedCount,
  className 
}: ModerationStatsProps) {
  const [refreshing, setRefreshing] = useState(false);
  
  // Calculate total and percentages
  const totalCount = pendingCount + approvedCount + rejectedCount;
  const pendingPercentage = totalCount ? Math.round(pendingCount * 100 / totalCount) : 0;
  const approvedPercentage = totalCount ? Math.round(approvedCount * 100 / totalCount) : 0;
  const rejectedPercentage = totalCount ? Math.round(rejectedCount * 100 / totalCount) : 0;
  const reviewedPercentage = totalCount ? Math.round((approvedCount + rejectedCount) * 100 / totalCount) : 0;
  
  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate a refresh animation
    setTimeout(() => {
      setRefreshing(false);
      // In a real implementation, you would refresh the data from the server
      // by calling a fetch function or refreshing the page
      window.location.reload();
    }, 1000);
  };
  
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium flex items-center">
            <BarChart3 className="mr-2 h-5 w-5 text-muted-foreground" />
            Moderation Statistics
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="h-8 px-2 text-muted-foreground"
          >
            <RefreshCcw className={cn(
              "h-4 w-4 mr-2",
              refreshing && "animate-spin"
            )} />
            Refresh
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-muted/40 rounded-lg p-3 flex items-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Pending</p>
              <p className="text-2xl font-bold">{pendingCount}</p>
            </div>
            <div className="ml-auto px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 text-xs font-medium">
              {pendingPercentage}%
            </div>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-3 flex items-center">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Approved</p>
              <p className="text-2xl font-bold">{approvedCount}</p>
            </div>
            <div className="ml-auto px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              {approvedPercentage}%
            </div>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-3 flex items-center">
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Rejected</p>
              <p className="text-2xl font-bold">{rejectedCount}</p>
            </div>
            <div className="ml-auto px-2 py-1 rounded-full bg-red-100 text-red-700 text-xs font-medium">
              {rejectedPercentage}%
            </div>
          </div>
          
          <div className="bg-muted/40 rounded-lg p-3 flex items-center">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <BarChart3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Moderation Progress</span>
            <span className="text-sm font-medium">{reviewedPercentage}% Complete</span>
          </div>
          <Progress value={reviewedPercentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
} 