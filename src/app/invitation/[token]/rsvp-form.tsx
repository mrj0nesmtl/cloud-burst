'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Invitation, InvitationMetadata, RsvpStatus } from '@/types/invitations'
import { RsvpFormValues } from '@/types/rsvp'
import { rsvpFormSchema } from '@/lib/validation/rsvp.schema'

type RsvpFormProps = {
  invitation: Invitation
  token: string
  rsvp?: {
    id: string
    status: string
    guest_count: number
    dietary_restrictions?: string
    notes?: string
  } | null
}

export function RsvpForm({ invitation, token, rsvp }: RsvpFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Determine if the invitation has been responded to
  const hasResponded = invitation.rsvp_status && invitation.rsvp_status !== 'pending' && invitation.rsvp_date
  
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema) as any,
    defaultValues: {
      status: (rsvp?.status as any) || invitation.rsvp_status || 'pending',
      guestCount: rsvp?.guest_count || 1,
      plusOne: (invitation.metadata as any)?.plus_one_used || false,
      plusOneName: (invitation.metadata as any)?.plus_one_name || '',
      dietaryRestrictions: rsvp?.dietary_restrictions || (invitation.metadata as any)?.dietary_preferences || '',
      notes: rsvp?.notes || (invitation.metadata as any)?.notes || '',
    },
  })
  
  const onSubmit = async (values: RsvpFormValues) => {
    setIsSubmitting(true)
    
    try {
      // Submit the RSVP through the API
      const response = await fetch('/api/rsvp/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          ...values,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit RSVP')
      }
      
      // Show success toast
      toast({
        title: 'RSVP Submitted',
        description: values.status === 'accepted' 
          ? "Great! You've confirmed your attendance."
          : values.status === 'declined'
            ? "We're sorry you can't make it."
            : "Your RSVP status has been updated.",
        variant: 'default',
      })
      
      // Redirect to confirmation page based on status
      if (values.status === 'accepted') {
        router.push(`/invitation/${token}/confirmation/accepted`)
      } else if (values.status === 'declined') {
        router.push(`/invitation/${token}/confirmation/declined`)
      } else {
        // Refresh the page to show updated status
        router.refresh()
      }
      
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      toast({
        title: 'Error',
        description: 'There was a problem submitting your RSVP. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  // If the invitation has already been responded to, show a message
  if (hasResponded && !form.formState.isDirty) {
    const responseDate = invitation.rsvp_date 
      ? new Date(invitation.rsvp_date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : 'previously'
    
    return (
      <div className="bg-muted p-4 rounded-lg text-center">
        <div className="flex justify-center mb-2">
          {invitation.rsvp_status === ('accepted' as any) ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : invitation.rsvp_status === ('declined' as any) ? (
            <XCircle className="h-8 w-8 text-red-500" />
          ) : (
            <HelpCircle className="h-8 w-8 text-yellow-500" />
          )}
        </div>
        <h3 className="font-medium text-lg">
          {invitation.rsvp_status === ('accepted' as any)
            ? "You've confirmed your attendance!"
            : invitation.rsvp_status === ('declined' as any)
            ? "You've declined this invitation."
            : "You've responded with 'maybe'."}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Response submitted on {responseDate}
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => {
            form.reset({
              status: (rsvp?.status as any) || invitation.rsvp_status || 'pending',
              guestCount: rsvp?.guest_count || 1,
              plusOne: (invitation.metadata as any)?.plus_one_used || false,
              plusOneName: (invitation.metadata as any)?.plus_one_name || '',
              dietaryRestrictions: rsvp?.dietary_restrictions || (invitation.metadata as any)?.dietary_preferences || '',
              notes: rsvp?.notes || (invitation.metadata as any)?.notes || '',
            })
          }}
        >
          Update My Response
        </Button>
      </div>
    )
  }
  
  const watchStatus = form.watch('status')
  const watchPlusOne = form.watch('plusOne')
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg">Will you attend?</h3>
          <p className="text-sm text-muted-foreground">
            Please let us know if you'll be able to join us
          </p>
        </div>
        
        <FormField
          control={form.control as any}
          name="status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center"
                >
                  <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="accepted" id="accepted" />
                    <FormLabel htmlFor="accepted" className="cursor-pointer flex items-center font-normal">
                      <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                      Yes, I'll attend
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="declined" id="declined" />
                    <FormLabel htmlFor="declined" className="cursor-pointer flex items-center font-normal">
                      <XCircle className="h-4 w-4 mr-2 text-red-500" />
                      No, I can't make it
                    </FormLabel>
                  </div>
                  <div className="flex items-center space-x-2 border rounded-md px-4 py-2 cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="pending" id="pending" />
                    <FormLabel htmlFor="pending" className="cursor-pointer flex items-center font-normal">
                      <HelpCircle className="h-4 w-4 mr-2 text-yellow-500" />
                      Maybe
                    </FormLabel>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {(invitation.metadata as any)?.plus_one_allowed && (
          <FormField
            control={form.control as any}
            name="plusOne"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Bringing a Guest</FormLabel>
                  <FormDescription>
                    Let us know if you'll be bringing someone with you
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={watchStatus === 'declined'}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        
        {watchPlusOne && watchStatus !== 'declined' && (
          <FormField
            control={form.control as any}
            name="plusOneName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guest's Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your guest's name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control as any}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please share any dietary restrictions or preferences..."
                  className="resize-none"
                  {...field}
                  disabled={watchStatus === 'declined'}
                />
              </FormControl>
              <FormDescription>
                This helps us ensure appropriate food options are available
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control as any}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information you'd like to share..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit RSVP'
          )}
        </Button>
      </form>
    </Form>
  )
} 