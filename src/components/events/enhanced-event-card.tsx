import { useState } from 'react';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Image, 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Copy, 
  Eye, 
  Share2, 
  QrCode 
} from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Link from 'next/link';
import { EventWithCounts } from '@/types/events';
import { formatDate } from '@/lib/utils';

interface EnhancedEventCardProps {
  event: EventWithCounts;
  onDelete?: (id: string) => Promise<void>;
  onDuplicate?: (id: string) => Promise<void>;
}

/**
 * Enhanced event card component with actions
 * @param event - Event data
 * @param onDelete - Callback function when delete action is triggered
 * @param onDuplicate - Callback function when duplicate action is triggered
 */
export function EnhancedEventCard({ 
  event, 
  onDelete, 
  onDuplicate 
}: EnhancedEventCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  
  // Handle delete action
  const handleDelete = async () => {
    if (!onDelete) return;
    
    try {
      setIsDeleting(true);
      await onDelete(event.id);
    } catch (error) {
      console.error('Error deleting event:', error);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Handle duplicate action
  const handleDuplicate = async () => {
    if (!onDuplicate) return;
    
    try {
      setIsDuplicating(true);
      await onDuplicate(event.id);
    } catch (error) {
      console.error('Error duplicating event:', error);
    } finally {
      setIsDuplicating(false);
    }
  };
  
  // Render status badge
  const renderStatusBadge = () => {
    switch (event.status) {
      case 'published':
        return <Badge className="bg-green-500">Published</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return null;
    }
  };
  
  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">
                <Link href={`/protected/events/${event.id}`} className="hover:text-blue-500 transition-colors">
                  {event.name}
                </Link>
              </CardTitle>
              <CardDescription className="flex items-center mt-1">
                <CalendarDays className="mr-1 h-3.5 w-3.5" />
                {formatDate(event.date)}
                {event.location && (
                  <>
                    <span className="mx-1">•</span>
                    <MapPin className="mr-1 h-3.5 w-3.5" />
                    {event.location}
                  </>
                )}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {renderStatusBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/protected/events/${event.id}`} className="cursor-pointer">
                      <Eye className="mr-2 h-4 w-4" />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/protected/events/${event.id}/edit`} className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/protected/events/${event.id}/qr`} className="cursor-pointer">
                      <QrCode className="mr-2 h-4 w-4" />
                      QR code
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/protected/events/${event.id}/share`} className="cursor-pointer">
                      <Share2 className="mr-2 h-4 w-4" />
                      Share event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onDuplicate && (
                    <DropdownMenuItem 
                      onClick={handleDuplicate}
                      disabled={isDuplicating}
                      className="cursor-pointer"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {isDuplicating ? 'Duplicating...' : 'Duplicate event'}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      className="text-red-600 cursor-pointer"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete event
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          {event.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {event.description}
            </p>
          )}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center text-sm">
              <Users className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{event.attendees_count}</span>
              <span className="text-muted-foreground ml-1">attendees</span>
            </div>
            <div className="flex items-center text-sm">
              <Image className="mr-1.5 h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{event.photos_count}</span>
              <span className="text-muted-foreground ml-1">photos</span>
            </div>
            <div className="flex items-center text-sm">
              {event.is_public ? (
                <span className="text-green-500 text-xs bg-green-500/10 px-2 py-0.5 rounded-full">Public</span>
              ) : (
                <span className="text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">Private</span>
              )}
            </div>
          </div>
        </CardContent>
        <div className="border-t px-6 py-3 flex justify-end">
          <Button variant="ghost" size="sm" asChild>
            <Link href={`/protected/events/${event.id}`}>
              Manage Event
            </Link>
          </Button>
        </div>
      </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the event "{event.name}" and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 