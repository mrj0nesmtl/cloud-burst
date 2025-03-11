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
  updateEventAttendee, 
  deleteEventAttendee, 
  bulkImportAttendees 
} from '@/lib/supabase/events'
import { isValidEmail } from '@/lib/utils'
import { AddAttendeeDialog } from './add-attendee-dialog'

interface AttendeeManagementProps {
  eventId: string
  initialAttendees?: any[]
  organizerId?: string
  attendees?: EventAttendee[]
  onAttendeeChange?: () => void
}

export function AttendeeManagement({ 
  eventId, 
  initialAttendees = [], 
  organizerId,
  attendees = initialAttendees, 
  onAttendeeChange = () => {} 
}: AttendeeManagementProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for dialogs
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedAttendee, setSelectedAttendee] = useState<EventAttendee | null>(null)
  
  // State for forms
  const [importText, setImportText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Attendees ({attendees.length})</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImportDialog(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button
            size="sm"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Attendee
          </Button>
        </div>
      </div>
      
      {attendees.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
          <UserPlus className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No attendees yet</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            Add some attendees to get started.
          </p>
          <Button
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Attendee
          </Button>
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
      
      <AddAttendeeDialog
        eventId={eventId}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onSuccess={onAttendeeChange}
      />
      
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Import Attendees
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              Bulk import attendees from a list. Enter one attendee per line in any of these formats:
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-2 mb-4 bg-muted/50 rounded-lg p-3 border">
            <ul className="space-y-1.5">
              <li className="text-xs flex items-center">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                <code className="bg-muted px-1.5 py-0.5 rounded">Name, Email</code>
                <span className="text-muted-foreground ml-2">e.g., John Doe, john@example.com</span>
              </li>
              <li className="text-xs flex items-center">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                <code className="bg-muted px-1.5 py-0.5 rounded">Name &lt;Email&gt;</code>
                <span className="text-muted-foreground ml-2">e.g., Jane Smith &lt;jane@example.com&gt;</span>
              </li>
              <li className="text-xs flex items-center">
                <span className="inline-block w-2 h-2 bg-primary rounded-full mr-2"></span>
                <code className="bg-muted px-1.5 py-0.5 rounded">Email</code>
                <span className="text-muted-foreground ml-2">e.g., guest@example.com</span>
              </li>
            </ul>
          </div>
          
          <div className="grid gap-4 py-4">
            <Label htmlFor="import-text" className="text-sm font-medium">
              Attendee List
            </Label>
            <Textarea
              id="import-text"
              placeholder="John Doe, john@example.com
Jane Smith <jane@example.com>
guest@example.com"
              rows={8}
              value={importText}
              onChange={e => setImportText(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setImportText('');
                setShowImportDialog(false);
              }}
              disabled={isSubmitting}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={isSubmitting || !importText.trim()}
              className="h-10"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Importing...
                </>
              ) : (
                'Import Attendees'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Trash className="h-5 w-5 text-destructive" />
              Remove Attendee
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground mt-1.5">
              Are you sure you want to remove this attendee from the event?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedAttendee && (
            <div className="my-6 p-4 border rounded-lg bg-muted/30">
              <div className="space-y-3">
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-sm font-medium text-muted-foreground">Name:</span>
                  <span className="font-medium">{selectedAttendee.name}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-sm font-medium text-muted-foreground">Email:</span>
                  <span className="font-medium">{selectedAttendee.email}</span>
                </div>
                <div className="grid grid-cols-[100px_1fr] items-center">
                  <span className="text-sm font-medium text-muted-foreground">Status:</span>
                  <Badge variant={
                    selectedAttendee.status === 'confirmed' ? 'success' :
                    selectedAttendee.status === 'attended' ? 'success' :
                    selectedAttendee.status === 'declined' ? 'destructive' :
                    'secondary'
                  } className="w-fit">
                    {selectedAttendee.status.charAt(0).toUpperCase() + selectedAttendee.status.slice(1)}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedAttendee(null)
                setShowDeleteDialog(false)
              }}
              disabled={isSubmitting}
              className="h-10"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAttendee}
              disabled={isSubmitting}
              className="h-10"
            >
              {isSubmitting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                  Removing...
                </>
              ) : (
                'Remove Attendee'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 