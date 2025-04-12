'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { supabase } from '@/lib/supabase/client'
import { Loader2, ArrowLeft, User2Icon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
  email: z.string().email({
    message: 'Please enter a valid email address.',
  }),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

export default function GuestProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get('token')
  
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guest, setGuest] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
    },
  })

  useEffect(() => {
    async function loadGuestData() {
      if (!invitationToken) {
        setError('No invitation token provided')
        setLoading(false)
        return
      }

      try {
        // Fetch guest info using the invitation token
        const { data: guestData, error: guestError } = await supabase
          .from('guests')
          .select('*, events(*)')
          .eq('invitation_token', invitationToken)
          .single()

        if (guestError) {
          throw new Error('Invalid invitation token')
        }

        if (!guestData) {
          throw new Error('Guest not found')
        }

        setGuest(guestData)
        setEvent(guestData.events)

        // Pre-populate form
        form.reset({
          name: guestData.name || '',
          email: guestData.email || '',
          phone: guestData.phone || '',
          notes: guestData.notes || '',
        })

        setLoading(false)
      } catch (err: any) {
        setError(err.message || 'Failed to load guest data')
        setLoading(false)
      }
    }

    loadGuestData()
  }, [invitationToken, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!invitationToken || !guest?.id) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Missing guest information. Please try again.',
      })
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('guests')
        .update({
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          notes: values.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', guest.id)

      if (error) throw error

      toast({
        title: 'Profile updated',
        description: 'Your information has been saved successfully.',
      })
      
      // Redirect back to dashboard
      router.push(`/guest/dashboard?token=${invitationToken}`)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="container max-w-7xl py-10 flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-muted-foreground text-center mt-4">
          Please check your invitation link or contact the event organizer.
        </p>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl py-10">
      <div className="mb-8">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(`/guest/dashboard?token=${invitationToken}`)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground mt-1">
          Update your information for {event?.name || 'this event'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User2Icon className="h-5 w-5" />
            Guest Information
          </CardTitle>
          <CardDescription>
            Please provide your current contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your full name as you'd like it to appear
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="your.email@example.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll use this to contact you about the event
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>
                      For urgent communications only
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
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any additional information you'd like the host to know"
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
} 