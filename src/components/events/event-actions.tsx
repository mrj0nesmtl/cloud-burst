"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash, Edit, Share, QrCode, Image, Eye, MoreVertical } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { PermissionGate } from '@/components/auth/permission-gate'
import { createClient } from '@/lib/supabase/client'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface EventActionsProps {
  eventId: string
  organizerId?: string
  mode?: 'list' | 'detail'
}

interface EventData {
  name: string;
  custom_url?: string;
}

export function EventActions({ eventId, organizerId, mode = 'detail' }: EventActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if we're on a mobile device - using 640px (sm) breakpoint
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => setIsMobile(window.innerWidth < 640)
      checkIfMobile()
      window.addEventListener('resize', checkIfMobile)
      return () => window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const supabase = createClient()
      
      // Delete event - using 'as any' to bypass type checking for database id
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId as any)

      if (error) throw error
      
      toast.success('Event deleted successfully')
      router.push('/protected/events')
      router.refresh()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event')
    } finally {
      setIsDeleting(false)
      setIsDeleteDialogOpen(false)
    }
  }

  const handleShare = async () => {
    try {
      // Get event details for sharing
      const supabase = createClient()
      const { data, error } = await supabase
        .from('events')
        .select('name, custom_url')
        .eq('id', eventId as any)
        .single()
      
      if (error) throw error
      
      // Type guard to ensure data exists and has the expected shape
      const eventData = data as EventData
      
      // Create share URL using custom_url if available, or fallback to ID
      const shareUrl = `${window.location.origin}/event/${eventData.custom_url || eventId}`
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `Join ${eventData.name} on Cloud Burst`,
          text: `I'm inviting you to join ${eventData.name} on Cloud Burst!`,
          url: shareUrl,
        })
        return
      }
      
      // Fallback to clipboard
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Event link copied to clipboard')
    } catch (error) {
      console.error('Error sharing event:', error)
      toast.error('Failed to share event')
    }
  }

  // Mobile dropdown menu with all actions
  if (isMobile) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              style={{
                width: '100%',
                height: '1.75rem',
                padding: '0 0.5rem',
                fontSize: '0.7rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.25rem'
              }}
            >
              <span>Actions</span>
              <MoreVertical style={{ height: '0.7rem', width: '0.7rem' }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" style={{ width: '9rem', fontSize: '0.75rem' }}>
            {/* Don't include View in list mode since there's already a separate View button */}
            {mode !== 'list' && (
              <DropdownMenuItem asChild>
                <Link href={`/protected/events/${eventId}`} style={{ width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.35rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                  <Eye style={{ height: '0.7rem', width: '0.7rem' }} />
                  View Event
                </Link>
              </DropdownMenuItem>
            )}
            
            <PermissionGate action="update" resource="event" ownerId={organizerId}>
              <DropdownMenuItem asChild>
                <Link href={`/protected/events/${eventId}/edit`} style={{ width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.35rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                  <Edit style={{ height: '0.7rem', width: '0.7rem' }} />
                  Edit Event
                </Link>
              </DropdownMenuItem>
            </PermissionGate>
            
            <PermissionGate action="read" resource="event">
              <DropdownMenuItem asChild>
                <Link href={`/protected/events/${eventId}/qr`} style={{ width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.35rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                  <QrCode style={{ height: '0.7rem', width: '0.7rem' }} />
                  QR Code
                </Link>
              </DropdownMenuItem>
            </PermissionGate>
            
            <PermissionGate action="read" resource="event">
              <DropdownMenuItem asChild>
                <Link href={`/protected/events/${eventId}/gallery`} style={{ width: '100%', display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '0.35rem', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                  <Image style={{ height: '0.7rem', width: '0.7rem' }} />
                  Gallery
                </Link>
              </DropdownMenuItem>
            </PermissionGate>
            
            <PermissionGate action="read" resource="event">
              <DropdownMenuItem onClick={handleShare} style={{ width: '100%', cursor: 'pointer', display: 'flex', gap: '0.35rem', alignItems: 'center', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                <Share style={{ height: '0.7rem', width: '0.7rem' }} />
                Share
              </DropdownMenuItem>
            </PermissionGate>
            
            <PermissionGate action="delete" resource="event" ownerId={organizerId}>
              <DropdownMenuItem 
                onClick={() => setIsDeleteDialogOpen(true)} 
                style={{ color: 'var(--destructive)', width: '100%', cursor: 'pointer', display: 'flex', gap: '0.35rem', alignItems: 'center', padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}
              >
                <Trash style={{ height: '0.7rem', width: '0.7rem' }} />
                Delete
              </DropdownMenuItem>
            </PermissionGate>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Delete confirmation dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the event
                and all associated data including photos and attendee information.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDelete} 
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  // Desktop version with individual buttons
  return (
    <div style={{ 
      display: 'flex', 
      flexWrap: 'wrap', 
      alignItems: 'center', 
      gap: '0.35rem', 
      justifyContent: 'flex-end',
      width: '100%'
    }}>
      {/* Edit/View button - In list mode, don't show View button since it's redundant */}
      {mode === 'list' ? (
        <PermissionGate action="update" resource="event" ownerId={organizerId}>
          <Button variant="outline" size="sm" asChild style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
            <Link href={`/protected/events/${eventId}/edit`}>
              <Edit style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
              Edit
            </Link>
          </Button>
        </PermissionGate>
      ) : (
        <PermissionGate action="update" resource="event" ownerId={organizerId}>
          <Button variant="outline" size="sm" asChild style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
            <Link href={`/protected/events/${eventId}/edit`}>
              <Edit style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
              Edit
            </Link>
          </Button>
        </PermissionGate>
      )}
      
      {/* QR Code button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <Button variant="outline" size="sm" asChild style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
          <Link href={`/protected/events/${eventId}/qr`}>
            <QrCode style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
            QR
          </Link>
        </Button>
      </PermissionGate>
      
      {/* View Gallery button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <Button variant="outline" size="sm" asChild style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}>
          <Link href={`/protected/events/${eventId}/gallery`}>
            <Image style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
            Gallery
          </Link>
        </Button>
      </PermissionGate>
      
      {/* Share button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleShare}
          style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}
        >
          <Share style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
          Share
        </Button>
      </PermissionGate>
      
      {/* Delete button - visible only to organizers and admins */}
      <PermissionGate action="delete" resource="event" ownerId={organizerId}>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setIsDeleteDialogOpen(true)} 
          className="text-destructive hover:bg-destructive/10"
          style={{ height: '1.75rem', fontSize: '0.7rem', padding: '0 0.5rem' }}
        >
          <Trash style={{ marginRight: '0.25rem', height: '0.7rem', width: '0.7rem' }} />
          Delete
        </Button>
      </PermissionGate>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event
              and all associated data including photos and attendee information.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 