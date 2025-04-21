import { useState } from 'react';
import { EventActivityData } from '@/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OverviewChart } from '@/components/charts/OverviewChart';
import { ActivityGrid } from '@/components/activity/ActivityGrid';

interface ActivityOverviewProps {
  data: EventActivityData[];
}

export function ActivityOverview({ data }: ActivityOverviewProps) {
  const [view, setView] = useState<'chart' | 'grid'>('chart');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Activity Overview</CardTitle>
        <Tabs value={view} onValueChange={(v) => setView(v as 'chart' | 'grid')}>
          <TabsList>
            <TabsTrigger value="chart">Chart</TabsTrigger>
            <TabsTrigger value="grid">Grid</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <TabsContent value="chart" className="mt-0">
          <div className="h-[400px]">
            <OverviewChart data={data} />
          </div>
        </TabsContent>
        <TabsContent value="grid" className="mt-0">
          <ActivityGrid data={data} />
        </TabsContent>
      </CardContent>
    </Card>
  );
} 