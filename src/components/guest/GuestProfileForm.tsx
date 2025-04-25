'use client'

import { useState, useEffect } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { getFirstAttendeeForToken } from '@/lib/supabase/attendees/index'

const profileFormSchema = z.object({
  full_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().min(10, {
    message: 'Please enter a valid phone number.',
  }).optional(),
  instagram: z.string().optional(),
  bio: z.string().max(500, {
    message: 'Bio must not be longer than 500 characters.',
  }).optional(),
  newsletter_opt_in: z.boolean().default(false),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface GuestProfileFormProps {
  invitationToken: string
  eventId: string
  onComplete?: () => void
}

export function GuestProfileForm({ invitationToken, eventId, onComplete }: GuestProfileFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [attendeeData, setAttendeeData] = useState<any>(null)
  const supabase = createClientComponentClient()

  // Default form values
  const defaultValues: Partial<ProfileFormValues> = {
    full_name: '',
    email: '',
    phone: '',
    instagram: '',
    bio: '',
    newsletter_opt_in: false,
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  })

  // Load attendee data
  useEffect(() => {
    async function loadAttendeeData() {
      setIsLoading(true)
      try {
        // First, get the invitation ID from token
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, name, email')
          .eq('token', invitationToken)
          .single()
          
        if (invitationError) {
          console.error('Error loading invitation:', invitationError)
          return
        }
        
        // Try to load attendee data
        const attendee = await getFirstAttendeeForToken(invitationToken)
        
        if (attendee) {
          setAttendeeData(attendee)
          // Populate form with attendee data first
          form.setValue('full_name', attendee.full_name || invitation.name || '')
          form.setValue('email', attendee.email || invitation.email || '')
          form.setValue('phone', attendee.phone || '')
        } else {
          // No attendee record yet, try to get RSVP data
          const { data: rsvp, error: rsvpError } = await supabase
            .from('rsvps')
            .select('*')
            .eq('invitation_id', invitation.id)
            .single()
            
          if (rsvpError && rsvpError.code !== 'PGRST116') {
            console.error('Error loading RSVP:', rsvpError)
          }
          
          // Set form values from invitation and RSVP data
          form.setValue('full_name', invitation.name || '')
          form.setValue('email', invitation.email || '')
          
          // If we have RSVP data, we might have a phone number
          if (rsvp) {
            // Check if phone was captured during RSVP (depends on your schema)
            const phone = rsvp.phone || ''
            if (phone) form.setValue('phone', phone)
          }
        }
      } catch (error) {
        console.error('Error loading profile data:', error)
        toast({
          variant: 'destructive',
          title: 'Error loading profile',
          description: 'Could not load your profile information.',
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadAttendeeData()
  }, [invitationToken, form, toast, supabase])

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      // First check if attendee exists
      const attendee = await getFirstAttendeeForToken(invitationToken)
      
      if (attendee && attendee.id) {
        // Update existing attendee
        const { error: attendeeError } = await supabase
          .from('event_attendees')
          .update({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
          })
          .eq('id', attendee.id)
          .eq('event_id', eventId)

        if (attendeeError) throw attendeeError
      } else {
        // Get invitation id from token
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, event_id')
          .eq('token', invitationToken)
          .single()
          
        if (invitationError) throw invitationError
        
        // Create new attendee
        const { error: newAttendeeError } = await supabase
          .from('event_attendees')
          .insert({
            event_id: eventId,
            invitation_id: invitation.id,
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            status: 'confirmed',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          
        if (newAttendeeError) throw newAttendeeError
      }

      // Check if profile exists
      const { data: profileData, error: profileCheckError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', data.email)
        .single()

      if (profileCheckError && profileCheckError.code !== 'PGRST116') {
        throw profileCheckError
      }

      // Create or update profile
      const profileOperation = profileData 
        ? supabase.from('profiles').update({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            instagram_handle: data.instagram,
            bio: data.bio,
            newsletter_opt_in: data.newsletter_opt_in,
            updated_at: new Date().toISOString(),
          }).eq('id', profileData.id)
        : supabase.from('profiles').insert({
            full_name: data.full_name,
            email: data.email,
            phone: data.phone,
            instagram_handle: data.instagram,
            bio: data.bio,
            newsletter_opt_in: data.newsletter_opt_in,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

      const { error: profileUpdateError } = await profileOperation

      if (profileUpdateError) throw profileUpdateError

      toast({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated.',
      })

      if (onComplete) {
        onComplete()
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast({
        variant: 'destructive',
        title: 'Error updating profile',
        description: 'There was an error updating your profile. Please try again.',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your full name" {...field} />
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
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Enter your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter your phone number" {...field} />
              </FormControl>
              <FormDescription>
                Optional, but useful for event updates
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="instagram"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instagram Handle</FormLabel>
              <FormControl>
                <Input placeholder="@username" {...field} />
              </FormControl>
              <FormDescription>
                Optional. We may tag you in photos.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Tell us a bit about yourself" 
                  className="resize-none" 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Optional. This helps event hosts get to know you better.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="newsletter_opt_in"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Email Newsletter
                </FormLabel>
                <FormDescription>
                  Receive updates about future events and photo opportunities.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </Form>
  )
}

export default GuestProfileForm 