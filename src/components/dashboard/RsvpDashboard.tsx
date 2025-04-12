'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  User, 
  UserCheck, 
  UserX, 
  RefreshCw, 
  Mail, 
  CheckCircle, 
  XCircle,
  Clock
} from 'lucide-react';
import { getEventRsvpStats } from '@/lib/supabase/events';

interface RsvpStats {
  total: number;
  accepted: number;
  declined: number;
  pending: number;
}

interface RsvpDashboardProps {
  eventId: string;
}

export function RsvpDashboard({ eventId }: RsvpDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState<RsvpStats>({
    total: 0,
    accepted: 0,
    declined: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    const fetchRsvpStats = async () => {
      try {
        setLoading(true);
        const data = await getEventRsvpStats(eventId);
        setStats(data);
      } catch (error) {
        console.error('Error fetching RSVP stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRsvpStats();
  }, [eventId, refreshKey]);
  
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };
  
  const responseRate = stats.total > 0 
    ? Math.round(((stats.accepted + stats.declined) / stats.total) * 100) 
    : 0;
  
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">RSVP Dashboard</CardTitle>
        <Button 
          onClick={handleRefresh} 
          variant="outline" 
          size="sm"
          className="ml-auto"
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-background/50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center rounded-full bg-primary/10 p-2 mb-2">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-muted-foreground text-center">Total Invited</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center rounded-full bg-green-500/10 p-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-green-500">{stats.accepted}</div>
              <p className="text-sm text-muted-foreground text-center">Accepted</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center rounded-full bg-red-500/10 p-2 mb-2">
                <XCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="text-2xl font-bold text-red-500">{stats.declined}</div>
              <p className="text-sm text-muted-foreground text-center">Declined</p>
            </CardContent>
          </Card>
          
          <Card className="bg-background/50">
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <div className="flex items-center justify-center rounded-full bg-amber-500/10 p-2 mb-2">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-amber-500">{stats.pending}</div>
              <p className="text-sm text-muted-foreground text-center">Pending</p>
            </CardContent>
          </Card>
        </div>
        
        <Card className="bg-background/50">
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Response Rate</span>
                <span className="text-sm font-medium">{responseRate}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full" 
                  style={{ width: `${responseRate}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{stats.accepted + stats.declined} responded</span>
                <span>{stats.pending} pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}

export default RsvpDashboard; 