# Session 37 Resources: RSVP System Implementation

This document provides information about relevant project structures, directories, and references to help implement the public-facing RSVP system in Session 37.

## 📁 Project Structure

### Relevant Directories

```
src/
├── app/
│   ├── api/
│   │   ├── invitations/
│   │   │   ├── [token]/
│   │   │   │   └── route.ts                 # Token validation API
│   │   │   ├── respond/
│   │   │   │   └── route.ts                 # RSVP submission API
│   │   │   └── status/
│   │   │       └── route.ts                 # RSVP status check API
│   ├── invitation/
│   │   └── [token]/
│   │       └── page.tsx                     # Public invitation landing page
│   │       └── layout.tsx                   # Invitation page layout
│   │       └── loading.tsx                  # Loading state
│   │       └── error.tsx                    # Error state
│   │       └── not-found.tsx                # Invalid token handling
├── components/
│   ├── invitations/
│   │   ├── rsvp-form.tsx                    # RSVP form component
│   │   ├── invitation-details.tsx           # Invitation details display
│   │   ├── response-confirmation.tsx        # Confirmation component
│   │   ├── plus-one-form.tsx                # Plus-one guest form
│   │   └── dietary-preferences.tsx          # Dietary preferences form
│   ├── auth/
│   │   └── magic-link-auth.tsx              # Magic link authentication
├── lib/
│   ├── invitations/
│   │   ├── token.ts                         # Token validation utilities
│   │   ├── types.ts                         # Invitation type definitions
│   │   ├── schema.ts                        # Zod validation schemas
│   │   └── utils.ts                         # Invitation utilities
│   ├── email/
│   │   ├── templates/
│   │   │   └── rsvp-confirmation.ts         # RSVP confirmation email
│   ├── supabase/
│   │   ├── invitations.server.ts            # Server-side invitation functions
│   │   └── auth.server.ts                   # Server-side auth functions
├── hooks/
│   ├── use-invitation.ts                    # Invitation data hook
│   ├── use-rsvp-form.ts                     # RSVP form hook
│   └── use-magic-link.ts                    # Magic link hook
```

## 💾 Database Schema

### Invitations Table

```sql
create table invitations (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  email text not null,
  name text not null,
  token text unique not null,
  status text not null default 'pending',
  plus_one_allowed boolean not null default false,
  plus_one_name text,
  plus_one_email text,
  dietary_restrictions text,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  sent_at timestamp with time zone,
  responded_at timestamp with time zone
);

-- Policies
create policy "Invitations are viewable by the invited user" 
on invitations for select using (
  auth.jwt() ->> 'email' = email or 
  auth.jwt() ->> 'email' = plus_one_email
);

create policy "Invitations are viewable by the event owner" 
on invitations for select using (
  event_id in (
    select id from events where organizer_id = auth.uid()
  )
);

create policy "Invitations can be updated by the invited user" 
on invitations for update using (
  auth.jwt() ->> 'email' = email or 
  auth.jwt() ->> 'email' = plus_one_email
);
```

## 🧩 Component Examples

### Invitation Token Validation

```typescript
// src/lib/invitations/token.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { cache } from 'react'

export const validateInvitationToken = cache(async (token: string) => {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  const { data, error } = await supabase
    .from('invitations')
    .select(`
      id,
      event_id,
      email,
      name,
      token,
      status,
      plus_one_allowed,
      plus_one_name,
      plus_one_email,
      dietary_restrictions,
      notes,
      created_at,
      updated_at,
      sent_at,
      responded_at,
      events (
        id,
        name,
        description,
        date,
        location,
        cover_image_url,
        logo_url,
        organizer_id,
        profiles (
          id,
          full_name,
          avatar_url
        )
      )
    `)
    .eq('token', token)
    .single()
  
  if (error || !data) {
    return { invitation: null, error: error?.message || 'Invitation not found' }
  }
  
  return { invitation: data, error: null }
})
```

### RSVP Form Component

