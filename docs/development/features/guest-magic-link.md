# Guest Magic Link Authentication Feature

## Overview
This document outlines the implementation plan for adding magic link authentication for guests who have already RSVP'd but need to return to their event dashboard later.

## Problem Statement
Currently, guests who RSVP and leave the site have no easy way to return to their dashboard. They need to either:
1. Remember and manually enter the original invitation link from their email
2. Contact the event organizer for a new link

## Proposed Solution
Implement a "Magic Link" system that allows guests to:
1. Request a login link by entering their email
2. Receive an email with a secure link directly to their guest dashboard
3. Optionally add the application to their mobile home screen for easy access

## Technical Implementation

### 1. Guest Login Page
Create a new page at `/guest-access` that:
- Provides a simple form requesting the guest's email
- Validates the email against the `guests` table
- Triggers a magic link email if the email is found

```tsx
// src/app/guest-access/page.tsx
'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
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
import { useToast } from '@/components/ui/use-toast'

const accessFormSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type AccessFormValues = z.infer<typeof accessFormSchema>

export default function GuestAccessPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClientComponentClient()
  
  const form = useForm<AccessFormValues>({
    resolver: zodResolver(accessFormSchema),
    defaultValues: {
      email: '',
    },
  })

  async function onSubmit(values: AccessFormValues) {
    setIsLoading(true)
    try {
      // Find guest by email
      const { data: guests, error: guestError } = await supabase
        .from('guests')
        .select('id, event_id, invitation_id, access_token')
        .eq('email', values.email)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (guestError || !guests || guests.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Email not found',
          description: 'We couldn\'t find your email in our guest list. Please check your email or contact the event organizer.',
        })
        return
      }
      
      // Get the most recent guest record
      const guest = guests[0]
      
      // Call our API to send the magic link email
      const response = await fetch('/api/guest/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          eventId: guest.event_id,
          accessToken: guest.access_token,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send magic link')
      }
      
      setIsSuccess(true)
      toast({
        title: 'Magic link sent!',
        description: 'Please check your email for the login link.',
      })
      
    } catch (error) {
      console.error('Error sending magic link:', error)
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send magic link',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-md py-12 px-4">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Event Guest Access</h1>
          <p className="text-muted-foreground">
            Enter your email to get a link to your event dashboard
          </p>
        </div>
        
        {isSuccess ? (
          <div className="bg-primary/10 p-6 rounded-lg text-center space-y-4">
            <h2 className="font-semibold text-xl">Check Your Email</h2>
            <p>
              We've sent a magic link to your email. Click the link to access your event dashboard.
            </p>
            <p className="text-sm text-muted-foreground">
              Can't find the email? Check your spam folder or request a new link.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsSuccess(false)
                form.reset()
              }}
            >
              Request Another Link
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter your email" 
                        type="email" 
                        autoComplete="email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Enter the email you used for your RSVP
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Magic Link'}
              </Button>
            </form>
          </Form>
        )}
      </div>
    </div>
  )
}
```

### 2. Magic Link API Endpoint
Create an API endpoint to handle magic link generation and sending:

