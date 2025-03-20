'use client';

import { useTheme } from 'next-themes';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useEffect, useState } from 'react';

const data = [
  {
    name: 'Jan',
    total: 12,
  },
  {
    name: 'Feb',
    total: 18,
  },
  {
    name: 'Mar',
    total: 16,
  },
  {
    name: 'Apr',
    total: 24,
  },
  {
    name: 'May',
    total: 28,
  },
  {
    name: 'Jun',
    total: 22,
  },
  {
    name: 'Jul',
    total: 29,
  },
  {
    name: 'Aug',
    total: 32,
  },
  {
    name: 'Sep',
    total: 27,
  },
  {
    name: 'Oct',
    total: 30,
  },
  {
    name: 'Nov',
    total: 25,
  },
  {
    name: 'Dec',
    total: 34,
  },
];

export function OverviewChart() {
  const { theme: mode } = useTheme();
  const [isMobile, setIsMobile] = useState(false);
  const [viewportWidth, setViewportWidth] = useState(0);
  
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
    strokeColor: 'hsl(217.2 91.2% 59.8%)',
    labelColor: 'hsl(215 20.2% 65.1%)',
    gridColor: 'hsl(240 3.7% 15.9%)'
  } : {
    backgroundColor: 'hsl(0 0% 100%)',
    strokeColor: 'hsl(221.2 83.2% 53.3%)',
    labelColor: 'hsl(215.4 16.3% 46.9%)',
    gridColor: 'hsl(214.3 31.8% 91.4%)'
  };

  // For small screens, show fewer months
  const filteredData = viewportWidth < 500 
    ? data.filter((_, index) => index % 3 === 0 || index === data.length - 1)
    : data;

  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={filteredData}
          margin={{ 
            top: 5, 
            right: 0, 
            left: -15, 
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
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={theme.strokeColor}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={theme.strokeColor}
                stopOpacity={0}
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
            tickFormatter={(value) => `${value}`}
            width={20}
            tickCount={4}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div style={{
                    background: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '4px',
                    padding: '8px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    <div style={{ fontSize: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 500 }}>Month:</span>
                        <span style={{ fontWeight: 600 }}>{payload[0].payload.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontWeight: 500 }}>Events:</span>
                        <span style={{ fontWeight: 600 }}>{payload[0].value}</span>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            }}
            wrapperStyle={{ zIndex: 100 }}
          />
          <Line
            type="monotone"
            dataKey="total"
            strokeWidth={2}
            activeDot={{
              r: 4,
              style: { fill: theme.strokeColor },
            }}
            style={{
              stroke: theme.strokeColor,
            }}
            dot={false}
            fill="url(#colorTotal)"
            fillOpacity={0.1}
            isAnimationActive={!isMobile}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 