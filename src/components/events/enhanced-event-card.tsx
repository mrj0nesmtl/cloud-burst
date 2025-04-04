import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  CalendarDays, 
  MapPin, 
  Users, 
  Image as ImageIcon, 
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
import { EventActions } from '@/components/events/event-actions';

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
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check for mobile viewport
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkMobile = () => setIsMobile(window.innerWidth < 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }
  }, []);
  
  // Add a click handler to navigate to the event details page
  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if the click didn't happen on a button or link
    if (
      !(e.target as HTMLElement).closest('button') && 
      !(e.target as HTMLElement).closest('a') &&
      !(e.target as HTMLElement).closest('[role="menuitem"]')
    ) {
      router.push(`/protected/events/${event.id}`);
    }
  };
  
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
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.125rem 0.5rem',
      fontSize: '0.75rem',
      fontWeight: '500',
      borderRadius: '9999px',
      whiteSpace: 'nowrap' as const,
    };
    
    switch (event.status) {
      case 'published':
        return <span style={{
          ...baseStyles,
          backgroundColor: 'var(--green-500)',
          color: 'white'
        }}>Published</span>;
      case 'draft':
        return <span style={{
          ...baseStyles,
          backgroundColor: 'transparent',
          color: 'var(--muted-foreground)',
          border: '1px solid var(--border)'
        }}>Draft</span>;
      case 'completed':
        return <span style={{
          ...baseStyles,
          backgroundColor: 'var(--blue-500)',
          color: 'white'
        }}>Completed</span>;
      case 'cancelled':
        return <span style={{
          ...baseStyles,
          backgroundColor: 'var(--destructive)',
          color: 'var(--destructive-foreground)'
        }}>Cancelled</span>;
      default:
        return null;
    }
  };
  
  return (
    <>
      <Card style={{ 
        overflow: 'hidden',
        border: '1px solid var(--border)',
        borderRadius: '0.5rem', 
        background: 'var(--card)',
        cursor: 'pointer',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        maxHeight: '320px',
      }}
      onClick={handleCardClick}
      className="hover:shadow-md hover:border-primary/20"
      >
        {/* Thumbnail Image - Always shown with a fallback */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '140px',
          overflow: 'hidden'
        }}>
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt={event.name}
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ 
                objectFit: 'cover',
                transition: 'transform 0.3s ease'
              }}
              className="hover:scale-105"
            />
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundColor: 
                event.status === 'published' ? 'var(--green-500)' : 
                event.status === 'draft' ? 'var(--orange-500)' : 
                event.status === 'completed' ? 'var(--blue-500)' : 
                event.status === 'cancelled' ? 'var(--destructive)' : 
                'var(--primary)',
              fontSize: '2.5rem',
              fontWeight: '600',
              color: 'white'
            }}>
              {event.name
                .split(' ')
                .map(part => part[0])
                .join('')
                .toUpperCase()
                .substring(0, 2)}
            </div>
          )}
          {/* Status badge overlay */}
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            zIndex: 10
          }}>
            {renderStatusBadge()}
          </div>
        </div>

        <CardHeader style={{ 
          padding: '0.75rem 1rem 0.5rem',
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'flex-start',
            flexWrap: 'wrap',
            gap: '0.75rem'
          }}>
            <div>
              <CardTitle style={{ 
                fontSize: '1rem',
                fontWeight: '600',
                lineHeight: '1.3',
                marginBottom: '0.25rem'
              }}>
                <Link 
                  href={`/protected/events/${event.id}`} 
                  style={{ 
                    color: 'inherit', 
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                >
                  {event.name}
                </Link>
              </CardTitle>
              <CardDescription style={{
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)',
                lineHeight: '1.5',
                marginBottom: '0.75rem',
                maxHeight: '3em',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}>
                {event.location && (
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    fontSize: '0.75rem' 
                  }}>
                    <MapPin style={{ 
                      marginRight: '0.25rem', 
                      height: '0.75rem', 
                      width: '0.75rem' 
                    }} />
                    {event.location}
                  </span>
                )}
              </CardDescription>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {!event.cover_image_url && renderStatusBadge()}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    style={{
                      height: '2rem',
                      width: '2rem',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <MoreHorizontal style={{ height: '1rem', width: '1rem' }} />
                    <span style={{ 
                      position: 'absolute', 
                      width: '1px',
                      height: '1px',
                      padding: 0,
                      margin: '-1px',
                      overflow: 'hidden',
                      clip: 'rect(0, 0, 0, 0)',
                      whiteSpace: 'nowrap',
                      borderWidth: 0
                    }}>Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/protected/events/${event.id}`} 
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Eye style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                      View details
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/protected/events/${event.id}/edit`} 
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Edit style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                      Edit event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/protected/events/${event.id}/qr`} 
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <QrCode style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                      QR code
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link 
                      href={`/protected/events/${event.id}/share`} 
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Share2 style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                      Share event
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {onDuplicate && (
                    <DropdownMenuItem 
                      onClick={handleDuplicate}
                      disabled={isDuplicating}
                      style={{ 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        opacity: isDuplicating ? 0.5 : 1
                      }}
                    >
                      <Copy style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                      {isDuplicating ? 'Duplicating...' : 'Duplicate event'}
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={() => setIsDeleteDialogOpen(true)}
                      style={{ 
                        color: 'var(--destructive)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Trash style={{ marginRight: '0.5rem', height: '1rem', width: '1rem' }} />
                      Delete event
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent style={{ 
          padding: '0 1rem 0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          flex: 1
        }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: 'var(--muted-foreground)',
              fontSize: '0.75rem'
            }}>
              <CalendarDays size={14} />
              <span>{formatDate(event.date)}</span>
            </div>

            <div style={{
              display: 'flex',
              gap: '0.75rem',
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--muted-foreground)',
                fontSize: '0.75rem'
              }}>
                <Users size={14} />
                <span>{event.attendees_count || 0}</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--muted-foreground)',
                fontSize: '0.75rem'
              }}>
                <ImageIcon size={14} />
                <span>{event.photos_count || 0}</span>
              </div>
            </div>
          </div>
          
          <div style={{ 
            padding: '0.5rem 0 0', 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid var(--border)',
            marginTop: 'auto'
          }}>
            <Badge variant={event.is_public ? "default" : "outline"} className="text-xs h-5">
              {event.is_public ? "Public" : "Private"}
            </Badge>
            
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <Button 
                variant="outline" 
                size="sm" 
                asChild
                className="h-6 text-xs px-2 py-0"
              >
                <Link href={`/protected/events/${event.id}`}>
                  View
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3 w-3" />
                    <span className="sr-only">More</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                  <DropdownMenuItem asChild>
                    <Link href={`/protected/events/${event.id}/edit`}>
                      <Edit className="mr-2 h-3.5 w-3.5" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    if (onDuplicate) handleDuplicate();
                  }} disabled={isDuplicating}>
                    <Copy className="mr-2 h-3.5 w-3.5" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash className="mr-2 h-3.5 w-3.5" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 