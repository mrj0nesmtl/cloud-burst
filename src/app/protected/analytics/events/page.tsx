import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Calendar, Users, TrendingUp, BarChart, PieChart, Download, Filter } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Event Analytics | Cloud Burst',
  description: 'Track and analyze your event performance metrics',
}

export default function EventAnalyticsPage() {
  // Create a simplified version without async/await to ensure it renders
  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Event Analytics</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Track and analyze your event performance metrics
        </p>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    3 active, 1 upcoming
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">842</div>
                  <p className="text-xs text-muted-foreground">
                    Avg. 70 per event
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registration Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68.5%</div>
                  <p className="text-xs text-muted-foreground">
                    Conversion from invites to registrations
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">+12.4%</div>
                  <p className="text-xs text-muted-foreground">
                    Increase in attendees vs. last year
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Event Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Event Distribution</CardTitle>
                  <CardDescription>
                    Breakdown of events by type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <PieChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Chart visualization would appear here
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary opacity-30"></div>
                        <span className="text-sm">Wedding</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">4</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">33.3%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary opacity-25"></div>
                        <span className="text-sm">Corporate</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">3</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">25%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-primary opacity-20"></div>
                        <span className="text-sm">Birthday</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-medium">2</span>
                        <span className="text-sm text-muted-foreground w-12 text-right">16.7%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Monthly Events</CardTitle>
                  <CardDescription>
                    Number of events and attendees per month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Chart visualization would appear here
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Events</p>
                      <p className="text-xl font-bold">12</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Busiest Month</p>
                      <p className="text-xl font-bold">June</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Avg. per Month</p>
                      <p className="text-xl font-bold">1.2</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Top Performing Events */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Events</CardTitle>
                <CardDescription>
                  Your most successful events by attendance and engagement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                    <div>Event Name</div>
                    <div>Date</div>
                    <div>Attendees</div>
                    <div>Photos</div>
                    <div>Engagement</div>
                  </div>
                  <div className="divide-y">
                    <div className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="font-medium">Annual Corporate Retreat</div>
                      <div>June 15, 2023</div>
                      <div>120</div>
                      <div>450</div>
                      <div>87.5%</div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="font-medium">Johnson Wedding</div>
                      <div>October 8, 2023</div>
                      <div>110</div>
                      <div>620</div>
                      <div>92.3%</div>
                    </div>
                    <div className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className="font-medium">Tech Conference 2023</div>
                      <div>April 22, 2023</div>
                      <div>85</div>
                      <div>320</div>
                      <div>76.8%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="attendance" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Analytics</CardTitle>
                <CardDescription>
                  Detailed attendance metrics and patterns
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Attendance Analytics</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab would contain detailed attendance metrics, including demographics, 
                    attendance patterns, no-show rates, and registration conversion funnels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Trends</CardTitle>
                <CardDescription>
                  Analyze trends and patterns across your events
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Event Trends</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab would show trends over time, including growth in attendance, 
                    seasonal patterns, and year-over-year comparisons.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="comparison" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Comparison</CardTitle>
                <CardDescription>
                  Compare performance across different events
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Event Comparison</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab would allow you to compare metrics across different events, 
                    event types, or time periods to identify patterns and best practices.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 