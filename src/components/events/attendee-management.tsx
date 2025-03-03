"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { 
  MoreHorizontal, 
  UserPlus, 
  Trash, 
  Mail, 
  QrCode, 
  Upload, 
  Download 
} from 'lucide-react'
import { 
  EventAttendee, 
  AttendeeStatus, 
  CreateAttendeeParams 
} from '@/types/events'
import { 
  addEventAttendee, 
  updateEventAttendee, 
  deleteEventAttendee, 
  bulkImportAttendees 
} from '@/lib/supabase/events'
import { isValidEmail } from '@/lib/utils'

interface AttendeeManagementProps {
  eventId: string
  attendees: EventAttendee[]
  onAttendeeChange: () => void
}

export function AttendeeManagement({ 
  eventId, 
  attendees, 
  onAttendeeChange 
}: AttendeeManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for dialogs
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null)
  
  // State for forms
  const [newAttendee, setNewAttendee] = useState({
    name: '',
    email: ''
  })
  const [importText, setImportText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Handle adding a new attendee
  const handleAddAttendee = async () => {
    if (!newAttendee.name || !newAttendee.email) {
      toast({
        title: 'Missing information',
        description: 'Please provide both name and email.',
        variant: 'destructive'
      })
      return
    }
    
    if (!isValidEmail(newAttendee.email)) {
      toast({
        title: 'Invalid email',
        description: 'Please provide a valid email address.',
        variant: 'destructive'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const params: CreateAttendeeParams = {
        event_id: eventId,
        name: newAttendee.name,
        email: newAttendee.email
      }
      
      await addEventAttendee(params)
      
      toast({
        title: 'Attendee added',
        description: `${newAttendee.name} has been added to the event.`
      })
      
      // Reset form and close dialog
      setNewAttendee({ name: '', email: '' })
      setShowAddDialog(false)
      
      // Refresh attendees list
      onAttendeeChange()
      router.refresh()
    } catch (error) {
      console.error('Error adding attendee:', error)
      toast({
        title: 'Failed to add attendee',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle updating attendee status
  const handleUpdateStatus = async (attendee: EventAttendee, status: AttendeeStatus) => {
    try {
      await updateEventAttendee(attendee.id, { status })
      
      toast({
        title: 'Status updated',
        description: `${attendee.name}'s status has been updated to ${status}.`
      })
      
      // Refresh attendees list
      onAttendeeChange()
      router.refresh()
    } catch (error) {
      console.error('Error updating attendee status:', error)
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive'
      })
    }
  }
  
  // Handle deleting an attendee
  const handleDeleteAttendee = async () => {
    if (!selectedAttendee) return
    
    setIsSubmitting(true)
    
    try {
      await deleteEventAttendee(selectedAttendee.id)
      
      toast({
        title: 'Attendee removed',
        description: `${selectedAttendee.name} has been removed from the event.`
      })
      
      // Reset selected attendee and close dialog
      setSelectedAttendee(null)
      setShowDeleteDialog(false)
      
      // Refresh attendees list
      onAttendeeChange()
      router.refresh()
    } catch (error) {
      console.error('Error deleting attendee:', error)
      toast({
        title: 'Failed to remove attendee',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle bulk import
  const handleBulkImport = async () => {
    if (!importText.trim()) {
      toast({
        title: 'No data provided',
        description: 'Please enter attendee data to import.',
        variant: 'destructive'
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Parse CSV or line-by-line format
      const lines = importText.split('\n').filter(line => line.trim())
      const attendeesToImport = lines.map(line => {
        // Try to parse as CSV
        if (line.includes(',')) {
          const [name, email] = line.split(',').map(part => part.trim())
          return { name, email }
        }
        
        // Try to parse as "Name <email>" format
        const match = line.match(/(.+)<(.+)>/)
        if (match) {
          return {
            name: match[1].trim(),
            email: match[2].trim()
          }
        }
        
        // Assume it's just an email and use it as the name too
        return {
          name: line.trim(),
          email: line.trim()
        }
      })
      
      // Validate emails
      const invalidEntries = attendeesToImport.filter(a => !isValidEmail(a.email))
      if (invalidEntries.length > 0) {
        toast({
          title: 'Invalid email addresses',
          description: `Found ${invalidEntries.length} invalid email addresses. Please check your data.`,
          variant: 'destructive'
        })
        setIsSubmitting(false)
        return
      }
      
      // Import attendees
      await bulkImportAttendees({
        event_id: eventId,
        attendees: attendeesToImport
      })
      
      toast({
        title: 'Attendees imported',
        description: `Successfully imported ${attendeesToImport.length} attendees.`
      })
      
      // Reset form and close dialog
      setImportText('')
      setShowImportDialog(false)
      
      // Refresh attendees list
      onAttendeeChange()
      router.refresh()
    } catch (error) {
      console.error('Error importing attendees:', error)
      toast({
        title: 'Failed to import attendees',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
        variant: 'destructive'
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Generate a CSV of attendees
  const handleExportCsv = () => {
    try {
      // Create CSV content
      const headers = ['Name', 'Email', 'Status', 'Access Code']
      const rows = attendees.map(a => [
        a.name,
        a.email,
        a.status,
        a.access_code || ''
      ])
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
      ].join('\n')
      
      // Create a download link
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `event-${eventId}-attendees.csv`
      
      // Trigger download
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      toast({
        title: 'Attendees exported',
        description: `Successfully exported ${attendees.length} attendees to CSV.`
      })
    } catch (error) {
      console.error('Error exporting attendees:', error)
      toast({
        title: 'Failed to export attendees',
        description: 'An error occurred while exporting attendees.',
        variant: 'destructive'
      })
    }
  }
  
  // Get status badge color
  const getStatusBadgeVariant = (status: AttendeeStatus) => {
    switch (status) {
      case 'invited': return 'secondary'
      case 'confirmed': return 'default'
      case 'attended': return 'success'
      case 'declined': return 'destructive'
      default: return 'outline'
    }
  }
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Attendees ({attendees.length})</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleExportCsv}
            disabled={attendees.length === 0}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex items-center gap-1"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Attendee</span>
          </Button>
        </div>
      </div>
      
      {attendees.length === 0 ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">No attendees yet. Add some attendees to get started.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Access Code</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attendees.map(attendee => (
                <TableRow key={attendee.id}>
                  <TableCell className="font-medium">{attendee.name}</TableCell>
                  <TableCell>{attendee.email}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(attendee.status) as any}>
                      {attendee.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="bg-muted px-1 py-0.5 rounded text-xs">
                      {attendee.access_code || 'N/A'}
                    </code>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(attendee, 'invited')}
                        >
                          Mark as Invited
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(attendee, 'confirmed')}
                        >
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(attendee, 'attended')}
                        >
                          Mark as Attended
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleUpdateStatus(attendee, 'declined')}
                        >
                          Mark as Declined
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Implement email sending
                            toast({
                              title: 'Feature coming soon',
                              description: 'Email sending will be available in a future update.'
                            })
                          }}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          Send Invite
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            // TODO: Implement QR code generation
                            toast({
                              title: 'Feature coming soon',
                              description: 'Individual QR codes will be available in a future update.'
                            })
                          }}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          Generate QR Code
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAttendee(attendee)
                            setShowDeleteDialog(true)
                          }}
                          className="text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      
      {/* Add Attendee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Attendee</DialogTitle>
            <DialogDescription>
              Add a new attendee to your event. They will receive an access code.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="Enter attendee name"
                value={newAttendee.name}
                onChange={e => setNewAttendee(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter attendee email"
                value={newAttendee.email}
                onChange={e => setNewAttendee(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddAttendee}
              disabled={isSubmitting || !newAttendee.name || !newAttendee.email}
            >
              {isSubmitting ? 'Adding...' : 'Add Attendee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Import Attendees Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Import Attendees</DialogTitle>
            <DialogDescription>
              Bulk import attendees from a list. Enter one attendee per line in any of these formats:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li className="text-xs">Name, Email</li>
                <li className="text-xs">Name &lt;Email&gt;</li>
                <li className="text-xs">Email</li>
              </ul>
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="John Doe, john@example.com
Jane Smith <jane@example.com>
guest@example.com"
              rows={10}
              value={importText}
              onChange={e => setImportText(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={isSubmitting || !importText.trim()}
            >
              {isSubmitting ? 'Importing...' : 'Import Attendees'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Attendee Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Attendee</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this attendee from the event?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttendee && (
            <div className="py-4">
              <p><strong>Name:</strong> {selectedAttendee.name}</p>
              <p><strong>Email:</strong> {selectedAttendee.email}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAttendee(null)
                setShowDeleteDialog(false)
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAttendee}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Removing...' : 'Remove Attendee'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 