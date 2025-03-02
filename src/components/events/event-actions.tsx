"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Pencil, Trash2, Eye } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface EventActionsProps {
  eventId: string
}

export function EventActions({ eventId }: EventActionsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    setIsDeleting(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('events')
        .delete()
        .match({ id: eventId })

      if (error) throw error

      toast.success('Event deleted successfully')
      router.refresh()
    } catch (error) {
      console.error('Error deleting event:', error)
      toast.error('Failed to delete event. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" asChild>
        <Link href={`/protected/events/${eventId}`}>
          <Eye className="h-4 w-4 mr-1" />
          View
        </Link>
      </Button>
      <Button variant="outline" size="sm" asChild>
        <Link href={`/protected/events/${eventId}/edit`}>
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Link>
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        className="text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        disabled={isDeleting}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        {isDeleting ? 'Deleting...' : 'Delete'}
      </Button>
    </div>
  )
} 