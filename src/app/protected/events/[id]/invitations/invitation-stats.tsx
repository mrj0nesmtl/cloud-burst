'use client'

import { useState, useEffect } from 'react'
import { 
  Mail,
  CheckCircle2,
  XCircle, 
  Clock,
  Eye,
  Users,
  CheckCircle,
  SendHorizonal
} from 'lucide-react'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// Define the stats interface directly in this file
interface InvitationStats {
  total: number;
  pending: number;
  opened: number;
  accepted: number;
  declined: number;
  sent: number;
  draft: number;
}

interface ApiResponse {
  stats: InvitationStats;
}

export default function InvitationStats({ eventId }: { eventId: string }) {
  const [stats, setStats] = useState<InvitationStats>({
    total: 0,
    pending: 0,
    opened: 0,
    accepted: 0,
    declined: 0,
    sent: 0,
    draft: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!eventId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Use our new simplified API endpoint
        const response = await fetch(`/api/invitations/stats?eventId=${eventId}`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch invitation stats: ${response.status}`);
        }
        
        const data = await response.json() as ApiResponse;
        setStats(data.stats);
      } catch (err) {
        console.error('Error fetching invitation stats:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [eventId]);

  // Calculate response rate
  const responseRate = stats.total > 0 
    ? Math.round(((stats.accepted + stats.declined) / stats.total) * 100) 
    : 0;

  return (
    <Card className="overflow-hidden border">
      <CardHeader className="p-4 sm:p-6 bg-muted/30 border-b">
        <CardTitle className="text-base sm:text-lg font-medium">Invitation Stats</CardTitle>
        <CardDescription>Overview of guest responses</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {isLoading ? (
          <div className="flex justify-center items-center min-h-[150px]">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="text-center text-muted-foreground py-8">
            <p>Unable to load statistics</p>
            <p className="text-xs mt-2">{error.message}</p>
            <Button 
              onClick={() => fetchStats()} 
              variant="outline" 
              size="sm" 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2">
              <StatCard 
                label="Total"
                value={stats.total}
                icon={<Users className="h-4 w-4 text-primary" />}
                description="Invitations sent"
                className="bg-muted/20"
              />
              <StatCard 
                label="Accepted"
                value={stats.accepted}
                icon={<CheckCircle className="h-4 w-4 text-emerald-500" />}
                description="Confirmed guests"
                className="bg-emerald-50 dark:bg-emerald-950/30"
              />
              <StatCard 
                label="Pending"
                value={stats.pending} 
                icon={<Clock className="h-4 w-4 text-amber-500" />}
                description="Awaiting response"
                className="bg-amber-50 dark:bg-amber-950/30"
              />
              <StatCard 
                label="Declined"
                value={stats.declined}
                icon={<XCircle className="h-4 w-4 text-rose-500" />}
                description="Cannot attend"
                className="bg-rose-50 dark:bg-rose-950/30"
              />
            </div>

            {stats.total > 0 && (
              <div>
                <ProgressStat
                  label="Response Rate"
                  value={responseRate}
                  color="bg-primary"
                  helpText={`${stats.accepted + stats.declined} of ${stats.total} invitations have responded`}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
  
  function fetchStats() {
    setIsLoading(true);
    setError(null);
    
    fetch(`/api/invitations/stats?eventId=${eventId}`)
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || `Failed to fetch invitation stats: ${response.status}`);
          });
        }
        return response.json();
      })
      .then(data => {
        setStats(data.stats);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Error fetching invitation stats:', err);
        setError(err);
        setIsLoading(false);
      });
  }
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  description: string;
  className?: string;
}

function StatCard({ label, value, icon, description, className }: StatCardProps) {
  return (
    <div className={cn(
      "flex flex-col p-3 sm:p-4 rounded-lg border",
      className
    )}>
      <div className="flex items-center justify-between">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">{label}</span>
        <div className="p-1.5 rounded-full bg-background">{icon}</div>
      </div>
      <div className="mt-2 sm:mt-3 flex flex-col">
        <div className="text-2xl sm:text-3xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}

function ProgressStat({ 
  label, 
  value, 
  color, 
  helpText 
}: { 
  label: string
  value: number
  color: string
  helpText: string
}) {
  return (
    <div className="space-y-2 mt-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{value}%</span>
      </div>
      <div className="w-full bg-muted/60 rounded-full h-2.5 overflow-hidden dark:bg-muted/30">
        <div 
          className={`${color} h-2.5 rounded-full transition-all duration-500 ease-in-out`} 
          style={{ width: `${Math.max(value, 2)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{helpText}</p>
    </div>
  );
} 