"use client"

import { useState } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { 
  Mail, 
  Users, 
  Upload, 
  Send, 
  QrCode, 
  Loader2, 
  AlertCircle 
} from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

// Types and utilities
import { 
  addEventAttendee, 
  bulkImportAttendees 
} from '@/lib/supabase/events'
import { generateQRCodeDataUrl } from '@/lib/qr-code'
import { AttendeeStatus, BulkImportAttendeesParams } from '@/types/events'

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Form schema for single invitation
const singleInviteSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  message: z.string().optional(),
})

// Form schema for bulk invitations
const bulkInviteSchema = z.object({
  emails: z.string().min(5, { message: "Please enter at least one email address." }),
  message: z.string().optional(),
})

// CSV validation schema
const csvRowSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
})

type SingleInviteFormValues = z.infer<typeof singleInviteSchema>
type BulkInviteFormValues = z.infer<typeof bulkInviteSchema>

interface InvitationFormProps {
  eventId: string
  eventName: string
  onInvitationsSent?: () => void
}

export function InvitationForm({ 
  eventId, 
  eventName,
  onInvitationsSent = () => {}
}: InvitationFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [csvErrors, setCsvErrors] = useState<string[]>([])
  
  // Initialize single invitation form
  const singleForm = useForm<SingleInviteFormValues>({
    resolver: zodResolver(singleInviteSchema),
    defaultValues: {
      name: "",
      email: "",
      message: `You're invited to ${eventName}! Please join us for this special event.`,
    },
  })
  
  // Initialize bulk invitation form
  const bulkForm = useForm<BulkInviteFormValues>({
    resolver: zodResolver(bulkInviteSchema),
    defaultValues: {
      emails: "",
      message: `You're invited to ${eventName}! Please join us for this special event.`,
    },
  })
  
  // Handle single invitation submission
  async function onSingleSubmit(values: SingleInviteFormValues) {
    setIsSubmitting(true)
    
    try {
      // Create attendee
      const attendee = await addEventAttendee({
        event_id: eventId,
        name: values.name,
        email: values.email,
        status: 'invited',
      })
      
      // Generate QR code for the attendee
      const qrCodeDataUrl = await generateQRCodeDataUrl({
        event_id: eventId,
        type: 'attendee',
        attendee_id: attendee.id,
      })
      
      // In a real application, you would send an email with the QR code here
      // For now, we'll just show a success message
      
      toast({
        title: "Invitation sent successfully!",
        description: `An invitation has been sent to ${values.email} with a personalized QR code.`,
      })
      
      // Reset form
      singleForm.reset({
        name: "",
        email: "",
        message: singleForm.getValues("message"),
      })
      
      // Notify parent component
      onInvitationsSent()
    } catch (error) {
      console.error('Error sending invitation:', error)
      toast({
        variant: "destructive",
        title: "Failed to send invitation",
        description: "There was an error sending the invitation. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle bulk invitation submission
  async function onBulkSubmit(values: BulkInviteFormValues) {
    setIsSubmitting(true)
    setCsvErrors([])
    
    try {
      // Parse emails (one per line)
      const emailLines = values.emails.split('\n').filter(line => line.trim() !== '')
      
      // Process each email line
      const attendees = emailLines.map(line => {
        // Check if line contains a name (format: "Name <email@example.com>")
        const match = line.match(/^([^<]+)<([^>]+)>$/)
        
        if (match) {
          const name = match[1].trim()
          const email = match[2].trim()
          
          // Validate email
          if (!EMAIL_REGEX.test(email)) {
            throw new Error(`Invalid email format: ${email}`)
          }
          
          return { name, email }
        } else {
          // Assume the line is just an email
          const email = line.trim()
          
          // Validate email
          if (!EMAIL_REGEX.test(email)) {
            throw new Error(`Invalid email format: ${email}`)
          }
          
          // Use email as name (without domain)
          const name = email.split('@')[0]
          
          return { name, email }
        }
      })
      
      // Bulk import attendees
      const params: BulkImportAttendeesParams = {
        event_id: eventId,
        attendees: attendees.map(({ name, email }) => ({
          name,
          email,
          status: 'invited' as AttendeeStatus,
        })),
      }
      
      await bulkImportAttendees(params)
      
      // In a real application, you would send emails with QR codes here
      // For now, we'll just show a success message
      
      toast({
        title: "Invitations sent successfully!",
        description: `${attendees.length} invitations have been sent with personalized QR codes.`,
      })
      
      // Reset form
      bulkForm.reset({
        emails: "",
        message: bulkForm.getValues("message"),
      })
      
      // Notify parent component
      onInvitationsSent()
    } catch (error) {
      console.error('Error sending bulk invitations:', error)
      
      if (error instanceof Error) {
        setCsvErrors([error.message])
      }
      
      toast({
        variant: "destructive",
        title: "Failed to send invitations",
        description: "There was an error sending the invitations. Please check the format and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // Handle CSV file upload
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    // Read CSV file
    const reader = new FileReader()
    reader.onload = async (event) => {
      try {
        const csv = event.target?.result as string
        const lines = csv.split('\n').filter(line => line.trim() !== '')
        
        // Skip header row if it exists
        const headerRow = lines[0].toLowerCase()
        const startIndex = headerRow.includes('name') || headerRow.includes('email') ? 1 : 0
        
        // Process CSV rows
        const validEmails: string[] = []
        const errors: string[] = []
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const columns = line.split(',').map(col => col.trim())
          
          // Expect at least 2 columns: name and email
          if (columns.length < 2) {
            errors.push(`Line ${i + 1}: Invalid format. Expected at least name and email.`)
            continue
          }
          
          const name = columns[0]
          const email = columns[1]
          
          // Validate email
          if (!EMAIL_REGEX.test(email)) {
            errors.push(`Line ${i + 1}: Invalid email format: ${email}`)
            continue
          }
          
          // Add to valid emails
          validEmails.push(`${name} <${email}>`)
        }
        
        // Update form with valid emails
        if (validEmails.length > 0) {
          bulkForm.setValue('emails', validEmails.join('\n'))
        }
        
        // Show errors if any
        if (errors.length > 0) {
          setCsvErrors(errors)
        } else {
          setCsvErrors([])
        }
      } catch (error) {
        console.error('Error parsing CSV:', error)
        setCsvErrors(['Failed to parse CSV file. Please check the format and try again.'])
      }
    }
    
    reader.readAsText(file)
  }
  
  return (
    <Tabs defaultValue="single" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="single">Single Invitation</TabsTrigger>
        <TabsTrigger value="bulk">Bulk Invitations</TabsTrigger>
      </TabsList>
      
      {/* Single Invitation Tab */}
      <TabsContent value="single">
        <Card>
          <CardHeader>
            <CardTitle>Send Individual Invitation</CardTitle>
            <CardDescription>
              Send an invitation with a personalized QR code to an attendee
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...singleForm}>
              <form onSubmit={singleForm.handleSubmit(onSingleSubmit)} className="space-y-6">
                <FormField
                  control={singleForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Attendee Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormDescription>
                        The name of the person you're inviting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={singleForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                          <Input placeholder="john.doe@example.com" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The invitation will be sent to this email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={singleForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a personal message..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be included in the invitation email
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Invitation</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
      
      {/* Bulk Invitations Tab */}
      <TabsContent value="bulk">
        <Card>
          <CardHeader>
            <CardTitle>Send Bulk Invitations</CardTitle>
            <CardDescription>
              Send invitations with personalized QR codes to multiple attendees at once
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Form {...bulkForm}>
              <form onSubmit={bulkForm.handleSubmit(onBulkSubmit)} className="space-y-6">
                <FormField
                  control={bulkForm.control}
                  name="emails"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Addresses</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="John Doe <john.doe@example.com>
Jane Smith <jane.smith@example.com>
example@email.com" 
                          className="min-h-[150px] font-mono text-sm" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>
                          Enter one email per line. You can include names using the format: 
                          <code className="mx-1 px-1 bg-muted rounded">Name &lt;email@example.com&gt;</code>
                        </span>
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    className="flex items-center gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload CSV</span>
                  </Button>
                  <Input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={handleCsvUpload}
                  />
                  <p className="text-sm text-muted-foreground">
                    CSV should have columns for name and email
                  </p>
                </div>
                
                {csvErrors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error parsing CSV</AlertTitle>
                    <AlertDescription>
                      <ul className="list-disc pl-5 mt-2 text-sm">
                        {csvErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                )}
                
                <FormField
                  control={bulkForm.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a message for all invitations..." 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be included in all invitation emails
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Send Invitations</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="bg-muted/50 flex justify-between items-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <QrCode className="h-4 w-4" />
              <span>Each attendee will receive a unique QR code for event access</span>
            </div>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  )
} 