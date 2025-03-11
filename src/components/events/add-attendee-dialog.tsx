import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { UserPlus, Loader2, Mail } from 'lucide-react'
import { addEventAttendee } from '@/lib/supabase/events'
import { isValidEmail } from '@/lib/utils'
import { CreateAttendeeParams } from '@/types/events'

interface AddAttendeeDialogProps {
  eventId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function AddAttendeeDialog({ 
  eventId, 
  open, 
  onOpenChange,
  onSuccess 
}: AddAttendeeDialogProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  const [attendee, setAttendee] = useState({
    name: '',
    email: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const resetForm = () => {
    setAttendee({ name: '', email: '' })
  }
  
  const handleClose = () => {
    if (!isSubmitting) {
      resetForm()
      onOpenChange(false)
    }
  }
  
  const handleSubmit = async () => {
    // Validate inputs
    if (!attendee.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter the attendee's name",
        variant: "destructive"
      })
      return
    }
    
    if (!attendee.email.trim() || !isValidEmail(attendee.email)) {
      toast({
        title: "Valid email required",
        description: "Please enter a valid email address",
        variant: "destructive"
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const params: CreateAttendeeParams = {
        event_id: eventId,
        name: attendee.name.trim(),
        email: attendee.email.trim()
      }
      
      await addEventAttendee(params)
      
      toast({
        title: "Attendee added",
        description: `${attendee.name} has been added to the event`
      })
      
      resetForm()
      onOpenChange(false)
      
      if (onSuccess) {
        onSuccess()
      }
      
      router.refresh()
    } catch (error) {
      console.error('Error adding attendee:', error)
      toast({
        title: "Failed to add attendee",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
            <UserPlus className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <DialogTitle className="text-xl">Add Attendee</DialogTitle>
            <DialogDescription>
              Add a new attendee to your event
            </DialogDescription>
          </div>
        </div>
        
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name" className="block mb-2">Name</Label>
            <Input
              id="name"
              value={attendee.name}
              onChange={(e) => setAttendee(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter attendee name"
              disabled={isSubmitting}
            />
          </div>
          
          <div>
            <Label htmlFor="email" className="block mb-2">Email</Label>
            <Input
              id="email"
              type="email"
              value={attendee.email}
              onChange={(e) => setAttendee(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter attendee email"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-2">
              An invitation will be sent to this email address
            </p>
          </div>
        </div>
        
        <DialogFooter className="mt-6 flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !attendee.name || !attendee.email}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              'Add Attendee'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 