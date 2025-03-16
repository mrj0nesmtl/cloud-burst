"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash, Edit, Share, QrCode, Image } from 'lucide-react'
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
}

export function EventActions({ eventId, organizerId }: EventActionsProps) {
  const router = useRouter()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

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
        .select('name, code')
        .eq('id', eventId)
        .single()
      
      if (error) throw error
      
      // Create share URL
      const shareUrl = `${window.location.origin}/event/${event.code}`
      
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
    const content = (
      <Button 
        variant={variant} 
        size="sm"
        onClick={onClick}
        className="h-8"
      >
        <Icon className="h-4 w-4 md:mr-1" />
        <span className="hidden md:inline">{label}</span>
      </Button>
    );

    // For mobile, provide tooltips since we're hiding text
    const wrappedContent = (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {content}
          </TooltipTrigger>
          <TooltipContent className="md:hidden">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    if (href) {
      return (
        <Link href={href}>
          {wrappedContent}
        </Link>
      );
    }

    return wrappedContent;
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Edit button - visible to event owners and admins */}
      <PermissionGate action="update" resource="event" ownerId={organizerId}>
        <ActionButton 
          icon={Edit} 
          label="Edit" 
          href={`/protected/events/${eventId}/edit`} 
        />
      </PermissionGate>
      
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 