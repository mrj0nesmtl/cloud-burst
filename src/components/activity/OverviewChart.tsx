import { EventActivityData } from '@/lib/types';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface OverviewChartProps {
  data: EventActivityData[];
}

export function OverviewChart({ data }: OverviewChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="events" fill="#8884d8" name="Events" />
        <Bar dataKey="invitations" fill="#82ca9d" name="Invitations" />
        <Bar dataKey="rsvps" fill="#ffc658" name="RSVPs" />
        <Bar dataKey="media" fill="#ff7300" name="Media" />
      </BarChart>
    </ResponsiveContainer>
  );
} 