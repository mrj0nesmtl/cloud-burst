'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Schema for the auth form
const authSchema = z.object({
  email: z.string().email("Please enter a valid email address")
})

interface GuestAuthCheckProps {
  eventId: string
  eventName: string
}

export function GuestAuthCheck({ eventId, eventName }: GuestAuthCheckProps) {
  const [isCheckingAccess, setIsCheckingAccess] = useState(false)
  const [isSendingMagicLink, setIsSendingMagicLink] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  
  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: ''
    }
  })
  
  async function onSubmit(values: z.infer<typeof authSchema>) {
    setIsCheckingAccess(true)
    
    try {
      // Check if guest has access to this gallery
      const response = await fetch('/api/gallery/check-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: values.email,
          eventId
        })
      })
      
      const data = await response.json()
      
      if (response.ok && data.hasAccess) {
        // Send magic link for authentication
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
          title: "Magic Link Sent",
          description: "Check your email for a link to access the gallery.",
        })
      } else {
        // Show error that they don't have access
        form.setError('email', { 
          type: 'manual',
          message: "You don't have access to this gallery. Please contact the event organizer."
        })
      }
    } catch (error) {
      console.error('Error checking access:', error)
      toast({
        title: "Error",
        description: error instanceof Error 
          ? error.message 
          : "Failed to send magic link. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsCheckingAccess(false)
      setIsSendingMagicLink(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Magic Link Sent</CardTitle>
            <CardDescription>
              Please check your email for a link to access the gallery.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">
              If you don't see the email, please check your spam folder.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="p-2 rounded-full bg-primary/10">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Private Gallery</CardTitle>
          <CardDescription className="text-center">
            This gallery for "{eventName}" is private. Please enter your email to verify access.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          placeholder="Enter your email" 
                          type="email" 
                          className="pl-9" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      We'll send you a magic link if you have access.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCheckingAccess || isSendingMagicLink}
              >
                {isCheckingAccess 
                  ? "Checking access..." 
                  : isSendingMagicLink 
                  ? "Sending link..." 
                  : "Access Gallery"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Need access? Contact the event organizer.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
} 