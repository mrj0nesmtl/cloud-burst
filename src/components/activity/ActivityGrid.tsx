import { EventActivityData } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ActivityGridProps {
  data: EventActivityData[];
}

export function ActivityGrid({ data }: ActivityGridProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Month</TableHead>
            <TableHead className="text-right">Events</TableHead>
            <TableHead className="text-right">Invitations</TableHead>
            <TableHead className="text-right">RSVPs</TableHead>
            <TableHead className="text-right">Media</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.month}>
              <TableCell className="font-medium">{item.fullMonth}</TableCell>
              <TableCell className="text-right">{item.events}</TableCell>
              <TableCell className="text-right">{item.invitations}</TableCell>
              <TableCell className="text-right">{item.rsvps}</TableCell>
              <TableCell className="text-right">{item.media}</TableCell>
              <TableCell className="text-right">{item.total}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 