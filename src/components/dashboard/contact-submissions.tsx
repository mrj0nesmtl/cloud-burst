'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, RefreshCw, Eye } from 'lucide-react'

interface ContactSubmission {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  created_at: string
  updated_at: string
}

export function ContactSubmissions() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    try {
      setLoading(true)
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('contact_form_submissions')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      
      setSubmissions(data || [])
    } catch (err) {
      console.error('Error fetching submissions:', err)
      setError('Failed to load contact form submissions')
    } finally {
      setLoading(false)
    }
  }

  async function updateSubmissionStatus(id: string, status: string) {
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('contact_form_submissions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
      
      if (error) throw error
      
      // Update local state
      setSubmissions(prev => 
        prev.map(sub => 
          sub.id === id ? { ...sub, status, updated_at: new Date().toISOString() } : sub
        )
      )
      
      toast.success(`Submission status updated to ${status}`)
    } catch (err) {
      console.error('Error updating submission:', err)
      toast.error('Failed to update submission status')
    }
  }

  function viewSubmission(submission: ContactSubmission) {
    setSelectedSubmission(submission)
    setDialogOpen(true)
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <LoadingSpinner size="md" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Submissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Contact Form Submissions</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSubmissions}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No submissions found</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">{submission.name}</TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {submission.subject}
                      </TableCell>
                      <TableCell>
                        <SubmissionStatusBadge status={submission.status} />
                      </TableCell>
                      <TableCell>
                        {format(new Date(submission.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => viewSubmission(submission)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => updateSubmissionStatus(submission.id, 'new')}
                              >
                                Mark as New
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateSubmissionStatus(submission.id, 'in_progress')}
                              >
                                Mark as In Progress
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateSubmissionStatus(submission.id, 'completed')}
                              >
                                Mark as Completed
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => updateSubmissionStatus(submission.id, 'spam')}
                              >
                                Mark as Spam
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Contact Form Submission</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && format(new Date(selectedSubmission.created_at), 'MMMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
                  <p className="mt-1">{selectedSubmission.name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Email</h4>
                  <p className="mt-1">{selectedSubmission.email}</p>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Subject</h4>
                <p className="mt-1">{selectedSubmission.subject}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Message</h4>
                <div className="mt-1 p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {selectedSubmission.message}
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                  <div className="mt-1">
                    <SubmissionStatusBadge status={selectedSubmission.status} />
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      updateSubmissionStatus(selectedSubmission.id, 'completed')
                      setDialogOpen(false)
                    }}
                  >
                    Mark as Completed
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      // Here you would typically open an email client
                      window.open(`mailto:${selectedSubmission.email}?subject=Re: ${selectedSubmission.subject}`)
                      updateSubmissionStatus(selectedSubmission.id, 'in_progress')
                    }}
                  >
                    Reply
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function SubmissionStatusBadge({ status }: { status: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"
  
  switch (status) {
    case 'new':
      variant = "default"
      break
    case 'in_progress':
      variant = "secondary"
      break
    case 'completed':
      variant = "outline"
      break
    case 'spam':
      variant = "destructive"
      break
    default:
      variant = "outline"
  }
  
  return (
    <Badge variant={variant}>
      {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </Badge>
  )
} 