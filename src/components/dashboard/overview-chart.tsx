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
import { getEventActivityData, EventActivityData } from '@/lib/supabase/dashboard';

// Time range options for filtering
type TimeRange = '7d' | '14d' | '30d' | '6m' | '1y';

export function OverviewChart() {
  const { theme: mode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeMetric, setActiveMetric] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<EventActivityData[]>([]);
  const [filteredData, setFilteredData] = useState<EventActivityData[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('1y');
  
  // Fetch data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        const activityData = await getEventActivityData();
        setData(activityData);
        setFilteredData(activityData);
      } catch (err) {
        console.error('Error fetching chart data:', err);
        setError('Failed to load chart data');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchData();
  }, []);
  
  // Apply time range filter whenever it changes
  useEffect(() => {
    if (!data.length) return;
    
    let filteredResults = [...data];
    
    // Apply time range filter
    if (timeRange !== '1y') {
      const today = new Date();
      let cutoffDate = new Date();
      
      switch (timeRange) {
        case '7d':
          cutoffDate.setDate(today.getDate() - 7);
          break;
        case '14d':
          cutoffDate.setDate(today.getDate() - 14);
          break;
        case '30d':
          cutoffDate.setDate(today.getDate() - 30);
          break;
        case '6m':
          cutoffDate.setMonth(today.getMonth() - 6);
          break;
      }
      
      // Only keep months that are after the cutoff date
      const filteredMonths = data.filter(item => {
        // Parse month names like "Jan 2024" or "January 2024"
        const monthParts = item.fullMonth.split(' ');
        const monthName = monthParts[0];
        const year = parseInt(monthParts[1]);
        
        // Map month name to month number (0-based)
        const monthNames = [
          'January', 'February', 'March', 'April', 'May', 'June',
          'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        let monthIndex = monthNames.findIndex(m => m.startsWith(monthName));
        if (monthIndex === -1) {
          monthIndex = shortMonthNames.findIndex(m => m === monthName);
        }
        
        if (monthIndex === -1 || isNaN(year)) return true; // Include if we can't parse the date
        
        const itemDate = new Date(year, monthIndex, 1);
        return itemDate >= cutoffDate;
      });
      
      filteredResults = filteredMonths;
    }
    
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
    
    // Check initially
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
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
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--muted-foreground)'
      }}>
        Loading chart data...
      </div>
    );
  }

  // Display error state
  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'var(--muted-foreground)'
      }}>
        {error}
      </div>
    );
  }

  // Style for the filter buttons
  const filterButtonStyle = (active: boolean) => ({
    fontSize: isMobile ? '11px' : '12px',
    padding: isMobile ? '6px 12px' : '8px 14px',
    borderRadius: '6px',
    border: active ? '1px solid var(--primary)' : '1px solid transparent',
    background: active ? 'var(--primary)' : 'var(--muted)',
    color: active ? 'white' : 'var(--muted-foreground)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontWeight: active ? '600' : 'normal',
    boxShadow: active ? '0 0 5px 0 var(--primary)' : 'none',
    position: 'relative',
    zIndex: active ? 2 : 1,
    marginBottom: '6px',
  });

  // Style for active indicator
  const indicatorStyle = {
    position: 'absolute',
    bottom: '-2px',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '16px',
    height: '2px',
    backgroundColor: 'white',
    borderRadius: '1px',
  } as const;

  // Additional class to indicate active state with a bottom indicator
  const ActiveIndicator = ({ active }: { active: boolean }) => {
    if (!active) return null;
    
    return (
      <div style={indicatorStyle} />
    );
  };

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Time range filters */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        display: 'flex', 
        gap: isMobile ? '4px' : '6px', 
        zIndex: 10,
        paddingLeft: isMobile ? '4px' : '8px',
        paddingTop: '2px',
      }}>
        <button 
          onClick={() => setTimeRange('7d')} 
          style={{...filterButtonStyle(timeRange === '7d'), position: 'relative'}}
          aria-pressed={timeRange === '7d'}
        >
          7 Days
          <ActiveIndicator active={timeRange === '7d'} />
        </button>
        <button 
          onClick={() => setTimeRange('14d')} 
          style={{...filterButtonStyle(timeRange === '14d'), position: 'relative'}}
          aria-pressed={timeRange === '14d'}
        >
          14 Days
          <ActiveIndicator active={timeRange === '14d'} />
        </button>
        <button 
          onClick={() => setTimeRange('30d')} 
          style={{...filterButtonStyle(timeRange === '30d'), position: 'relative'}}
          aria-pressed={timeRange === '30d'}
        >
          30 Days
          <ActiveIndicator active={timeRange === '30d'} />
        </button>
        <button 
          onClick={() => setTimeRange('6m')} 
          style={{...filterButtonStyle(timeRange === '6m'), position: 'relative'}}
          aria-pressed={timeRange === '6m'}
        >
          6 Months
          <ActiveIndicator active={timeRange === '6m'} />
        </button>
        <button 
          onClick={() => setTimeRange('1y')} 
          style={{...filterButtonStyle(timeRange === '1y'), position: 'relative'}}
          aria-pressed={timeRange === '1y'}
        >
          1 Year
          <ActiveIndicator active={timeRange === '1y'} />
        </button>
      </div>

      {/* Metric filters */}
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: isMobile ? 10 : 20, 
        display: 'flex', 
        gap: isMobile ? '4px' : '8px', 
        zIndex: 10 
      }}>
        <button 
          onClick={() => setActiveMetric('all')} 
          style={{...filterButtonStyle(activeMetric === 'all'), position: 'relative'}}
          aria-pressed={activeMetric === 'all'}
        >
          All
          <ActiveIndicator active={activeMetric === 'all'} />
        </button>
        <button 
          onClick={() => setActiveMetric('events')} 
          style={{...filterButtonStyle(activeMetric === 'events'), position: 'relative'}}
          aria-pressed={activeMetric === 'events'}
        >
          Events
          <ActiveIndicator active={activeMetric === 'events'} />
        </button>
        <button 
          onClick={() => setActiveMetric('invitations')} 
          style={{...filterButtonStyle(activeMetric === 'invitations'), position: 'relative'}}
          aria-pressed={activeMetric === 'invitations'}
        >
          Invitations
          <ActiveIndicator active={activeMetric === 'invitations'} />
        </button>
        <button 
          onClick={() => setActiveMetric('media')} 
          style={{...filterButtonStyle(activeMetric === 'media'), position: 'relative'}}
          aria-pressed={activeMetric === 'media'}
        >
          Media
          <ActiveIndicator active={activeMetric === 'media'} />
        </button>
      </div>
      
      <div style={{ width: '100%', height: '100%', marginTop: '40px' }}>
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
    </div>
  );
} 