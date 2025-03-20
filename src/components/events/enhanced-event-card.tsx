import { useState, useEffect } from 'react';
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
        background: 'var(--card)'
      }}>
        <CardHeader style={{ 
          padding: '1.25rem 1.25rem 0.75rem',
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
                fontSize: isMobile ? '1.125rem' : '1.25rem',
                fontWeight: '600',
                lineHeight: '1.3'
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
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                marginTop: '0.25rem',
                fontSize: '0.875rem',
                color: 'var(--muted-foreground)',
                gap: '0.5rem'
              }}>
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  <CalendarDays style={{ 
                    marginRight: '0.25rem', 
                    height: '0.875rem', 
                    width: '0.875rem' 
                  }} />
                  {formatDate(event.date)}
                </span>
                {event.location && (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <MapPin style={{ 
                      marginRight: '0.25rem', 
                      height: '0.875rem', 
                      width: '0.875rem' 
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
              {renderStatusBadge()}
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
        <CardContent style={{ padding: '0 1.25rem 0.75rem' }}>
          {event.description && (
            <p style={{ 
              fontSize: '0.875rem', 
              color: 'var(--muted-foreground)',
              marginBottom: '1rem',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {event.description}
            </p>
          )}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '1rem'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.875rem'
            }}>
              <Users style={{ 
                marginRight: '0.375rem', 
                height: '1rem', 
                width: '1rem', 
                color: 'var(--muted-foreground)' 
              }} />
              <span style={{ fontWeight: '500' }}>{event.attendees_count}</span>
              <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.25rem' }}>attendees</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.875rem'
            }}>
              <Image style={{ 
                marginRight: '0.375rem', 
                height: '1rem', 
                width: '1rem', 
                color: 'var(--muted-foreground)' 
              }} />
              <span style={{ fontWeight: '500' }}>{event.photos_count}</span>
              <span style={{ color: 'var(--muted-foreground)', marginLeft: '0.25rem' }}>photos</span>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: '0.75rem'
            }}>
              {event.is_public ? (
                <span style={{ 
                  color: 'var(--green-500)', 
                  backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '9999px'
                }}>Public</span>
              ) : (
                <span style={{ 
                  color: 'var(--amber-500)', 
                  backgroundColor: 'rgba(245, 158, 11, 0.1)', 
                  padding: '0.125rem 0.5rem', 
                  borderRadius: '9999px'
                }}>Private</span>
              )}
            </div>
          </div>
        </CardContent>
        <div style={{ 
          borderTop: '1px solid var(--border)', 
          padding: '0.75rem 1.5rem', 
          display: 'flex', 
          justifyContent: 'flex-end'
        }}>
          <Button 
            variant="ghost" 
            size="sm" 
            asChild
            style={{
              height: 'auto',
              padding: '0.375rem 0.75rem',
              fontSize: '0.875rem'
            }}
          >
            <Link 
              href={`/protected/events/${event.id}`}
              style={{
                textDecoration: 'none'
              }}
            >
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
              style={{
                backgroundColor: 'var(--destructive)',
                color: 'var(--destructive-foreground)'
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete Event'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 