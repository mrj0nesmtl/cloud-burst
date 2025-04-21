'use client';

import { useTheme } from 'next-themes';
import { 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { useEffect, useState } from 'react';
import { EventActivityData, TimeRange } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OverviewChartProps {
  data: EventActivityData[];
  isLoading?: boolean;
}

export function OverviewChart({ data, isLoading = false }: OverviewChartProps) {
  const { theme: mode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeMetric, setActiveMetric] = useState('all');
  const [filteredData, setFilteredData] = useState<EventActivityData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('90d');
  
  // Apply time range filter whenever it changes
  useEffect(() => {
    if (!data?.length) {
      setFilteredData([]);
      return;
    }
    
    let filteredResults = [...data];
    
    // Apply time range filter
    const today = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '30d':
        cutoffDate.setDate(today.getDate() - 30);
        break;
      case '60d':
        cutoffDate.setDate(today.getDate() - 60);
        break;
      case '90d':
        cutoffDate.setDate(today.getDate() - 90);
        break;
    }
    
    // Only keep months that are after the cutoff date
    const filteredMonths = data.filter(item => {
      const monthParts = item.fullMonth.split(' ');
      const monthName = monthParts[0];
      const year = parseInt(monthParts[1]);
      
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      let monthIndex = monthNames.findIndex(m => m.startsWith(monthName));
      if (monthIndex === -1) {
        monthIndex = shortMonthNames.findIndex(m => m === monthName);
      }
      
      if (monthIndex === -1 || isNaN(year)) return true;
      
      const itemDate = new Date(year, monthIndex, 1);
      return itemDate >= cutoffDate;
    });
    
    filteredResults = filteredMonths;
    
    // For small screens, show fewer data points
    if (viewportWidth < 500) {
      const step = Math.max(1, Math.floor(filteredResults.length / 5));
      filteredResults = filteredResults.filter((_, index) => 
        index % step === 0 || index === filteredResults.length - 1
      );
    }
    
    setFilteredData(filteredResults);
  }, [timeRange, data, viewportWidth]);
  
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setViewportWidth(width);
      setIsMobile(width < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  const theme = mode === 'dark' ? {
    backgroundColor: 'hsl(240 10% 3.9%)',
    eventsColor: 'hsl(217.2 91.2% 59.8%)',
    attendeesColor: 'hsl(142.1 76.2% 36.3%)',
    mediaColor: 'hsl(346.8 77.2% 49.8%)',
    invitationsColor: 'hsl(43.2 96.4% 59.4%)',
    rsvpsColor: 'hsl(262.1 83.3% 57.8%)',
    labelColor: 'hsl(215 20.2% 65.1%)',
    gridColor: 'hsl(240 3.7% 15.9%)'
  } : {
    backgroundColor: 'hsl(0 0% 100%)',
    eventsColor: 'hsl(221.2 83.2% 53.3%)',
    attendeesColor: 'hsl(142.1 76.2% 36.3%)',
    mediaColor: 'hsl(346.8 77.2% 49.8%)',
    invitationsColor: 'hsl(48 96% 53%)',
    rsvpsColor: 'hsl(262.1 83.3% 57.8%)',
    labelColor: 'hsl(215.4 16.3% 46.9%)',
    gridColor: 'hsl(214.3 31.8% 91.4%)'
  };

  // Display loading state
  if (isLoading) {
    return (
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Activity Overview</CardTitle>
          <CardDescription>Loading activity data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-muted-foreground">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle>Activity Overview</CardTitle>
        <CardDescription>
          Track event activity metrics over time
        </CardDescription>
        <div className="flex items-center space-x-2">
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('30d')}
            size="sm"
          >
            30 days
          </Button>
          <Button
            variant={timeRange === '60d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('60d')}
            size="sm"
          >
            60 days
          </Button>
          <Button
            variant={timeRange === '90d' ? 'default' : 'outline'}
            onClick={() => setTimeRange('90d')}
            size="sm"
          >
            90 days
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 10,
                bottom: 10,
              }}
            >
              <defs>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.eventsColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.eventsColor} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorInvitations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.invitationsColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.invitationsColor} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorRSVPs" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.rsvpsColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.rsvpsColor} stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={theme.mediaColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={theme.mediaColor} stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={theme.gridColor}
                opacity={0.6}
              />
              
              <XAxis 
                dataKey="month" 
                tick={{ fill: theme.labelColor, fontSize: isMobile ? 10 : 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                dy={10}
                padding={{ left: 20, right: 20 }}
              />
              
              <YAxis 
                tick={{ fill: theme.labelColor, fontSize: isMobile ? 10 : 12 }}
                tickLine={{ stroke: theme.gridColor }}
                axisLine={{ stroke: theme.gridColor }}
                width={40}
                dx={-5}
                tickFormatter={(value) => value === 0 ? '0' : value}
                allowDecimals={false}
                padding={{ top: 20, bottom: 20 }}
              />
              
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div style={{
                        background: 'var(--card)',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        padding: '12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }}>
                        <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>
                          {payload[0].payload.fullMonth}
                        </div>
                        <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(activeMetric === 'all' || activeMetric === 'events') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                backgroundColor: theme.eventsColor 
                              }} />
                              <span style={{ flex: 1 }}>Events:</span>
                              <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'events')?.value || 0}</span>
                            </div>
                          )}
                          
                          {(activeMetric === 'all' || activeMetric === 'invitations') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                backgroundColor: theme.invitationsColor 
                              }} />
                              <span style={{ flex: 1 }}>Invitations:</span>
                              <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'invitations')?.value || 0}</span>
                            </div>
                          )}
                          
                          {(activeMetric === 'all' || activeMetric === 'invitations') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                backgroundColor: theme.rsvpsColor 
                              }} />
                              <span style={{ flex: 1 }}>RSVPs:</span>
                              <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'rsvps')?.value || 0}</span>
                            </div>
                          )}
                          
                          {(activeMetric === 'all' || activeMetric === 'media') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div style={{ 
                                width: '8px', 
                                height: '8px', 
                                borderRadius: '50%', 
                                backgroundColor: theme.mediaColor 
                              }} />
                              <span style={{ flex: 1 }}>Media:</span>
                              <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'media')?.value || 0}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  
                  return null;
                }}
              />
              
              {(activeMetric === 'all' || activeMetric === 'events') && (
                <Area
                  type="monotone"
                  dataKey="events"
                  stackId="1"
                  stroke={theme.eventsColor}
                  strokeWidth={2}
                  fill="url(#colorEvents)"
                  fillOpacity={0.5}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive={!isMobile}
                  animationDuration={1000}
                />
              )}
              
              {(activeMetric === 'all' || activeMetric === 'invitations') && (
                <Area
                  type="monotone"
                  dataKey="invitations"
                  stackId="2"
                  stroke={theme.invitationsColor}
                  strokeWidth={2}
                  fill="url(#colorInvitations)"
                  fillOpacity={activeMetric === 'all' ? 0.3 : 0.5}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive={!isMobile}
                  animationDuration={1000}
                />
              )}
              
              {(activeMetric === 'all' || activeMetric === 'invitations') && (
                <Area
                  type="monotone"
                  dataKey="rsvps"
                  stackId="3"
                  stroke={theme.rsvpsColor}
                  strokeWidth={2}
                  fill="url(#colorRSVPs)"
                  fillOpacity={activeMetric === 'all' ? 0.2 : 0.5}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive={!isMobile}
                  animationDuration={1000}
                />
              )}
              
              {(activeMetric === 'all' || activeMetric === 'media') && (
                <Area
                  type="monotone"
                  dataKey="media"
                  stackId="4"
                  stroke={theme.mediaColor}
                  strokeWidth={2}
                  fill="url(#colorMedia)"
                  fillOpacity={activeMetric === 'all' ? 0.2 : 0.5}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                  isAnimationActive={!isMobile}
                  animationDuration={1000}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
} 