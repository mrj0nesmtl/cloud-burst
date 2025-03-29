'use client'

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
  ArrowUpRight,
  Eye
} from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Define interface for analytics data structure
interface AnalyticsDataPoint {
  date: string;
  mobile: number;
  desktop: number;
  likes: number;
  comments: number;
  shares: number;
  total: number;
}

// Remove metadata export since it can't be used in client components
// export const metadata: Metadata = {
//   title: 'Engagement Analytics | Cloud Burst',
//   description: 'Track and analyze user engagement with your events and photos',
// }

export default function EngagementAnalyticsPage() {
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  const [timeRange, setTimeRange] = useState('90d');
  const [filteredData, setFilteredData] = useState<AnalyticsDataPoint[]>([]);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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

  // Real test events data based on the database
  const eventData = [
    { 
      id: '4458ad61-b208-4034-ae06-45d097bdf081',
      name: 'Test Event 01',
      description: 'Wedding',
      location: '1625 Clark, Montreal, Canada',
      date: '2025-03-14',
      status: 'published',
      accent_color: '#3b82f6'
    },
    { 
      id: '616a420e-e75d-4281-84fa-e631a055e4c9',
      name: 'March 25 Test Event',
      description: 'Version 0.8.1 Invitation Test',
      location: '1625 Clark, Montreal, H2X 2R4',
      date: '2025-03-26',
      status: 'draft',
      accent_color: '#3b82f6'
    },
    { 
      id: '6aadcf2a-53ff-43ee-83d5-32f12f3a9e3d',
      name: 'Test Event 03',
      description: 'This is a test event',
      location: '45 Rue Legendre O, Montréal, QC H2N 1G9',
      date: '2025-04-05',
      status: 'draft',
      accent_color: '#3bf55e'
    },
    { 
      id: '8527cbaf-c5c9-4733-9aec-94b1bf3e8644',
      name: 'March 26 Test Event',
      description: 'This is a test event. We are testing the invitation flow.',
      location: 'Bell Center, Montreal',
      date: '2025-03-27',
      status: 'draft',
      accent_color: '#8a154a'
    },
    { 
      id: 'c540bd44-0e19-4d13-b71e-65b023b65de8',
      name: 'Test Event 02',
      description: 'Just another Cloud Burst Evemt 😎',
      location: '2333 Shrebrooke St. W.',
      date: '2025-03-25',
      status: 'draft',
      accent_color: '#3b82f6'
    }
  ]

  // Mock data for top photos (now connected to real event data)
  const topPhotos = [
    { 
      id: 'photo-1',
      event: 'Test Event 01',
      eventId: '4458ad61-b208-4034-ae06-45d097bdf081',
      thumbnail: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: 450, 
      likes: 120, 
      comments: 32, 
      shares: 45,
      downloads: 78
    },
    { 
      id: 'photo-2',
      event: 'March 25 Test Event',
      eventId: '616a420e-e75d-4281-84fa-e631a055e4c9',
      thumbnail: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: 380, 
      likes: 95, 
      comments: 18, 
      shares: 32,
      downloads: 65
    },
    { 
      id: 'photo-3',
      event: 'Test Event 03',
      eventId: '6aadcf2a-53ff-43ee-83d5-32f12f3a9e3d',
      thumbnail: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: 320, 
      likes: 85, 
      comments: 24, 
      shares: 28,
      downloads: 52
    },
    { 
      id: 'photo-4',
      event: 'March 26 Test Event',
      eventId: '8527cbaf-c5c9-4733-9aec-94b1bf3e8644',
      thumbnail: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
      views: 290, 
      likes: 75, 
      comments: 15, 
      shares: 22,
      downloads: 48
    },
  ]

  // Mock data for engagement by event (now connected to real event data)
  const eventEngagement = [
    { 
      id: '4458ad61-b208-4034-ae06-45d097bdf081',
      name: 'Test Event 01', 
      date: 'March 14, 2025', 
      views: 3200, 
      engagement: 92.3,
      retention: 78.5
    },
    { 
      id: '616a420e-e75d-4281-84fa-e631a055e4c9',
      name: 'March 25 Test Event', 
      date: 'March 26, 2025', 
      views: 2800, 
      engagement: 87.5,
      retention: 72.1
    },
    { 
      id: '6aadcf2a-53ff-43ee-83d5-32f12f3a9e3d',
      name: 'Test Event 03', 
      date: 'April 5, 2025', 
      views: 2100, 
      engagement: 76.8,
      retention: 65.4
    },
    { 
      id: '8527cbaf-c5c9-4733-9aec-94b1bf3e8644',
      name: 'March 26 Test Event', 
      date: 'March 27, 2025', 
      views: 1850, 
      engagement: 81.2,
      retention: 70.8
    },
    {
      id: 'c540bd44-0e19-4d13-b71e-65b023b65de8',
      name: 'Test Event 02', 
      date: 'March 25, 2025', 
      views: 1450, 
      engagement: 79.5,
      retention: 68.3
    }
  ]

  // Event analytics data for charts - use useMemo to ensure consistent reference
  const analyticsData = useMemo<AnalyticsDataPoint[]>(() => {
    const data: AnalyticsDataPoint[] = [];
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 90); // 90 days ago
    
    for (let i = 0; i < 90; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      // Generate view data with variations based on weekday
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      // Base views
      const baseViews = isWeekend ? 180 + Math.random() * 120 : 100 + Math.random() * 80;
      
      // Engagement types
      const mobileViews = Math.round(baseViews * (0.6 + Math.random() * 0.2)); // 60-80% mobile
      const desktopViews = Math.round(baseViews * (0.3 + Math.random() * 0.2)); // 30-50% desktop
      const likes = Math.round((mobileViews + desktopViews) * (0.2 + Math.random() * 0.1)); // 20-30% like
      const comments = Math.round(likes * (0.2 + Math.random() * 0.15)); // 20-35% comment
      const shares = Math.round(likes * (0.1 + Math.random() * 0.1)); // 10-20% share
      
      data.push({
        date: date.toISOString().split('T')[0],
        mobile: mobileViews,
        desktop: desktopViews,
        likes: likes,
        comments: comments,
        shares: shares,
        total: mobileViews + desktopViews
      });
    }
    
    return data;
  }, []);

  // Filter data based on selected time range
  useEffect(() => {
    let daysToShow = 90;
    if (timeRange === '30d') daysToShow = 30;
    if (timeRange === '7d') daysToShow = 7;
    
    setFilteredData(analyticsData.slice(-daysToShow));
  }, [timeRange, analyticsData]);

  return (
    <div style={{ 
      width: '100%', 
      padding: isMobile ? '16px' : '24px',
      minHeight: '100vh',
      backgroundColor: 'var(--background)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Engagement Analytics</h1>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Track and analyze user engagement with your events and photos
        </p>
      </div>
      
      <div style={{ marginBottom: '24px', width: '100%' }}>
        <Tabs defaultValue="overview" style={{ width: '100%' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row', 
            alignItems: isMobile ? 'flex-start' : 'center', 
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '16px'
          }}>
            <TabsList style={{ 
              width: isMobile ? '100%' : 'auto', 
              overflowX: 'auto' 
            }}>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="photos">Photos</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
            </TabsList>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'space-between' : 'flex-end'
            }}>
              <Button variant="outline" size="sm" style={{ 
                width: isMobile ? '100%' : 'auto' 
              }}>
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm" style={{ 
                width: isMobile ? '100%' : 'auto' 
              }}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
          
          <TabsContent value="overview" style={{ 
            marginTop: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Key Metrics */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? '16px' : '24px',
              width: '100%'
            }}>
              <Card>
                <CardHeader style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 16px 8px 16px'
                }}>
                  <CardTitle style={{ fontSize: '14px', fontWeight: '500' }}>Total Views</CardTitle>
                  <Image className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent style={{ padding: '8px 16px 16px 16px' }}>
                  <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{engagementMetrics.totalViews.toLocaleString()}</div>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    <span style={{ color: '#10b981', fontWeight: '500' }}>+{engagementMetrics.growthRate}%</span> from last month
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 16px 8px 16px'
                }}>
                  <CardTitle style={{ fontSize: '14px', fontWeight: '500' }}>Interactions</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent style={{ padding: '8px 16px 16px 16px' }}>
                  <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{(engagementMetrics.totalLikes + engagementMetrics.totalComments).toLocaleString()}</div>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isMobile ? `${engagementMetrics.totalLikes.toLocaleString()} likes` : `${engagementMetrics.totalLikes.toLocaleString()} likes, ${engagementMetrics.totalComments.toLocaleString()} comments`}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 16px 8px 16px'
                }}>
                  <CardTitle style={{ fontSize: '14px', fontWeight: '500' }}>Average Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent style={{ padding: '8px 16px 16px 16px' }}>
                  <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{engagementMetrics.averageTimeSpent}</div>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isMobile ? "Avg time per session" : "Average time spent per session"}
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader style={{ 
                  display: 'flex', 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '16px 16px 8px 16px'
                }}>
                  <CardTitle style={{ fontSize: '14px', fontWeight: '500' }}>Return Rate</CardTitle>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent style={{ padding: '8px 16px 16px 16px' }}>
                  <div style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{engagementMetrics.returnRate}%</div>
                  <p style={{ fontSize: '12px', color: 'var(--muted-foreground)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {isMobile ? "Return within 7 days" : "Users who return within 7 days"}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            {/* Engagement Over Time - Using interactive area chart */}
            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-4">
                <div>
                  <CardTitle>Engagement Trends</CardTitle>
                  <CardDescription>
                    Track engagement metrics over time
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                  <Button 
                    variant={timeRange === '7d' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setTimeRange('7d')}
                  >
                    7 days
                  </Button>
                  <Button 
                    variant={timeRange === '30d' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setTimeRange('30d')}
                  >
                    30 days
                  </Button>
                  <Button 
                    variant={timeRange === '90d' ? "default" : "outline"} 
                    size="sm"
                    onClick={() => setTimeRange('90d')}
                  >
                    90 days
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div style={{ height: isMobile ? '250px' : '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={filteredData}>
                      <defs>
                        <linearGradient id="colorDesktop" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="colorMobile" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                        minTickGap={isMobile ? 30 : 60}
                      />
                      <Tooltip
                        labelFormatter={(value: string) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric'
                          });
                        }}
                        formatter={(value: number, name: string | number) => {
                          const nameStr = String(name);
                          const formattedName = nameStr === 'mobile' ? 'Mobile' : 
                            nameStr === 'desktop' ? 'Desktop' : 
                            nameStr.charAt(0).toUpperCase() + nameStr.slice(1);
                          return [value, formattedName];
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="mobile" 
                        stackId="1" 
                        stroke="#10b981" 
                        fill="url(#colorMobile)" 
                        name="Mobile"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="desktop" 
                        stackId="1" 
                        stroke="#3b82f6" 
                        fill="url(#colorDesktop)" 
                        name="Desktop"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
                  gap: '16px', 
                  marginTop: '16px' 
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Views</p>
                    <p style={{ 
                      fontSize: isMobile ? '18px' : '20px', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{engagementMetrics.totalViews.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Likes</p>
                    <p style={{ 
                      fontSize: isMobile ? '18px' : '20px', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{engagementMetrics.totalLikes.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Comments</p>
                    <p style={{ 
                      fontSize: isMobile ? '18px' : '20px', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{engagementMetrics.totalComments.toLocaleString()}</p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>Shares</p>
                    <p style={{ 
                      fontSize: isMobile ? '18px' : '20px', 
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>{engagementMetrics.totalShares.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Performing Content */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 2fr) minmax(0, 1fr)', 
              gap: isMobile ? '16px' : '24px' 
            }}>
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Photos</CardTitle>
                  <CardDescription>
                    Your most engaging photos by views, likes, and shares
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {topPhotos.map((photo) => (
                      <div key={photo.id} style={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        gap: '16px'
                      }}>
                        <div style={{
                          width: isMobile ? '100%' : '80px',
                          height: '80px',
                          borderRadius: '6px',
                          overflow: 'hidden',
                          backgroundColor: 'var(--muted)'
                        }}>
                          <img 
                            src={photo.thumbnail} 
                            alt={`${photo.event} photo`} 
                            style={{ 
                              width: '100%', 
                              height: '100%', 
                              objectFit: 'cover',
                            }} 
                          />
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ fontWeight: '500' }}>{photo.event}</div>
                          <div style={{ 
                            display: 'flex', 
                            flexWrap: 'wrap', 
                            gap: '12px', 
                            fontSize: '14px', 
                            color: 'var(--muted-foreground)'
                          }}>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <Image style={{ 
                                marginRight: '4px', 
                                height: '12px', 
                                width: '12px',
                                opacity: 0.7,
                                strokeWidth: 1
                              }} /> 
                              {photo.views.toLocaleString()}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <Heart style={{ 
                                marginRight: '4px', 
                                height: '12px', 
                                width: '12px',
                                opacity: 0.7,
                                strokeWidth: 1
                              }} /> 
                              {photo.likes.toLocaleString()}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <MessageSquare style={{ 
                                marginRight: '4px', 
                                height: '12px', 
                                width: '12px',
                                opacity: 0.7,
                                strokeWidth: 1
                              }} /> 
                              {photo.comments.toLocaleString()}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center' }}>
                              <Share2 style={{ 
                                marginRight: '4px', 
                                height: '12px', 
                                width: '12px',
                                opacity: 0.7,
                                strokeWidth: 1
                              }} /> 
                              {photo.shares.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Events</CardTitle>
                  <CardDescription>
                    Your most engaging events
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {eventEngagement.slice(0, 3).map((event) => (
                      <div key={event.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <p style={{ fontSize: '14px', fontWeight: '500' }}>{event.name}</p>
                          <span style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>{event.date}</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                            <span>Engagement</span>
                            <span style={{ fontWeight: '500' }}>{event.engagement}%</span>
                          </div>
                          <div style={{ 
                            height: '6px', 
                            backgroundColor: 'var(--muted)', 
                            borderRadius: '9999px', 
                            overflow: 'hidden' 
                          }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                backgroundColor: 'var(--primary)', 
                                borderRadius: '9999px',
                                width: `${event.engagement}%` 
                              }}
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
              <CardContent style={{ overflowX: isMobile ? 'auto' : 'visible' }}>
                <div style={{
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  width: '100%',
                  minWidth: isMobile ? 'auto' : '100%',
                  overflowX: isMobile ? 'auto' : 'visible'
                }}>
                  {!isMobile ? (
                    <>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(5, 1fr)', 
                        gap: '16px', 
                        padding: '16px', 
                        fontWeight: '500' 
                      }}>
                        <div>Event Name</div>
                        <div>Date</div>
                        <div>Views</div>
                        <div>Engagement</div>
                        <div>Retention</div>
                      </div>
                      <div style={{ borderTop: '1px solid var(--border)' }}>
                        {eventEngagement.map((event) => (
                          <div key={event.name} style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(5, 1fr)', 
                            gap: '16px', 
                            padding: '16px', 
                            transition: 'background-color 0.2s'
                          }}>
                            <div style={{ fontWeight: '500' }}>{event.name}</div>
                            <div>{event.date}</div>
                            <div>{event.views.toLocaleString()}</div>
                            <div>{event.engagement}%</div>
                            <div>{event.retention}%</div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    // Mobile-friendly view without horizontal scroll
                    <div>
                      {eventEngagement.map((event) => (
                        <div key={event.name} style={{
                          padding: '16px',
                          borderBottom: '1px solid var(--border)',
                        }}>
                          <div style={{ fontWeight: '500', marginBottom: '8px' }}>{event.name}</div>
                          <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '8px',
                            fontSize: '14px'
                          }}>
                            <div style={{ color: 'var(--muted-foreground)' }}>Date:</div>
                            <div>{event.date}</div>
                            
                            <div style={{ color: 'var(--muted-foreground)' }}>Views:</div>
                            <div>{event.views.toLocaleString()}</div>
                            
                            <div style={{ color: 'var(--muted-foreground)' }}>Engagement:</div>
                            <div>{event.engagement}%</div>
                            
                            <div style={{ color: 'var(--muted-foreground)' }}>Retention:</div>
                            <div>{event.retention}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="photos" style={{ marginTop: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle>Photo Analytics</CardTitle>
                <CardDescription>
                  Detailed metrics for your photo galleries
                </CardDescription>
              </CardHeader>
              <CardContent style={{ 
                height: isMobile ? '300px' : '400px',
                overflow: 'auto'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Photo Analytics</h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', maxWidth: '400px', margin: '0 auto' }}>
                    Most viewed photos from your recent events
                  </p>
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? 'repeat(1, 1fr)' : 'repeat(3, 1fr)', 
                  gap: '16px'
                }}>
                  {[
                    {
                      id: 'gallery-1',
                      url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                      event: 'Johnson Wedding',
                      views: 450
                    },
                    {
                      id: 'gallery-2',
                      url: 'https://images.unsplash.com/photo-1551731409-43eb3e517a1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                      event: 'Corporate Retreat',
                      views: 380
                    },
                    {
                      id: 'gallery-3',
                      url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                      event: 'Tech Conference',
                      views: 320
                    },
                    {
                      id: 'gallery-4',
                      url: 'https://images.unsplash.com/photo-1519741347686-c1e0aadf4611?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                      event: 'Smith Anniversary',
                      views: 290
                    },
                    {
                      id: 'gallery-5',
                      url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                      event: 'Garcia Wedding',
                      views: 275
                    },
                    {
                      id: 'gallery-6',
                      url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
                      event: 'Birthday Party',
                      views: 245
                    }
                  ].map(photo => (
                    <div key={photo.id} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      border: '1px solid var(--border)'
                    }}>
                      <div style={{
                        height: '160px',
                        width: '100%',
                        overflow: 'hidden'
                      }}>
                        <img 
                          src={photo.url} 
                          alt={`${photo.event} photo`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                      </div>
                      <div style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>{photo.event}</div>
                        <div style={{ fontSize: '14px', color: 'var(--muted-foreground)', display: 'flex', alignItems: 'center' }}>
                          <Eye className="h-3 w-3 mr-1" /> {photo.views.toLocaleString()} views
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events" style={{ marginTop: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle>Event Engagement</CardTitle>
                <CardDescription>
                  Analyze user engagement across your events
                </CardDescription>
              </CardHeader>
              <CardContent style={{ 
                height: isMobile ? '300px' : '400px',
                overflow: 'auto'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Event Engagement</h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', maxWidth: '400px', margin: '0 auto' }}>
                    Top performing events by engagement metrics
                  </p>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {eventEngagement.map((event, index) => (
                    <div key={event.name} style={{
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      gap: '16px',
                      padding: '16px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: index === 0 ? 'rgba(var(--primary), 0.05)' : 'transparent'
                    }}>
                      <div style={{
                        minWidth: isMobile ? '100%' : '80px',
                        width: isMobile ? '100%' : '80px',
                        height: '80px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        backgroundColor: 'var(--muted)'
                      }}>
                        <img 
                          src={topPhotos.find(photo => photo.event.includes(event.name.split(' ')[0]))?.thumbnail || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'} 
                          alt={`${event.name} event`} 
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            objectFit: 'cover' 
                          }} 
                        />
                      </div>
                      
                      <div style={{ 
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: isMobile ? 'flex-start' : 'center', 
                          justifyContent: 'space-between',
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? '4px' : '0',
                        }}>
                          <h4 style={{ fontWeight: '500', fontSize: '16px' }}>{event.name}</h4>
                          <span style={{ fontSize: '14px', color: 'var(--muted-foreground)' }}>{event.date}</span>
                        </div>
                        
                        <div style={{ 
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gap: '16px',
                          marginTop: '8px'
                        }}>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Views</div>
                            <div style={{ fontWeight: '500' }}>{event.views.toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Engagement</div>
                            <div style={{ fontWeight: '500' }}>{event.engagement}%</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '12px', color: 'var(--muted-foreground)' }}>Retention</div>
                            <div style={{ fontWeight: '500' }}>{event.retention}%</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audience" style={{ marginTop: '24px' }}>
            <Card>
              <CardHeader>
                <CardTitle>Audience Insights</CardTitle>
                <CardDescription>
                  Understand your audience and their behavior
                </CardDescription>
              </CardHeader>
              <CardContent style={{ 
                height: isMobile ? '300px' : '400px',
                overflow: 'auto'
              }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>Audience Insights</h3>
                  <p style={{ fontSize: '14px', color: 'var(--muted-foreground)', maxWidth: '400px', margin: '0 auto' }}>
                    Understand who's engaging with your content
                  </p>
                </div>
                
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                  gap: '24px'
                }}>
                  <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Age Demographics</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { group: '18-24', percentage: 15 },
                        { group: '25-34', percentage: 42 },
                        { group: '35-44', percentage: 28 },
                        { group: '45-54', percentage: 10 },
                        { group: '55+', percentage: 5 }
                      ].map(item => (
                        <div key={item.group}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px' }}>{item.group}</span>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.percentage}%</span>
                          </div>
                          <div style={{ 
                            height: '8px', 
                            backgroundColor: 'var(--muted)', 
                            borderRadius: '9999px', 
                            overflow: 'hidden' 
                          }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                backgroundColor: 'var(--primary)', 
                                borderRadius: '9999px',
                                width: `${item.percentage}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Device Usage</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        { device: 'Mobile', percentage: 68 },
                        { device: 'Desktop', percentage: 24 },
                        { device: 'Tablet', percentage: 8 }
                      ].map(item => (
                        <div key={item.device}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontSize: '14px' }}>{item.device}</span>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.percentage}%</span>
                          </div>
                          <div style={{ 
                            height: '8px', 
                            backgroundColor: 'var(--muted)', 
                            borderRadius: '9999px', 
                            overflow: 'hidden' 
                          }}>
                            <div 
                              style={{ 
                                height: '100%', 
                                backgroundColor: 'var(--primary)', 
                                borderRadius: '9999px',
                                width: `${item.percentage}%` 
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div style={{
                    padding: '20px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    gridColumn: isMobile ? 'auto' : '1 / -1'
                  }}>
                    <h4 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '16px' }}>Traffic Sources</h4>
                    <div style={{ 
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                      gap: '16px'
                    }}>
                      {[
                        { source: 'Direct Link', percentage: 32 },
                        { source: 'Email', percentage: 28 },
                        { source: 'Social Media', percentage: 25 },
                        { source: 'Search', percentage: 10 },
                        { source: 'Other', percentage: 5 }
                      ].map(item => (
                        <div key={item.source} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '2px', 
                            backgroundColor: 'var(--primary)' 
                          }} />
                          <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px' }}>{item.source}</span>
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}