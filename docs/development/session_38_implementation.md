# Session 38: Implementation Guide

## 🎯 Guest Invitation & RSVP System Implementation

This document provides detailed technical guidance for implementing the public-facing RSVP system in Session 38. It includes code patterns, example implementations, and technical considerations.

## 1. Invitation Landing Page

### Token-Based Routing

The invitation page will use dynamic routes based on invitation tokens:

```typescript
// src/app/invitation/[token]/page.tsx
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { InvitationHero } from '@/components/invitation/invitation-hero'
import { EventDetailsCard } from '@/components/invitation/event-details-card'
import { RSVPForm } from '@/components/invitation/rsvp-form'

export default async function InvitationPage({ params }: { params: { token: string } }) {
  const { token } = params
  const supabase = createServerComponentClient({ cookies })
  
  // Fetch invitation data
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      id, email, name, status, token, expires_at,
      events (
        id, name, date, time, location, description, organizer_id, cover_image_url,
        profiles (
          name, avatar_url
        )
      )
    `)
    .eq('token', token)
    .single()
    
  // Handle expired or invalid tokens
  if (error || !invitation) {
    notFound()
  }
  
  // Check if invitation is expired
  const isExpired = invitation.expires_at && new Date(invitation.expires_at) < new Date()
  if (isExpired) {
    notFound()
  }
  
  const event = invitation.events
  
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <InvitationHero event={event} />
      
      <div className="container max-w-5xl px-4 py-8 mx-auto space-y-8">
        <EventDetailsCard event={event} />
        <RSVPForm invitation={invitation} />
      </div>
    </main>
  )
}
```

### Error and Loading States

```typescript
// src/app/invitation/[token]/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 text-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
        <h2 className="text-xl font-semibold">Loading your invitation...</h2>
      </div>
    </div>
  )
}

// src/app/invitation/[token]/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="space-y-4 text-center max-w-md px-4">
        <h1 className="text-4xl font-bold">Invitation Not Found</h1>
        <p className="text-muted-foreground">
          This invitation may have expired or the link is incorrect.
        </p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
```

## 2. RSVP Form Component

### Form Implementation with React Hook Form & Zod

```typescript
// src/lib/validations/rsvp-schema.ts
import { z } from 'zod'

