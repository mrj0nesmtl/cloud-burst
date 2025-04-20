'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend,
} from 'recharts';
import { 
  ClockIcon, 
  CheckIcon, 
  XIcon, 
  BarChart2Icon, 
  TrendingUpIcon, 
  PercentIcon, 
} from 'lucide-react';

interface ModerationStatsProps {
  pending: number;
  approved: number;
  rejected: number;
  recentActivity?: {
    date: string;
    approved: number;
    rejected: number;
  }[];
}

export function ModerationStats({ 
  pending, 
  approved, 
  rejected,
  recentActivity = [] 
}: ModerationStatsProps) {
  const total = pending + approved + rejected;
  
  // Calculate percentages
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
  const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;
  const pendingRate = total > 0 ? Math.round((pending / total) * 100) : 0;
  
  // Default recent activity if none provided
  const activity = recentActivity.length > 0 ? recentActivity : [
    { date: '4/15', approved: 12, rejected: 3 },
    { date: '4/16', approved: 8, rejected: 2 },
    { date: '4/17', approved: 15, rejected: 5 },
    { date: '4/18', approved: 10, rejected: 4 },
    { date: '4/19', approved: 14, rejected: 6 },
    { date: '4/20', approved: 9, rejected: 1 }
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <BarChart2Icon className="mr-2 h-5 w-5 text-primary" />
          Moderation Statistics
        </CardTitle>
        <CardDescription>
          Overview of your moderation activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
                  <ClockIcon className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="mt-2 font-medium text-sm">Pending</h3>
                <p className="text-2xl font-bold">{pending}</p>
                <p className="text-muted-foreground text-xs">{pendingRate}% of total</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                  <CheckIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mt-2 font-medium text-sm">Approved</h3>
                <p className="text-2xl font-bold">{approved}</p>
                <p className="text-muted-foreground text-xs">{approvalRate}% of total</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                  <XIcon className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="mt-2 font-medium text-sm">Rejected</h3>
                <p className="text-2xl font-bold">{rejected}</p>
                <p className="text-muted-foreground text-xs">{rejectionRate}% of total</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <PercentIcon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="mt-2 font-medium text-sm">Total</h3>
                <p className="text-2xl font-bold">{total}</p>
                <p className="text-muted-foreground text-xs">All media items</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="activity">
            <div className="mt-4">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activity}
                    margin={{
                      top: 5,
                      right: 20,
                      left: 10,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="approved"
                      name="Approved"
                      stroke="#059669"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rejected"
                      name="Rejected"
                      stroke="#e11d48"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Card className="bg-green-50">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-sm font-medium text-green-800">Total Approved</h3>
                    <p className="text-2xl font-bold text-green-900 mt-1">
                      {activity.reduce((sum, item) => sum + item.approved, 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-red-50">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-sm font-medium text-red-800">Total Rejected</h3>
                    <p className="text-2xl font-bold text-red-900 mt-1">
                      {activity.reduce((sum, item) => sum + item.rejected, 0)}
                    </p>
                  </CardContent>
                </Card>
                
                <Card className="bg-blue-50">
                  <CardContent className="p-4 text-center">
                    <h3 className="text-sm font-medium text-blue-800">Approval Rate</h3>
                    <p className="text-2xl font-bold text-blue-900 mt-1">
                      {(() => {
                        const totalApproved = activity.reduce((sum, item) => sum + item.approved, 0);
                        const totalRejected = activity.reduce((sum, item) => sum + item.rejected, 0);
                        const total = totalApproved + totalRejected;
                        return total > 0 ? `${Math.round((totalApproved / total) * 100)}%` : '0%';
                      })()}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 