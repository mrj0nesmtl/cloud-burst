'use client'

import { useState } from 'react'
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
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useToast } from '@/components/ui/use-toast'
import { z } from 'zod'
import { Mail, User, Phone, Lock } from 'lucide-react'

// Form validation schema
const guestReservationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
})

type GuestReservationValues = z.infer<typeof guestReservationSchema>

interface GuestReservationFormProps {
  eventId: string
  eventName: string
  onReservationComplete?: () => void
}

export function GuestReservationForm({ 
  eventId, 
  eventName,
  onReservationComplete
}: GuestReservationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const form = useForm<GuestReservationValues>({
    resolver: zodResolver(guestReservationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      agreeToTerms: false
    }
  })
  
  async function onSubmit(values: GuestReservationValues) {
    setIsSubmitting(true)
    
    try {
      // 1. Create guest reservation
      const response = await fetch('/api/guests/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          eventId
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create reservation')
      }
      
      // 2. Send magic link for authentication
      setIsSendingMagicLink(true)
      
      const { error } = await supabase.auth.signInWithOtp({
        email: values.email,
        options: {
          emailRedirectTo: `${window.location.origin}/events/${eventId}/gallery`,
        }
      })
      
      if (error) {
        throw new Error(error.message)
      }
      
      setIsSuccess(true)
      
      toast({
        title: "Registration Complete",
        description: "We've sent a magic link to your email. Please check your inbox to access the event gallery.",
      })
      
      if (onReservationComplete) {
        onReservationComplete()
      }
    } catch (error) {
      console.error('Error creating guest reservation:', error)
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete registration. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
      setIsSendingMagicLink(false)
    }
  }
  
  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Thank You!</CardTitle>
          <CardDescription>
            You've successfully registered for {eventName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-primary/10 p-4 rounded-md">
            <p className="text-center text-sm">
              We've sent a magic link to your email. Please check your inbox to access the event gallery.
            </p>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            If you don't see the email, please check your spam folder. The link expires in 24 hours.
          </p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Register for {eventName}</CardTitle>
        <CardDescription>
          Fill out this form to access the event gallery
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter your full name" className="pl-9" {...field} />
                    </div>
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
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter your email" type="email" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    We'll send you a magic link to access the event gallery.
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
                    <div className="relative">
                      <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input placeholder="Enter your phone number" type="tel" className="pl-9" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="agreeToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms and conditions
                    </FormLabel>
                    <FormDescription>
                      By checking this box, you agree to our{' '}
                      <a href="/terms" className="underline">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="underline">
                        Privacy Policy
                      </a>.
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex items-center justify-center mt-6">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || isSendingMagicLink}
              >
                {isSubmitting 
                  ? "Processing..." 
                  : isSendingMagicLink 
                  ? "Sending Magic Link..." 
                  : "Register Now"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col items-center">
        <div className="flex items-center text-xs text-muted-foreground mt-4">
          <Lock className="h-3.5 w-3.5 mr-1" />
          <span>Your information is securely encrypted</span>
        </div>
      </CardFooter>
    </Card>
  )
} 