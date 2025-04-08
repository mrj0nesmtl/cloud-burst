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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="emails"
          render={() => (
            <FormItem>
              <FormLabel>Guest Emails</FormLabel>
              <FormControl>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="guest@example.com"
                      value={emailInputValue}
                      onChange={e => setEmailInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1"
                      data-testid="email-input"
                    />
                    <Button
                      type="button"
                      onClick={addEmail}
                      variant="outline"
                      size="icon"
                      data-testid="add-email-button"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {emails.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {emails.map(email => (
                        <div
                          key={email}
                          className="flex items-center gap-1 bg-primary/10 text-primary rounded-md px-2 py-1 text-sm"
                        >
                          <Mail className="h-3 w-3" />
                          <span>{email}</span>
                          <Button
                            type="button"
                            onClick={() => removeEmail(email)}
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0 ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2 text-muted-foreground border-dashed"
                    onClick={() => document.getElementById('csv-upload')?.click()}
                  >
                    <Users className="h-4 w-4 mr-2" />
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
              <FormDescription>
                Add guest emails one by one or import from a CSV file
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Personal Message (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add a personalized message to your invitation"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="plusOne"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Allow Plus One</FormLabel>
                  <FormDescription>
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
              <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Send Immediately</FormLabel>
                  <FormDescription>
                    Send invitations now or save as draft
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={isSubmitting || emails.length === 0}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-pulse" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {form.watch('sendNow') ? 'Send Invitations' : 'Save as Draft'}
            </>
          )}
        </Button>
      </form>
    </Form>
  );
} 