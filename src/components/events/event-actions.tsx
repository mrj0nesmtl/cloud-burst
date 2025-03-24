"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash, Edit, Share, QrCode, Image, Eye } from 'lucide-react'
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

interface EventActionsProps {
  eventId: string
  organizerId?: string
  mode?: 'list' | 'detail'
}

export function EventActions({ eventId, organizerId, mode = 'detail' }: EventActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  // Check if we're on a mobile device
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const checkIfMobile = () => setIsMobile(window.innerWidth < 768)
      checkIfMobile()
      window.addEventListener('resize', checkIfMobile)
      return () => window.removeEventListener('resize', checkIfMobile)
    }
  }, [])

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const supabase = createClient()
      
      // Delete event
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId)

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
      const { data: event, error } = await supabase
        .from('events')
        .select('name, custom_url')
        .eq('id', eventId)
        .single()
      
      if (error) throw error
      
      // Create share URL using custom_url if available, or fallback to ID
      const shareUrl = `${window.location.origin}/event/${event.custom_url || eventId}`
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: `Join ${event.name} on Cloud Burst`,
          text: `I'm inviting you to join ${event.name} on Cloud Burst!`,
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

  // Action button with responsive text
  const ActionButton = ({ 
    icon: Icon, 
    label, 
    onClick, 
    href, 
    variant = "outline" 
  }: { 
    icon: React.ComponentType<any>, 
    label: string, 
    onClick?: () => void, 
    href?: string,
    variant?: "outline" | "destructive" | "ghost" | "default" 
  }) => {
    const baseButtonStyles = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '2rem',
      gap: '0.25rem',
      padding: '0 0.5rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      borderRadius: '0.375rem',
      cursor: 'pointer',
      whiteSpace: 'nowrap' as const,
      border: variant === 'outline' ? '1px solid var(--border)' : 'none',
      background: variant === 'destructive' 
        ? 'var(--destructive)' 
        : variant === 'default' 
          ? 'var(--primary)' 
          : 'transparent',
      color: variant === 'destructive' 
        ? 'var(--destructive-foreground)' 
        : variant === 'default' 
          ? 'var(--primary-foreground)' 
          : 'currentColor',
    }
    
    const iconStyles = {
      height: '1rem',
      width: '1rem',
      marginRight: isMobile ? '0' : '0.25rem'
    }
    
    const content = (
      <button 
        type="button"
        onClick={onClick}
        style={baseButtonStyles}
      >
        <Icon style={iconStyles} />
        {!isMobile && <span>{label}</span>}
      </button>
    );

    // For mobile, provide tooltips since we're hiding text
    const wrappedContent = (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent style={{
            display: isMobile ? 'block' : 'none',
            padding: '0.25rem 0.5rem',
            fontSize: '0.75rem',
            background: 'var(--popover)',
            color: 'var(--popover-foreground)',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            borderRadius: '0.25rem',
            maxWidth: '12rem',
            zIndex: 50
          }}>
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    if (href) {
      return (
        <Link href={href} style={{ textDecoration: 'none' }}>
          {wrappedContent}
        </Link>
      );
    }

    return wrappedContent;
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '0.5rem',
      justifyContent: 'flex-end'
    }}>
      {/* Edit/View button - In list mode, show View button instead of Edit */}
      {mode === 'list' ? (
        <ActionButton 
          icon={Eye} 
          label="View" 
          href={`/protected/events/${eventId}`} 
        />
      ) : (
        <PermissionGate action="update" resource="event" ownerId={organizerId}>
          <ActionButton 
            icon={Edit} 
            label="Edit" 
            href={`/protected/events/${eventId}/edit`} 
          />
        </PermissionGate>
      )}
      
      {/* QR Code button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <ActionButton 
          icon={QrCode} 
          label="QR Code" 
          href={`/protected/events/${eventId}/qr`} 
        />
      </PermissionGate>
      
      {/* View Gallery button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <ActionButton 
          icon={Image} 
          label="Gallery" 
          href={`/events/${eventId}/gallery`} 
        />
      </PermissionGate>
      
      {/* Share button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <ActionButton 
          icon={Share} 
          label="Share" 
          onClick={handleShare} 
        />
      </PermissionGate>
      
      {/* Delete button - visible only to organizers and admins */}
      <PermissionGate action="delete" resource="event" ownerId={organizerId}>
        <ActionButton 
          icon={Trash} 
          label="Delete" 
          onClick={() => setIsDeleteDialogOpen(true)} 
          variant="destructive" 
        />
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
              style={{
                background: 'var(--destructive)',
                color: 'var(--destructive-foreground)'
              }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 