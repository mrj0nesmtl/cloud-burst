import { getEventActivityData } from '@/lib/data/activity';
import { OverviewChart } from '@/components/charts/OverviewChart';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

async function ActivityChart() {
  const data = await getEventActivityData();
  return <OverviewChart data={data} />;
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Suspense fallback={
          <div className="col-span-4 h-[500px]">
            <Skeleton className="w-full h-full" />
          </div>
        }>
          <ActivityChart />
        </Suspense>
      </div>
    </div>
  );
} 