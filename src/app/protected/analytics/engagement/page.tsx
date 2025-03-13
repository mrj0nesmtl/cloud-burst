import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Image, 
  MessageSquare, 
  Share2, 
  Download, 
  Clock, 
  Users, 
  BarChart, 
  LineChart, 
  Filter, 
  ArrowUpRight 
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Engagement Analytics | Cloud Burst',
  description: 'Track and analyze user engagement with your events and photos',
}

export default async function EngagementAnalyticsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/auth/signin')
  }

  // In a real application, these would be fetched from the database
  // Mock data for demonstration purposes
  const engagementMetrics = {
    totalViews: 12450,
    totalLikes: 3280,
    totalComments: 845,
    totalShares: 620,
    totalDownloads: 1890,
    averageTimeSpent: '3m 42s',
    returnRate: 68.5,
    growthRate: 15.2,
  }

  // Mock data for top photos
  const topPhotos = [
    { 
      id: 'photo-1',
      event: 'Johnson Wedding',
      thumbnail: '/placeholder-image.jpg',
      views: 450, 
      likes: 120, 
      comments: 32, 
      shares: 45,
      downloads: 78
    },
    { 
      id: 'photo-2',
      event: 'Annual Corporate Retreat',
      thumbnail: '/placeholder-image.jpg',
      views: 380, 
      likes: 95, 
      comments: 18, 
      shares: 32,
      downloads: 65
    },
    { 
      id: 'photo-3',
      event: 'Tech Conference 2023',
      thumbnail: '/placeholder-image.jpg',
      views: 320, 
      likes: 85, 
      comments: 24, 
      shares: 28,
      downloads: 52
    },
    { 
      id: 'photo-4',
      event: 'Smith Anniversary',
      thumbnail: '/placeholder-image.jpg',
      views: 290, 
      likes: 75, 
      comments: 15, 
      shares: 22,
      downloads: 48
    },
  ]

  // Mock data for engagement by event
  const eventEngagement = [
    { 
      name: 'Johnson Wedding', 
      date: 'October 8, 2023', 
      views: 3200, 
      engagement: 92.3,
      retention: 78.5
    },
    { 
      name: 'Annual Corporate Retreat', 
      date: 'June 15, 2023', 
      views: 2800, 
      engagement: 87.5,
      retention: 72.1
    },
    { 
      name: 'Tech Conference 2023', 
      date: 'April 22, 2023', 
      views: 2100, 
      engagement: 76.8,
      retention: 65.4
    },
    { 
      name: 'Smith Anniversary', 
      date: 'February 14, 2023', 
      views: 1850, 
      engagement: 81.2,
      retention: 70.8
    },
  ]

  // Mock data for engagement over time
  const timeEngagement = [
    { period: 'Week 1', views: 1200, likes: 320, comments: 85, shares: 65 },
    { period: 'Week 2', views: 1450, likes: 380, comments: 92, shares: 72 },
    { period: 'Week 3', views: 1320, likes: 350, comments: 88, shares: 68 },
    { period: 'Week 4', views: 1580, likes: 420, comments: 105, shares: 80 },
    { period: 'Week 5', views: 1680, likes: 450, comments: 112, shares: 85 },
    { period: 'Week 6', views: 1520, likes: 410, comments: 98, shares: 75 },
    { period: 'Week 7', views: 1750, likes: 470, comments: 120, shares: 90 },
    { period: 'Week 8', views: 1950, likes: 520, comments: 135, shares: 105 },
  ]

  return (
    <div style={{ width: '100%', padding: '24px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Engagement Analytics</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Track and analyze user engagement with your events and photos
        </p>
      </div>
      
      <div className="flex items-center justify-between mb-6">
        <Tabs defaultValue="overview" className="w-full">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
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
                  <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.totalViews.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-500 font-medium">+{engagementMetrics.growthRate}%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Interactions</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{(engagementMetrics.totalLikes + engagementMetrics.totalComments).toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    {engagementMetrics.totalLikes.toLocaleString()} likes, {engagementMetrics.totalComments.toLocaleString()} comments
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.averageTimeSpent}</div>
                  <p className="text-xs text-muted-foreground">
                    Average time spent per session
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Return Rate</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{engagementMetrics.returnRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Users who return within 7 days
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Engagement Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Trends</CardTitle>
                <CardDescription>
                  Track engagement metrics over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Chart visualization would appear here
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Views</p>
                    <p className="text-xl font-bold">{engagementMetrics.totalViews.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Likes</p>
                    <p className="text-xl font-bold">{engagementMetrics.totalLikes.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Comments</p>
                    <p className="text-xl font-bold">{engagementMetrics.totalComments.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Shares</p>
                    <p className="text-xl font-bold">{engagementMetrics.totalShares.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Performing Content */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Top Photos</CardTitle>
                  <CardDescription>
                    Your most engaging photos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {topPhotos.slice(0, 3).map((photo) => (
                      <div key={photo.id} className="flex items-start space-x-4">
                        <div className="h-16 w-16 rounded-md bg-muted flex-shrink-0"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{photo.event}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Image className="h-3 w-3 mr-1" />
                              {photo.views}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Heart className="h-3 w-3 mr-1" />
                              {photo.likes}
                            </div>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MessageSquare className="h-3 w-3 mr-1" />
                              {photo.comments}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="col-span-1">
                <CardHeader>
                  <CardTitle>Top Events</CardTitle>
                  <CardDescription>
                    Your most engaging events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {eventEngagement.slice(0, 3).map((event) => (
                      <div key={event.name} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{event.name}</p>
                          <span className="text-xs text-muted-foreground">{event.date}</span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span>Engagement</span>
                            <span className="font-medium">{event.engagement}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${event.engagement}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Engagement by Event */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement by Event</CardTitle>
                <CardDescription>
                  Compare engagement metrics across your events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="grid grid-cols-5 gap-4 p-4 font-medium">
                    <div>Event Name</div>
                    <div>Date</div>
                    <div>Views</div>
                    <div>Engagement</div>
                    <div>Retention</div>
                  </div>
                  <div className="divide-y">
                    {eventEngagement.map((event) => (
                      <div key={event.name} className="grid grid-cols-5 gap-4 p-4 hover:bg-muted/50 transition-colors">
                        <div className="font-medium">{event.name}</div>
                        <div>{event.date}</div>
                        <div>{event.views.toLocaleString()}</div>
                        <div>{event.engagement}%</div>
                        <div>{event.retention}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Photo Analytics</CardTitle>
                <CardDescription>
                  Detailed metrics for your photo galleries
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Image className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Photo Analytics</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab would contain detailed metrics about your photos, including 
                    most viewed photos, download statistics, sharing patterns, and 
                    engagement metrics by photo type or category.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Engagement</CardTitle>
                <CardDescription>
                  Analyze user engagement across your events
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Event Engagement</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab would provide detailed engagement metrics for each event, 
                    including user behavior, popular content, peak engagement times, 
                    and comparative analysis between events.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audience" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>
                  Understand your audience and their behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <BarChart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Audience Insights</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    This tab would provide insights about your audience, including 
                    demographics, device usage, geographic distribution, and 
                    behavioral patterns across your events and galleries.
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