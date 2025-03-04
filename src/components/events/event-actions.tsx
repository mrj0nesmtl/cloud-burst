"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trash, Edit, Share, QrCode } from 'lucide-react'
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

  return (
    <div className="flex items-center space-x-2">
      {/* Edit button - visible to event owners and admins */}
      <PermissionGate action="update" resource="event" ownerId={organizerId}>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/events/${eventId}/edit`}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Link>
        </Button>
      </PermissionGate>
      
      {/* QR Code button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/protected/events/${eventId}/qr`}>
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Link>
        </Button>
      </PermissionGate>
      
      {/* Share button - visible to all who can view the event */}
      <PermissionGate action="read" resource="event">
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share className="h-4 w-4 mr-2" />
          Share
        </Button>
      </PermissionGate>
      
      {/* Delete button - visible only to organizers and admins */}
      <PermissionGate action="delete" resource="event" ownerId={organizerId}>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash className="h-4 w-4 mr-2" />
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