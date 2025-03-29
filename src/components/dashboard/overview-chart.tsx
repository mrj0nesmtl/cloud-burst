'use client';

import { useTheme } from 'next-themes';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { useEffect, useState, useMemo } from 'react';

// Generate more detailed mock data with events, attendees and photos
const generateMonthlyData = () => {
  const currentYear = new Date().getFullYear();
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  return months.map((month, index) => {
    // Base values with some randomness to create natural patterns
    const baseEvents = 10 + Math.floor(Math.random() * 30);
    const isHighSeason = index >= 4 && index <= 8; // May to September
    const seasonalFactor = isHighSeason ? 1.5 : 1;
    
    // Events have seasonal patterns
    const events = Math.floor(baseEvents * seasonalFactor);
    
    // Attendees per event increases in high season
    const attendeesPerEvent = isHighSeason ? 
      Math.floor(15 + Math.random() * 20) : 
      Math.floor(8 + Math.random() * 12);
    
    // Photos per attendee also increases in high season
    const photosPerAttendee = isHighSeason ?
      Math.floor(3 + Math.random() * 4) :
      Math.floor(1 + Math.random() * 3);
    
    // Calculate total metrics
    const attendees = events * attendeesPerEvent;
    const photos = attendees * photosPerAttendee;
    
    return {
      name: month,
      fullDate: `${month} ${currentYear}`,
      events,
      attendees,
      photos
    };
  });
};

export function OverviewChart() {
  const { theme: mode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  const [activeMetric, setActiveMetric] = useState('all');
  
  // Generate data once and memoize it
  const data = useMemo(() => generateMonthlyData(), []);
  
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
    photosColor: 'hsl(346.8 77.2% 49.8%)',
    labelColor: 'hsl(215 20.2% 65.1%)',
    gridColor: 'hsl(240 3.7% 15.9%)'
  } : {
    backgroundColor: 'hsl(0 0% 100%)',
    eventsColor: 'hsl(221.2 83.2% 53.3%)',
    attendeesColor: 'hsl(142.1 76.2% 36.3%)',
    photosColor: 'hsl(346.8 77.2% 49.8%)',
    labelColor: 'hsl(215.4 16.3% 46.9%)',
    gridColor: 'hsl(214.3 31.8% 91.4%)'
  };

  // For small screens, show fewer months
  const filteredData = viewportWidth < 500 
    ? data.filter((_, index) => index % 3 === 0 || index === data.length - 1)
    : data;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        right: isMobile ? 10 : 20, 
        display: 'flex', 
        gap: '8px', 
        zIndex: 10 
      }}>
        <button 
          onClick={() => setActiveMetric('all')} 
          style={{ 
            fontSize: '10px', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: 'none', 
            background: activeMetric === 'all' ? 'var(--primary)' : 'var(--muted)', 
            color: activeMetric === 'all' ? 'white' : 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          All
        </button>
        <button 
          onClick={() => setActiveMetric('events')} 
          style={{ 
            fontSize: '10px', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: 'none', 
            background: activeMetric === 'events' ? 'var(--primary)' : 'var(--muted)', 
            color: activeMetric === 'events' ? 'white' : 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          Events
        </button>
        <button 
          onClick={() => setActiveMetric('attendees')} 
          style={{ 
            fontSize: '10px', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: 'none', 
            background: activeMetric === 'attendees' ? 'var(--primary)' : 'var(--muted)', 
            color: activeMetric === 'attendees' ? 'white' : 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          Attendees
        </button>
        <button 
          onClick={() => setActiveMetric('photos')} 
          style={{ 
            fontSize: '10px', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            border: 'none', 
            background: activeMetric === 'photos' ? 'var(--primary)' : 'var(--muted)', 
            color: activeMetric === 'photos' ? 'white' : 'var(--foreground)',
            cursor: 'pointer'
          }}
        >
          Photos
        </button>
      </div>

      <div style={{ width: '100%', height: '100%', marginTop: '30px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={filteredData}
            margin={{ 
              top: 10, 
              right: 10, 
              left: isMobile ? -5 : 0, 
              bottom: 0 
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke={theme.gridColor}
              strokeOpacity={0.5}
            />
            <defs>
              <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.eventsColor}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme.eventsColor}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="colorAttendees" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.attendeesColor}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme.attendeesColor}
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="colorPhotos" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={theme.photosColor}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={theme.photosColor}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              stroke={theme.labelColor}
              fontSize={9}
              tickLine={false}
              axisLine={false}
              padding={{ left: 0, right: 0 }}
              height={20}
              interval={isMobile ? 'preserveStartEnd' : 0}
            />
            <YAxis
              stroke={theme.labelColor}
              fontSize={9}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value > 999 ? `${(value / 1000).toFixed(1)}k` : value}
              width={30}
              tickCount={5}
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
                        {payload[0].payload.fullDate}
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
                            <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'events')?.value}</span>
                          </div>
                        )}
                        {(activeMetric === 'all' || activeMetric === 'attendees') && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: theme.attendeesColor 
                            }} />
                            <span style={{ flex: 1 }}>Attendees:</span>
                            <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'attendees')?.value}</span>
                          </div>
                        )}
                        {(activeMetric === 'all' || activeMetric === 'photos') && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ 
                              width: '8px', 
                              height: '8px', 
                              borderRadius: '50%', 
                              backgroundColor: theme.photosColor 
                            }} />
                            <span style={{ flex: 1 }}>Photos:</span>
                            <span style={{ fontWeight: '600' }}>{payload.find(p => p.dataKey === 'photos')?.value}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
                return null;
              }}
              wrapperStyle={{ zIndex: 100 }}
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
                activeDot={{ r: 5 }}
                isAnimationActive={!isMobile}
              />
            )}
            
            {(activeMetric === 'all' || activeMetric === 'attendees') && (
              <Area
                type="monotone"
                dataKey="attendees"
                stackId="2"
                stroke={theme.attendeesColor}
                strokeWidth={2}
                fill="url(#colorAttendees)"
                fillOpacity={activeMetric === 'all' ? 0.3 : 0.5}
                activeDot={{ r: 5 }}
                isAnimationActive={!isMobile}
              />
            )}
            
            {(activeMetric === 'all' || activeMetric === 'photos') && (
              <Area
                type="monotone"
                dataKey="photos"
                stackId="3"
                stroke={theme.photosColor}
                strokeWidth={2}
                fill="url(#colorPhotos)"
                fillOpacity={activeMetric === 'all' ? 0.2 : 0.5}
                activeDot={{ r: 5 }}
                isAnimationActive={!isMobile}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 