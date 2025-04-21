'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { EventActivityData } from '@/lib/types';

interface OverviewChartProps {
  data: EventActivityData[];
  timeframe?: '30' | '60' | '90';
}

const COLORS = {
  events: '#4361ee',
  invitations: '#ffd60a',
  rsvps: '#e63946',
  media: '#9d4edd'
};

/**
 * Activity overview chart displaying event metrics over time
 */
export function OverviewChart({ data, timeframe = '30' }: OverviewChartProps) {
  // Use the full dataset or filter based on timeframe
  const chartData = React.useMemo(() => {
    // For simplicity in this version, we're using all the data
    // In a real implementation, we would filter based on timeframe
    return data;
  }, [data, timeframe]);

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.events} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.events} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorInvitations" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.invitations} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.invitations} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorRsvps" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.rsvps} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.rsvps} stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorMedia" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.media} stopOpacity={0.8} />
              <stop offset="95%" stopColor={COLORS.media} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="month" 
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            tickLine={false}
            axisLine={false}
            style={{ fontSize: '12px' }}
            domain={[0, 'auto']}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.8)', 
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '12px'
            }}
            itemStyle={{ color: 'white' }}
            labelStyle={{ fontWeight: 'bold', color: 'white' }}
          />
          <Legend 
            verticalAlign="top"
            align="right"
            iconType="circle"
            wrapperStyle={{ paddingBottom: '20px' }}
          />
          <Area
            type="monotone"
            dataKey="events"
            name="Events"
            stroke={COLORS.events}
            fillOpacity={1}
            fill="url(#colorEvents)"
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="invitations"
            name="Invitations"
            stroke={COLORS.invitations}
            fillOpacity={1}
            fill="url(#colorInvitations)"
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="media"
            name="Media"
            stroke={COLORS.media}
            fillOpacity={1}
            fill="url(#colorMedia)"
            activeDot={{ r: 6 }}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 