'use client'

import { useState, useEffect } from 'react'
import { 
  Mail, 
  MoreHorizontal, 
  Send, 
  Trash, 
  Copy, 
  Clock,
  CheckCircle2,
  XCircle,
  Eye,
  Link,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import { cn } from '@/lib/utils'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Input,
} from '@/components/ui/input'
import {
  LoadingSpinner,
} from '@/components/ui/loading-spinner'
import { Card } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Define a simple Invitation interface directly in this file
interface Invitation {
  id: string;
  event_id: string;
  email: string;
  name: string;
  token: string;
  status: string;
  rsvp_status?: string | null;
  rsvp_date?: string | null;
  expires_at: string | null;
  metadata: any | null;
  created_at: string;
  updated_at: string;
  sent_at: string | null;
  viewed_at?: string | null;
  responded_at?: string | null;
}

export default function InvitationsList({ 
  eventId, 
  filter = 'all'
}: { 
  eventId: string
  filter?: 'all' | 'accepted' | 'declined' | 'pending'
}) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Fetch invitations on component mount
  useEffect(() => {
    const fetchInvitations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const supabase = createClientComponentClient();
        
        const { data, error } = await supabase
          .from('invitations')
          .select('*')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setInvitations(data || []);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch invitations'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInvitations();
  }, [eventId]);
  
  // Filter invitations based on status
  const filteredInvitations = invitations.filter((invitation: Invitation) => {
    if (filter === 'all') return true;
    if (filter === 'accepted') return invitation.rsvp_status === 'accepted';
    if (filter === 'declined') return invitation.rsvp_status === 'declined';
    return invitation.status === filter;
  });

  if (isLoading) {
    return (
      <div className="min-h-[300px] flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6 border rounded-lg bg-rose-50/10 border-rose-200/30">
        <h3 className="text-lg font-medium mb-2 text-rose-500">Error loading invitations</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {error.message}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!filteredInvitations.length) {
    return (
      <div className="min-h-[200px] flex flex-col items-center justify-center text-center p-6 border rounded-lg bg-muted/10">
        <h3 className="text-lg font-medium mb-2">No invitations found</h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {filter === 'all' 
            ? "You haven't sent any invitations for this event yet." 
            : `No invitations with status "${filter}" found.`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {filteredInvitations.length} {filteredInvitations.length === 1 ? 'invitation' : 'invitations'} {filter !== 'all' ? `with status "${filter}"` : ''}
      </div>
      
      <div className="space-y-3">
        {filteredInvitations.map((invitation: Invitation) => (
          <InvitationCard key={invitation.id} invitation={invitation} />
        ))}
      </div>
    </div>
  );
}

function InvitationCard({ invitation }: { invitation: Invitation }) {
  return (
    <Card className="p-4 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{invitation.name}</h4>
              <p className="text-sm text-muted-foreground truncate">{invitation.email}</p>
            </div>
            <div className="hidden sm:block">
              <StatusBadge status={invitation.rsvp_status || invitation.status} />
            </div>
          </div>
          
          <div className="mt-2 sm:mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <span>Sent:</span>
              <span>{format(new Date(invitation.created_at), 'MMM d, yyyy')}</span>
            </div>
            
            {invitation.responded_at && (
              <div className="flex items-center gap-1">
                <span>Responded:</span>
                <span>{format(new Date(invitation.responded_at), 'MMM d, yyyy')}</span>
              </div>
            )}
            
            {invitation.viewed_at && !invitation.responded_at && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>Viewed {format(new Date(invitation.viewed_at), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
          
          <div className="sm:hidden mt-2">
            <StatusBadge status={invitation.rsvp_status || invitation.status} />
          </div>
        </div>
        
        <div className="flex items-center justify-end gap-2 mt-2 sm:mt-0">
          <a 
            href={`/invitation/${invitation.token}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-primary flex items-center gap-1 underline-offset-2 hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="sr-only sm:not-sr-only">View</span>
          </a>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Resend Invitation</DropdownMenuItem>
              <DropdownMenuItem>Copy Invitation Link</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
    // String values
    'accepted': {
      label: 'Accepted',
      icon: <CheckCircle2 className="h-3 w-3" />,
      className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
    },
    'declined': {
      label: 'Declined',
      icon: <XCircle className="h-3 w-3" />,
      className: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400'
    },
    'pending': {
      label: 'Pending',
      icon: <Clock className="h-3 w-3" />,
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    },
    'sent': {
      label: 'Sent',
      icon: <Mail className="h-3 w-3" />,
      className: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400'
    },
    'opened': {
      label: 'Opened',
      icon: <Eye className="h-3 w-3" />,
      className: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
    },
    'expired': {
      label: 'Expired',
      icon: <Clock className="h-3 w-3" />,
      className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
    }
  };

  // Find config for this status or use generic fallback
  const config = statusConfig[status] || {
    label: status.charAt(0).toUpperCase() + status.slice(1),
    icon: <Clock className="h-3 w-3" />,
    className: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
  };

  return (
    <Badge variant="outline" className={cn("gap-1 py-1 font-normal", config.className)}>
      {config.icon}
      {config.label}
    </Badge>
  );
} 