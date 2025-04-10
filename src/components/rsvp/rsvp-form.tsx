'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { rsvpFormSchema } from '@/lib/validations/rsvp'

type Event = {
  id: string
  name: string
  host_name?: string
  description?: string
  start_date?: string
  end_date?: string
  location?: string
}

type Invitation = {
  id: string
  email?: string
  event_id: string
  status: string
  expires_at?: string | null
}

interface RsvpFormProps {
  invitation: Invitation
  event: Event
  token: string
}

export function RsvpForm({ invitation, event, token }: RsvpFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showGuestFields, setShowGuestFields] = useState(false)

  const form = useForm<z.infer<typeof rsvpFormSchema>>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      status: 'accepted',
      name: '',
      email: invitation.email || '',
      phone: '',
      guest_count: 0,
      dietary_restrictions: '',
      notes: '',
      marketing_consent: false
    },
  })

  async function onSubmit(values: z.infer<typeof rsvpFormSchema>) {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/rsvp/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          invitation_id: invitation.id,
          event_id: event.id,
          token,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong')
      }
      
      // Redirect to confirmation page
      router.push(`/invitation/${token}/confirmation/${values.status}`)
      toast.success('Your RSVP has been submitted successfully!')
    } catch (error) {
      console.error('RSVP submission error:', error)
      toast.error('Failed to submit RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Will you attend?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value);
                    setShowGuestFields(value === 'accepted');
                  }}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="accepted" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Yes, I'll be there
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="declined" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      No, I can't make it
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-1.5 block">
                  Full Name <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your full name" 
                    className="h-12 px-4 text-base w-full rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium mb-1.5 block">
                  Email Address <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="your.email@example.com"
                    type="email"
                    className="h-12 px-4 text-base w-full rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    {...field}
                    disabled={!!invitation.email}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="mt-2">
              <FormLabel className="text-base font-medium mb-1.5 block">
                Phone Number (optional)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Your phone number" 
                  className="h-12 px-4 text-base w-full rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" 
                  {...field} 
                />
              </FormControl>
              <FormDescription className="text-sm mt-1">
                We'll only use this to contact you about this event
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {showGuestFields && (
          <>
            <FormField
              control={form.control}
              name="guest_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Guests</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      max="3"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormDescription>
                    Number of additional guests attending with you
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dietary_restrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium mb-1.5 block">
                    Dietary Restrictions (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please list any dietary restrictions or allergies"
                      className="min-h-24 resize-none px-4 py-3 text-base rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium mb-1.5 block">
                Additional Notes (optional)
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Anything else you'd like to share with the host"
                  className="min-h-24 resize-none px-4 py-3 text-base rounded-md border-input bg-background ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="marketing_consent"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-6">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  I agree to receive updates about this event and future events
                </FormLabel>
                <FormDescription>
                  You can unsubscribe at any time
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {invitation.expires_at && new Date(invitation.expires_at) < new Date() && (
          <Alert variant="destructive">
            <AlertDescription>
              Please note that the RSVP deadline has passed, but you can still submit your response.
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-6 flex justify-center">
          <Button 
            type="submit"
            className="min-w-[180px] h-12 px-8 text-base font-medium transition-colors hover:bg-primary/90 hover:shadow-md"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit RSVP'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 