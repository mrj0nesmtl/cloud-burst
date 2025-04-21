'use client';

import { useState } from 'react';
import { OverviewChart } from '@/components/charts/OverviewChart';
import { getEventActivityData } from '@/lib/data/activity';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';

export function ActivitySection() {
  const [timeframe, setTimeframe] = useState<'30' | '60' | '90'>('30');
  
  const { data = [] } = useQuery({
    queryKey: ['activity-data', timeframe],
    queryFn: getEventActivityData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="rounded-lg border bg-background p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Event Activity</h2>
          <p className="text-sm text-muted-foreground">Activity over the past year</p>
        </div>
        <Link href="/protected/analytics" className="text-sm text-primary flex items-center space-x-1 hover:underline">
          <ArrowUpRight size={16} />
        </Link>
      </div>
      
      <div className="mb-6 flex items-center space-x-2">
        <TabButton
          active={timeframe === '30'}
          onClick={() => setTimeframe('30')}
        >
          30 Days
        </TabButton>
        <TabButton
          active={timeframe === '60'}
          onClick={() => setTimeframe('60')}
        >
          60 Days
        </TabButton>
      </div>
      
      <OverviewChart data={data} timeframe={timeframe} />
    </div>
  );
}

function TabButton({ 
  active, 
  onClick, 
  children 
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode 
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
        active
          ? "bg-primary text-primary-foreground"
          : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
      )}
    >
      {children}
    </button>
  );
} 