export const rsvpSchema = z.object({
  status: z.enum(['accepted', 'declined']),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional().refine(
    (val) => !val || val.trim().length > 0,
    { message: "Plus one name cannot be empty if provided" }
  ),
  plusOneEmail: z.string().email("Invalid email").optional().nullable(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional()
}).refine((data) => {
  // If plusOne is true, plusOneName should be provided
  if (data.plusOne && (!data.plusOneName || data.plusOneName.trim() === '')) {
    return false
  }
  return true
}, {
  message: "Please provide your guest's name",
  path: ['plusOneName']
})

export type RsvpFormValues = z.infer<typeof rsvpSchema>
```

```typescript
// src/components/invitation/rsvp-form.tsx
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { rsvpSchema, type RsvpFormValues } from '@/lib/validations/rsvp-schema'
import { Invitation } from '@/types/invitation'

interface RSVPFormProps {
  invitation: Invitation
}

export function RSVPForm({ invitation }: RSVPFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      status: 'accepted',
      plusOne: false,
      plusOneName: '',
      plusOneEmail: '',
      dietaryRestrictions: '',
      notes: ''
    }
  })
  
  const { watch, setValue } = form
  const status = watch('status')
  const plusOne = watch('plusOne')
  
  async function onSubmit(values: RsvpFormValues) {
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/invitations/respond', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: invitation.token,
          ...values
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to submit RSVP')
      }
      
      setIsSuccess(true)
      
      // Redirect to success page
      window.location.href = `/rsvp/success?token=${invitation.token}`
    } catch (error) {
      console.error('Error submitting RSVP:', error)
      setIsSubmitting(false)
    }
  }
  
  if (isSuccess) {
    return (
      <div className="space-y-4 text-center py-8">
        <h2 className="text-2xl font-bold">Thank you for your response!</h2>
        <p>We're redirecting you to your confirmation page...</p>
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
      </div>
    )
  }
  
  return (
    <div className="bg-card border rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold mb-6">RSVP</h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Attendance Selection */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Will you attend?</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="accepted" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        Yes, I will attend
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="declined" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        No, I cannot attend
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Only show these fields if attending */}
          {status === 'accepted' && (
            <>
              {/* Plus One Toggle */}
              <FormField
                control={form.control}
                name="plusOne"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Bringing a guest?
                      </FormLabel>
                      <FormDescription>
                        Let us know if you will be bringing a plus one
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {/* Plus One Details (conditional) */}
              {plusOne && (
                <div className="space-y-4 rounded-lg border p-4">
                  <h3 className="font-medium">Guest Information</h3>
                  
                  <FormField
                    control={form.control}
                    name="plusOneName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guest name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="plusOneEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Guest Email (Optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter guest email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
              {/* Dietary Restrictions */}
              <FormField
                control={form.control}
                name="dietaryRestrictions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dietary Restrictions (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please list any dietary restrictions or allergies"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}
          
          {/* Notes Field */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
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
          
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit RSVP"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

## 3. API Implementation

### RSVP Response API

```typescript
// src/app/api/invitations/respond/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { rsvpSchema } from '@/lib/validations/rsvp-schema'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const body = await request.json()
    const { token, ...formData } = body
    
    // Validate form data
    const result = rsvpSchema.safeParse(formData)
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid form data', details: result.error.format() },
        { status: 400 }
      )
    }
    
    // Validate invitation token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, status, event_id')
      .eq('token', token)
      .single()
    
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      )
    }
    
    // Update invitation status
    await supabase
      .from('invitations')
      .update({
        status: result.data.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id)
    
    // Insert RSVP response
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvp_responses')
      .insert({
        invitation_id: invitation.id,
        status: result.data.status,
        plus_one: result.data.plusOne,
        dietary_restrictions: result.data.dietaryRestrictions,
        notes: result.data.notes,
        event_id: invitation.event_id
      })
      .select('id')
      .single()
    
    if (rsvpError) {
      return NextResponse.json(
        { error: 'Failed to save RSVP response' },
        { status: 500 }
      )
    }
    
    // Insert plus one data if applicable
    if (result.data.plusOne && result.data.plusOneName) {
      await supabase
        .from('plus_ones')
        .insert({
          rsvp_id: rsvp.id,
          name: result.data.plusOneName,
          email: result.data.plusOneEmail || null,
          event_id: invitation.event_id
        })
    }
    
    // Send confirmation email
    // [Email sending logic to be implemented]
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling RSVP submission:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Token Validation API

```typescript
// src/app/api/invitations/validate/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { token } = await request.json()
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }
    
    const { data, error } = await supabase
      .from('invitations')
      .select('id, status, expires_at')
      .eq('token', token)
      .single()
    
    if (error || !data) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 200 }
      )
    }
    
    // Check if invitation is expired
    const isExpired = data.expires_at && new Date(data.expires_at) < new Date()
    
    if (isExpired) {
      return NextResponse.json(
        { valid: false, error: 'Token expired' },
        { status: 200 }
      )
    }
    
    return NextResponse.json({ valid: true })
  } catch (error) {
    console.error('Error validating token:', error)
    return NextResponse.json(
      { valid: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## 4. Magic Link Authentication

### Magic Link Request

```typescript
// src/app/api/auth/magic-link/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { email, invitation_token, redirect_to } = await request.json()
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }
    
    // Generate magic link with invitation token in metadata
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirect_to || '/',
        data: {
          invitation_token: invitation_token || null
        }
      }
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error sending magic link:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Magic Link Hook

```typescript
// src/hooks/use-magic-link.ts
'use client'

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'

interface UseMagicLinkProps {
  invitationToken?: string
  redirectTo?: string
}

export function useMagicLink({ invitationToken, redirectTo }: UseMagicLinkProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  
  async function sendMagicLink(email: string) {
    if (!email) {
      toast({
        title: 'Error',
        description: 'Email is required',
        variant: 'destructive'
      })
      return
    }
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          invitation_token: invitationToken,
          redirect_to: redirectTo
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link')
      }
      
      setIsSuccess(true)
      toast({
        title: 'Success',
        description: 'Check your email for the magic link'
      })
    } catch (error) {
      console.error('Error sending magic link:', error)
      toast({
        title: 'Error',
        description: `Failed to send magic link: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return {
    sendMagicLink,
    isLoading,
    isSuccess
  }
}
```

## 5. Email Notifications

### Email Templates

```typescript
// src/lib/email/templates.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Create a Supabase client with the service role key for email operations
const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface RSVPEmailTemplateProps {
  name: string
  eventName: string
  eventDate: string
  status: 'accepted' | 'declined'
  plusOne: boolean
  plusOneName?: string
  dietaryRestrictions?: string
}

export async function sendRSVPConfirmationEmail({
  email,
  templateData
}: {
  email: string;
  templateData: RSVPEmailTemplateProps
}) {
  try {
    // Get the email template from Supabase
    const { data: template, error: templateError } = await supabase
      .from('email_templates')
      .select('id, subject, content')
      .eq('name', templateData.status === 'accepted' ? 'rsvp_accepted' : 'rsvp_declined')
      .single()
    
    if (templateError || !template) {
      throw new Error('Email template not found')
    }
    
    // Replace template variables
    let content = template.content
      .replace('{{name}}', templateData.name)
      .replace('{{eventName}}', templateData.eventName)
      .replace('{{eventDate}}', templateData.eventDate)
    
    // Add plus one information if applicable
    if (templateData.status === 'accepted') {
      if (templateData.plusOne && templateData.plusOneName) {
        content = content.replace('{{plusOne}}', `You're bringing ${templateData.plusOneName} as your guest.`)
      } else {
        content = content.replace('{{plusOne}}', "You're not bringing a guest.")
      }
      
      if (templateData.dietaryRestrictions) {
        content = content.replace('{{dietaryRestrictions}}', `Dietary Restrictions: ${templateData.dietaryRestrictions}`)
      } else {
        content = content.replace('{{dietaryRestrictions}}', "No dietary restrictions specified.")
      }
    }
    
    // Send the email using your email service (SendGrid, etc.)
    // [Email sending implementation]
    
    return { success: true }
  } catch (error) {
    console.error('Error sending RSVP confirmation email:', error)
    return { success: false, error }
  }
}
```

## 6. Testing Approach

### Unit Testing Form Validation

```typescript
// src/lib/validations/__tests__/rsvp-schema.test.ts
import { describe, it, expect } from 'vitest'
import { rsvpSchema } from '../rsvp-schema'

describe('RSVP Schema Validation', () => {
  it('should validate accepted RSVP with no plus one', () => {
    const result = rsvpSchema.safeParse({
      status: 'accepted',
      plusOne: false,
      dietaryRestrictions: '',
      notes: ''
    })
    
    expect(result.success).toBe(true)
  })
  
  it('should validate accepted RSVP with plus one', () => {
    const result = rsvpSchema.safeParse({
      status: 'accepted',
      plusOne: true,
      plusOneName: 'John Doe',
      plusOneEmail: 'john@example.com',
      dietaryRestrictions: 'Vegetarian',
      notes: ''
    })
    
    expect(result.success).toBe(true)
  })
  
  it('should fail when plus one is true but name is missing', () => {
    const result = rsvpSchema.safeParse({
      status: 'accepted',
      plusOne: true,
      plusOneName: '',
      dietaryRestrictions: '',
      notes: ''
    })
    
    expect(result.success).toBe(false)
  })
  
  it('should validate declined RSVP', () => {
    const result = rsvpSchema.safeParse({
      status: 'declined',
      plusOne: false,
      notes: 'Sorry, I can\'t make it'
    })
    
    expect(result.success).toBe(true)
  })
  
  it('should fail with invalid status', () => {
    const result = rsvpSchema.safeParse({
      status: 'maybe',
      plusOne: false,
      notes: ''
    })
    
    expect(result.success).toBe(false)
  })
  
  it('should fail with invalid email format', () => {
    const result = rsvpSchema.safeParse({
      status: 'accepted',
      plusOne: true,
      plusOneName: 'John Doe',
      plusOneEmail: 'invalid-email',
      notes: ''
    })
    
    expect(result.success).toBe(false)
  })
})
```

## 7. Database Schema Modifications

For this implementation, we need to ensure the following tables are properly created:

```sql
-- Create RSVP responses table
CREATE TABLE IF NOT EXISTS rsvp_responses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invitation_id UUID NOT NULL REFERENCES invitations(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('accepted', 'declined')),
  plus_one BOOLEAN NOT NULL DEFAULT false,
  dietary_restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create plus ones table
CREATE TABLE IF NOT EXISTS plus_ones (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  rsvp_id UUID NOT NULL REFERENCES rsvp_responses(id) ON DELETE CASCADE,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  dietary_restrictions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Add expires_at column to invitations table if not exists
ALTER TABLE invitations ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
```

## 8. Performance Considerations

1. **Lazy Loading Components**
   - Implement dynamic imports for non-critical components
   - Use Suspense boundaries for improved user experience

2. **Form Optimization**
   - Use debounced validation for better performance
   - Implement progressive form loading

3. **API Response Caching**
   - Cache invitation data where appropriate
   - Implement stale-while-revalidate pattern

4. **Image Optimization**
   - Ensure event images are optimized with Next.js Image component
   - Use responsive image sizing based on viewport

5. **Analytics and Tracking**
   - Implement minimal tracking for performance monitoring
   - Use client-side analytics for form conversion tracking 