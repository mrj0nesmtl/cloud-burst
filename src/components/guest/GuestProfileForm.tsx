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
import { getFirstAttendeeForToken } from '@/lib/supabase/attendees'

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
        const attendee = await getFirstAttendeeForToken(invitationToken)
        if (attendee) {
          setAttendeeData(attendee)
          // Set form values from attendee data
          form.setValue('full_name', attendee.full_name || '')
          form.setValue('email', attendee.email || '')
        }
      } catch (error) {
        console.error('Error loading attendee data:', error)
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
  }, [invitationToken, form, toast])

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true)
    try {
      // First update the attendee information
      const { error: attendeeError } = await supabase
        .from('event_attendees')
        .update({
          full_name: data.full_name,
          email: data.email,
          phone: data.phone,
        })
        .eq('invitation_token', invitationToken)
        .eq('event_id', eventId)

      if (attendeeError) throw attendeeError

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