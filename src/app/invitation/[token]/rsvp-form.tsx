'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { CheckCircle, XCircle, HelpCircle, Loader2, CalendarPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { Invitation, InvitationMetadata, RsvpStatus } from '@/types/invitations'
import { RsvpFormValues } from '@/types/rsvp'
import { rsvpSchema as rsvpFormSchema } from '@/lib/validations/rsvp'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

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
  const [step, setStep] = useState<'response' | 'details'>('response')
  
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
      
      // Track the RSVP submission analytics
      try {
        await fetch('/api/analytics/rsvp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            invitationId: invitation.id,
            status: values.status,
            timestamp: new Date().toISOString(),
            source: 'invitation_page',
            details: {
              guestCount: values.guestCount || 1,
              hasPlusOne: values.plusOne || false,
              hasDietaryRestrictions: !!values.dietaryRestrictions?.trim(),
              hasNotes: !!values.notes?.trim()
            }
          }),
        })
      } catch (analyticsError) {
        // Don't fail if analytics tracking fails
        console.error('Analytics tracking error:', analyticsError)
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
      <div className="bg-muted p-6 rounded-lg text-center">
        <div className="flex justify-center mb-4">
          {invitation.rsvp_status === ('accepted' as any) ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : invitation.rsvp_status === ('declined' as any) ? (
            <XCircle className="h-12 w-12 text-red-500" />
          ) : (
            <HelpCircle className="h-12 w-12 text-yellow-500" />
          )}
        </div>
        <h3 className="font-medium text-xl mb-2">
          {invitation.rsvp_status === ('accepted' as any)
            ? "You've confirmed your attendance!"
            : invitation.rsvp_status === ('declined' as any)
            ? "You've declined this invitation."
            : "You've responded with 'maybe'."}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 mb-4">
          Response submitted on {responseDate}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button 
            variant="outline" 
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
          
          {invitation.rsvp_status === ('accepted' as any) && (
            <Button variant="outline" className="flex items-center gap-2">
              <CalendarPlus className="h-4 w-4" />
              Add to Calendar
            </Button>
          )}
        </div>
      </div>
    )
  }
  
  const watchStatus = form.watch('status')
  const watchPlusOne = form.watch('plusOne')
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
        <Tabs 
          defaultValue="response" 
          value={step} 
          onValueChange={(value) => setStep(value as 'response' | 'details')}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="response">Attendance</TabsTrigger>
            <TabsTrigger 
              value="details" 
              disabled={watchStatus === 'declined'}
            >
              Details
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="response" className="space-y-6 pt-4">
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        // If user selects declined, update form values
                        if (value === 'declined') {
                          form.setValue('plusOne', false);
                          form.setValue('plusOneName', '');
                        }
                      }}
                      defaultValue={field.value}
                      className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center"
                    >
                      <div className={cn(
                        "flex items-center space-x-2 border rounded-md px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                        field.value === 'accepted' && "border-green-500 bg-green-50 dark:bg-green-900/20"
                      )}>
                        <RadioGroupItem value="accepted" id="accepted" />
                        <FormLabel htmlFor="accepted" className="cursor-pointer flex items-center font-normal">
                          <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                          Yes, I'll attend
                        </FormLabel>
                      </div>
                      <div className={cn(
                        "flex items-center space-x-2 border rounded-md px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                        field.value === 'declined' && "border-red-500 bg-red-50 dark:bg-red-900/20"
                      )}>
                        <RadioGroupItem value="declined" id="declined" />
                        <FormLabel htmlFor="declined" className="cursor-pointer flex items-center font-normal">
                          <XCircle className="h-4 w-4 mr-2 text-red-500" />
                          No, I can't make it
                        </FormLabel>
                      </div>
                      <div className={cn(
                        "flex items-center space-x-2 border rounded-md px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                        field.value === 'pending' && "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                      )}>
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
            
            {watchStatus !== 'declined' && (
              <div className="pt-4 flex justify-end">
                <Button 
                  type="button" 
                  onClick={() => setStep('details')}
                  disabled={watchStatus === 'declined'}
                >
                  Continue to Details
                </Button>
              </div>
            )}
            
            {watchStatus === 'declined' && (
              <div className="pt-4">
                <FormField
                  control={form.control as any}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Let us know why you can't make it (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional information you'd like to share"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="min-w-[120px]"
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
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6 pt-4">
            <div className="text-center mb-4">
              <h3 className="font-semibold text-lg">Additional Details</h3>
              <p className="text-sm text-muted-foreground">
                Please provide some additional information
              </p>
            </div>
            
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
                  <FormDescription>
                    Please let us know of any dietary restrictions or allergies
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., vegetarian, gluten-free, nut allergies..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
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
                  <FormDescription>
                    Any additional information you'd like to share with the host
                  </FormDescription>
                  <FormControl>
                    <Textarea
                      placeholder="E.g., special requests, questions, or comments"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setStep('response')}
              >
                Back
              </Button>
              
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
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
            </div>
          </TabsContent>
        </Tabs>
      </form>
    </Form>
  )
} 