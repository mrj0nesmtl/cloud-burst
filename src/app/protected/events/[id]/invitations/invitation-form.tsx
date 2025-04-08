'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Send, Plus, X, Mail, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'

const invitationSchema = z.object({
  emails: z.array(z.string().email('Invalid email address')).min(1, 'At least one email is required'),
  message: z.string().optional(),
  plusOne: z.boolean().default(false),
  sendNow: z.boolean().default(true),
})

type InvitationFormValues = z.infer<typeof invitationSchema>

export default function InvitationForm({ eventId }: { eventId: string }) {
  const [emailInputValue, setEmailInputValue] = useState('')
  const [emails, setEmails] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema),
    defaultValues: {
      emails: [],
      message: '',
      plusOne: false,
      sendNow: true,
    },
  })

  const addEmail = () => {
    const emailValue = emailInputValue.trim()
    
    // Basic email validation
    if (!emailValue || !emailValue.includes('@')) {
      return
    }
    
    if (!emails.includes(emailValue)) {
      const newEmails = [...emails, emailValue]
      setEmails(newEmails)
      form.setValue('emails', newEmails)
    }
    
    setEmailInputValue('')
  }

  const removeEmail = (email: string) => {
    const newEmails = emails.filter(e => e !== email)
    setEmails(newEmails)
    form.setValue('emails', newEmails)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addEmail()
    }
  }

  const onSubmit = async (data: InvitationFormValues) => {
    setIsSubmitting(true)
    
    try {
      const bulkInvitations = data.emails.map(email => ({
        email,
        event_id: eventId,
        message: data.message || null,
        plus_one: data.plusOne,
        status: data.sendNow ? 'sent' : 'draft',
      }))
      
      const { data: result, error } = await supabase
        .from('invitations')
        .insert(bulkInvitations)
        .select()
      
      if (error) {
        throw error
      }
      
      if (data.sendNow) {
        // Call API to send invitations
        await fetch('/api/invitations/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitationIds: result.map(r => r.id),
          }),
        })
      }
      
      toast({
        title: 'Invitations created',
        description: data.sendNow 
          ? `${data.emails.length} invitations have been sent.` 
          : `${data.emails.length} invitation drafts have been created.`,
      })
      
      // Reset form
      setEmails([])
      form.reset()
      
      // Refresh the page to show new invitations
      router.refresh()
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error sending invitations',
        description: 'There was an error creating the invitations. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: "100%" }} className="space-y-4 sm:space-y-6">
        <FormField
          control={form.control}
          name="emails"
          render={() => (
            <FormItem style={{ width: "100%" }}>
              <FormLabel className="text-xs sm:text-sm">Guest Emails</FormLabel>
              <FormControl>
                <div style={{ width: "100%" }} className="space-y-2 sm:space-y-3">
                  <div style={{ width: "100%", display: "flex" }} className="gap-1.5 sm:gap-2">
                    <Input
                      placeholder="guest@example.com"
                      value={emailInputValue}
                      onChange={e => setEmailInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      style={{ flex: 1, minWidth: 0 }}
                      className="text-xs sm:text-sm h-8 sm:h-9"
                      data-testid="email-input"
                    />
                    <Button
                      type="button"
                      onClick={addEmail}
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0"
                      data-testid="add-email-button"
                    >
                      <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                  
                  {emails.length > 0 && (
                    <div style={{ width: "100%", overflowX: "hidden", display: "flex", flexWrap: "wrap" }} className="gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                      {emails.map(email => (
                        <div
                          key={email}
                          style={{ maxWidth: "calc(100% - 6px)" }}
                          className="flex items-center gap-0.5 xs:gap-1 bg-primary/10 text-primary rounded-md px-1 xs:px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs"
                        >
                          <Mail className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                          <span style={{ maxWidth: "calc(100% - 25px)" }} className="truncate text-[10px] sm:text-xs">{email}</span>
                          <Button
                            type="button"
                            onClick={() => removeEmail(email)}
                            variant="ghost"
                            size="icon"
                            className="h-3.5 w-3.5 sm:h-4 sm:w-4 p-0 ml-0.5 sm:ml-1 flex-shrink-0"
                          >
                            <X className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    style={{ width: "100%" }}
                    className="mt-1.5 sm:mt-2 text-muted-foreground border-dashed text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                    Import from CSV
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        // CSV import functionality would go here
                        console.log('CSV import:', e.target.files)
                      }}
                    />
                  </Button>
                </div>
              </FormControl>
              <FormDescription className="text-[10px] sm:text-xs">
                Add guest emails one by one or import from a CSV file
              </FormDescription>
              <FormMessage className="text-[10px] sm:text-xs" />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs sm:text-sm">Personal Message (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a personalized message to your invitation"
                  className="min-h-[80px] sm:min-h-[100px] text-xs sm:text-sm"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-[10px] sm:text-xs" />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col gap-3 sm:gap-4">
          <FormField
            control={form.control}
            name="plusOne"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 sm:space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5"
                  />
                </FormControl>
                <div className="space-y-0.5 sm:space-y-1 leading-none">
                  <FormLabel className="text-xs sm:text-sm">Allow Plus One</FormLabel>
                  <FormDescription className="text-[10px] sm:text-xs">
                    Guests can bring a companion to the event
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="sendNow"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 sm:space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 mt-0.5"
                  />
                </FormControl>
                <div className="space-y-0.5 sm:space-y-1 leading-none">
                  <FormLabel className="text-xs sm:text-sm">Send Immediately</FormLabel>
                  <FormDescription className="text-[10px] sm:text-xs">
                    Send invitations now or save as draft
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full text-xs sm:text-sm h-8 sm:h-9 mt-2" 
          disabled={isSubmitting || emails.length === 0}
        >
          <Send className="mr-1.5 sm:mr-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {isSubmitting ? 'Sending...' : 'Send Invitations'}
        </Button>
      </form>
    </Form>
  );
} 