```tsx
// src/app/api/guest/magic-link/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, eventId, accessToken } = await request.json()
    
    // Validate input
    if (!email || !eventId || !accessToken) {
      return NextResponse.json(
        { message: 'Missing required fields' }, 
        { status: 400 }
      )
    }
    
    const supabase = createRouteHandlerClient({ cookies })
    
    // Verify the guest exists with this email, event, and token
    const { data: guest, error: guestError } = await supabase
      .from('guests')
      .select('id, name, email')
      .eq('email', email)
      .eq('event_id', eventId)
      .eq('access_token', accessToken)
      .single()
    
    if (guestError || !guest) {
      console.error('Guest verification error:', guestError)
      return NextResponse.json(
        { message: 'Guest not found or invalid token' }, 
        { status: 404 }
      )
    }
    
    // Get event details for the email
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .single()
    
    if (eventError) {
      console.error('Event fetch error:', eventError)
      // Continue anyway, we'll just have a generic event name
    }
    
    const eventName = event?.name || 'your event'
    
    // Generate secure dashboard link
    const dashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/guest/dashboard?token=${accessToken}`
    
    // Send email with the magic link
    const { error: emailError } = await supabase.functions.invoke('send-guest-magic-link', {
      body: {
        to: email,
        name: guest.name,
        eventName,
        magicLink: dashboardUrl
      }
    })
    
    if (emailError) {
      console.error('Email sending error:', emailError)
      return NextResponse.json(
        { message: 'Failed to send email' }, 
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: 'Magic link sent successfully'
    })
    
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { message: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
```

### 3. Magic Link Email Template
Create an Edge Function for sending the magic link email:

```ts
// supabase/functions/send-guest-magic-link/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    const { to, name, eventName, magicLink } = await req.json()
    
    // Simple validation
    if (!to || !magicLink) {
      return new Response(
        JSON.stringify({ message: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // Create Supabase client
    const supabaseClient = createClient(
      // These environment variables are set automatically by Supabase Edge Functions
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )
    
    // Send the email using a template
    const { error } = await supabaseClient.functions.invoke('send-email', {
      body: {
        to,
        template: 'guest-magic-link',
        data: {
          name: name || 'Guest',
          eventName,
          magicLink,
          year: new Date().getFullYear()
        }
      }
    })
    
    if (error) {
      console.error('Email sending error:', error)
      throw error
    }
    
    return new Response(
      JSON.stringify({ message: 'Email sent successfully' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
    
  } catch (error) {
    console.error('Error in magic link function:', error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

Create an email template for the magic link:

```html
<!-- templates/guest-magic-link.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Magic Link</title>
  <style>
    /* Email styles */
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .logo {
      text-align: center;
      margin-bottom: 20px;
    }
    .content {
      background-color: #f9f9f9;
      padding: 30px;
      border-radius: 8px;
    }
    .button {
      display: inline-block;
      background-color: #0070f3;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 4px;
      margin: 20px 0;
      font-weight: bold;
    }
    .button:hover {
      background-color: #0051a8;
    }
    .footer {
      margin-top: 30px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">
      <img src="{{base_url}}/images/email/logo.png" alt="CloudBurst" height="40">
    </div>
    <div class="content">
      <h1>Hello {{name}}!</h1>
      <p>Here's your secure link to access the dashboard for <strong>{{eventName}}</strong>.</p>
      <p>Click the button below to go to your guest dashboard:</p>
      <div style="text-align: center;">
        <a href="{{magicLink}}" class="button">Access Your Dashboard</a>
      </div>
      <p><strong>Tip:</strong> Once you're logged in, you can add this page to your home screen for quick access:</p>
      <ul>
        <li>On iPhone: Tap the share icon, then "Add to Home Screen"</li>
        <li>On Android: Tap the menu icon, then "Add to Home Screen"</li>
      </ul>
      <p>This link will give you access to your photos, event details, and allow you to upload new pictures.</p>
    </div>
    <div class="footer">
      <p>If you didn't request this email, please ignore it.</p>
      <p>&copy; {{year}} CloudBurst. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
```

### 4. Home Screen Installation Prompt

Add a component to prompt guests to add the application to their home screen:

```tsx
// src/components/guest/HomeScreenPrompt.tsx
'use client'

import { useState, useEffect } from 'react'
import { X, PlusCircle, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function HomeScreenPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  
  useEffect(() => {
    // Check if already installed or dismissed
    const hasPrompted = localStorage.getItem('homescreen-prompted')
    if (hasPrompted) return
    
    // Detect if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(iOS)
    
    // Check if already in standalone mode (installed PWA)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    
    // Show prompt after a delay if not standalone
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 5000) // 5 second delay
      
      return () => clearTimeout(timer)
    }
  }, [])
  
  const dismissPrompt = () => {
    setShowPrompt(false)
    // Remember for 7 days
    localStorage.setItem('homescreen-prompted', Date.now().toString())
    // We could make this smarter by checking the date when we retrieve it
  }

  if (!showPrompt || isStandalone) return null
  
  return (
    <Card className="fixed bottom-4 left-4 right-4 z-50 shadow-lg">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Smartphone className="h-8 w-8 mr-3 text-primary" />
            <div>
              <h3 className="font-semibold">Add to Home Screen</h3>
              <p className="text-sm text-muted-foreground">
                {isIOS 
                  ? 'Tap the share icon and then "Add to Home Screen"'
                  : 'Tap the menu and select "Add to Home Screen"'
                }
              </p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={dismissPrompt}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

Add this component to the guest dashboard:

```tsx
// In src/app/guest/dashboard/page.tsx
import { HomeScreenPrompt } from '@/components/guest/HomeScreenPrompt'

export default function GuestDashboard() {
  // Existing code...
  
  return (
    <>
      {/* Existing dashboard content */}
      <HomeScreenPrompt />
    </>
  )
}
```

## Navigation Integration

Update the site navigation to include a "Returning Guest?" link:

```tsx
// In src/components/marketing/SiteHeader.tsx or similar navigation component
<Link href="/guest-access" className="text-sm font-medium hover:underline">
  Returning Guest?
</Link>
```

## Testing Plan

1. **Email Link Testing**
   - Test sending magic links to various email providers
   - Verify link opens the correct guest dashboard
   - Test edge cases (invalid email, multiple RSVPs, etc.)

2. **Home Screen Installation**
   - Test on iOS devices (iPhone, iPad)
   - Test on Android devices
   - Verify the prompt appears and functions correctly
   - Test the "Add to Home Screen" functionality
   - Verify the app icon and name appear correctly on home screens

3. **Security Testing**
   - Verify that invalid or expired tokens are rejected
   - Ensure valid tokens only access the correct guest dashboard
   - Check that email verification prevents unauthorized access

## Implementation Timeline

1. Create the `guest-access` page and form
2. Implement the magic link API endpoint
3. Create the email template and Edge Function
4. Add the home screen installation prompt
5. Update navigation to include the "Returning Guest?" link
6. Testing and refinement

## Future Enhancements

1. Token expiration and refresh mechanism
2. Remember me functionality for frequent guests
3. QR code option for quick access in public settings
4. Multiple event access from a single dashboard for returning guests
5. Push notifications for new photos or event updates 