```typescript
// src/components/invitations/rsvp-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Invitation } from '@/lib/invitations/types'

const rsvpSchema = z.object({
  status: z.enum(['accepted', 'declined']),
  hasPlusOne: z.boolean().optional(),
  plusOneName: z.string().optional().refine(
    (val) => !val || val.trim().length > 0,
    { message: 'Plus one name cannot be empty if provided' }
  ),
  plusOneEmail: z.string().email().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional(),
})

type RsvpFormValues = z.infer<typeof rsvpSchema>

interface RsvpFormProps {
  invitation: Invitation
  onSubmit: (values: RsvpFormValues) => Promise<void>
}

export function RsvpForm({ invitation, onSubmit }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      status: 'accepted',
      hasPlusOne: false,
      plusOneName: invitation.plus_one_name || '',
      plusOneEmail: invitation.plus_one_email || '',
      dietaryRestrictions: invitation.dietary_restrictions || '',
      notes: invitation.notes || '',
    },
  })
  
  const handleSubmit = async (values: RsvpFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } catch (error) {
      console.error('Error submitting RSVP:', error)
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const showPlusOneFields = form.watch('status') === 'accepted' && 
                           form.watch('hasPlusOne') && 
                           invitation.plus_one_allowed
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
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
                      Yes, I'll be there
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="declined" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      No, I can't make it
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch('status') === 'accepted' && invitation.plus_one_allowed && (
          <FormField
            control={form.control}
            name="hasPlusOne"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Bringing a guest?
                  </FormLabel>
                  <div className="text-sm text-muted-foreground">
                    You may bring one guest with you
                  </div>
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
        )}
        
        {showPlusOneFields && (
          <div className="space-y-4 rounded-md border border-input p-4">
            <h3 className="font-medium">Guest Information</h3>
            <FormField
              control={form.control}
              name="plusOneName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guest Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Guest's full name" {...field} />
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
                  <FormLabel>Guest Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="guest@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        
        {form.watch('status') === 'accepted' && (
          <FormField
            control={form.control}
            name="dietaryRestrictions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dietary Restrictions</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Please let us know about any dietary restrictions"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information you'd like to share"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Submitting..." : "Submit RSVP"}
        </Button>
      </form>
    </Form>
  )
}
```

## 📧 Email Template Integration

### RSVP Confirmation Email

```typescript
// src/lib/email/templates/rsvp-confirmation.ts
import { Invitation } from '@/lib/invitations/types'

export function generateRsvpConfirmationEmail(invitation: Invitation) {
  const eventName = invitation.events.name
  const eventDate = new Date(invitation.events.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const eventLocation = invitation.events.location
  const hostName = invitation.events.profiles.full_name
  
  return {
    to: invitation.email,
    subject: `Your RSVP for ${eventName} has been confirmed`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Thank you for your RSVP!</h1>
        <p>Your response to ${eventName} has been confirmed.</p>
        
        <div style="margin: 24px 0; padding: 16px; border-radius: 8px; background-color: #f8f9fa;">
          <h2 style="margin-top: 0;">${eventName}</h2>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${eventLocation}</p>
          <p><strong>Host:</strong> ${hostName}</p>
        </div>
        
        <p>We look forward to seeing you there!</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
          <p>If you need to update your RSVP, please contact the event organizer.</p>
        </div>
      </div>
    `,
  }
}
```

## 🔒 Authentication Integration

### Magic Link Authentication

```typescript
// src/app/api/auth/magic-link/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const magicLinkSchema = z.object({
  email: z.string().email(),
  invitationToken: z.string().optional(),
  redirectUrl: z.string().url(),
})

export async function POST(request: Request) {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
  
  try {
    const body = await request.json()
    const { email, invitationToken, redirectUrl } = magicLinkSchema.parse(body)
    
    // If invitation token is provided, verify it
    if (invitationToken) {
      const { data: invitation, error } = await supabase
        .from('invitations')
        .select('id, email, token')
        .eq('token', invitationToken)
        .single()
      
      if (error || !invitation) {
        return NextResponse.json(
          { error: 'Invalid invitation token' },
          { status: 400 }
        )
      }
      
      // Check if email matches invitation
      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Email does not match invitation' },
          { status: 400 }
        )
      }
    }
    
    // Create magic link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${redirectUrl}${invitationToken ? `?token=${invitationToken}` : ''}`,
      },
    })
    
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { success: true, message: 'Magic link sent' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Magic link error:', error)
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    )
  }
}
```

## 📊 Analytics Integration

```typescript
// src/lib/analytics/invitation.ts
export async function trackRsvpResponse(invitationId: string, status: string) {
  try {
    await fetch('/api/analytics/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invitationId,
        status,
        timestamp: new Date().toISOString(),
      }),
    })
  } catch (error) {
    console.error('Error tracking RSVP response:', error)
  }
}
```

## 📑 Documentation References

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Supabase Auth Helpers Documentation](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Next.js Server Components Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Shadcn UI Form Components](https://ui.shadcn.com/docs/components/form)
- [SendGrid API Documentation](https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api)
- [Cloud Burst Invitation System Design Document](/docs/development/invitation_system_design.md)
- [Cloud Burst Email Template System Documentation](/docs/development/email_template_system.md) 