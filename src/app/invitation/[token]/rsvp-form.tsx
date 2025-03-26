'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { CheckCircle, XCircle, HelpCircle, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Invitation } from '@/types/invitations'

const formSchema = z.object({
  rsvpStatus: z.enum(['accepted', 'declined', 'pending'], {
    required_error: 'Please select a response',
  }),
  plusOne: z.boolean().default(false),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface RsvpFormProps {
  invitation: Invitation
}

export function RsvpForm({ invitation }: RsvpFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const supabase = createClientComponentClient()
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rsvpStatus: invitation.rsvp_status || 'pending',
      plusOne: invitation.plus_one_used || false,
      dietaryRestrictions: invitation.metadata?.dietary_preferences || '',
      notes: invitation.metadata?.notes || '',
    },
  })
  
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      // Update the invitation in the database
      const { error } = await supabase
        .from('invitations')
        .update({
          rsvp_status: values.rsvpStatus,
          rsvp_date: new Date().toISOString(),
          plus_one_used: values.plusOne,
          metadata: {
            ...invitation.metadata,
            dietary_preferences: values.dietaryRestrictions,
            notes: values.notes,
          },
        })
        .eq('id', invitation.id)
      
      if (error) {
        throw error
      }
      
      // Show success toast
      toast({
        title: 'RSVP Submitted',
        description: values.rsvpStatus === 'accepted' 
          ? "Great! You've confirmed your attendance."
          : values.rsvpStatus === 'declined'
            ? "We're sorry you can't make it."
            : "Your RSVP status has been updated.",
        variant: 'success',
      })
      
      // Refresh the page to show updated status
      router.refresh()
      
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
  if (invitation.rsvp_status && invitation.rsvp_status !== 'pending' && invitation.rsvp_date) {
    const responseDate = new Date(invitation.rsvp_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    
    return (
      <div className="bg-muted p-4 rounded-lg text-center">
        <div className="flex justify-center mb-2">
          {invitation.rsvp_status === 'accepted' ? (
            <CheckCircle className="h-8 w-8 text-green-500" />
          ) : (
            <XCircle className="h-8 w-8 text-red-500" />
          )}
        </div>
        <h3 className="font-medium text-lg">
          {invitation.rsvp_status === 'accepted'
            ? "You've confirmed your attendance!"
            : "You've declined this invitation."}
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Response submitted on {responseDate}
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => {
            form.reset({
              rsvpStatus: invitation.rsvp_status,
              plusOne: invitation.plus_one_used || false,
              dietaryRestrictions: invitation.metadata?.dietary_preferences || '',
              notes: invitation.metadata?.notes || '',
            })
            router.refresh()
          }}
        >
          Update My Response
        </Button>
      </div>
    )
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center mb-4">
          <h3 className="font-semibold text-lg">Will you attend?</h3>
          <p className="text-sm text-muted-foreground">
            Please let us know if you'll be able to join us
          </p>
        </div>
        
        <FormField
          control={form.control}
          name="rsvpStatus"
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
        
        {invitation.plus_one_allowed && (
          <FormField
            control={form.control}
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
                    disabled={form.watch('rsvpStatus') === 'declined'}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dietary Restrictions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Please share any dietary restrictions or preferences..."
                  className="resize-none"
                  {...field}
                  disabled={form.watch('rsvpStatus') === 'declined'}
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
          control={form.control}
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
        
        <div className="flex justify-center pt-2">
          <Button 
            type="submit" 
            size="lg"
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
        </div>
      </form>
    </Form>
  )
} 