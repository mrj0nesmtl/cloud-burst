# Session 36 Resources: Public Invitation & RSVP Form Implementation

## 📁 Directory Structures

### Invitation Directory Structure
```
./src/app/invitation/
├── [token]/
│   ├── confirmation/
│   │   ├── accepted/
│   │   │   └── page.tsx
│   │   └── declined/
│   │       └── page.tsx
│   ├── details/
│   │   └── page.tsx
│   ├── page.tsx
│   ├── rsvp-details.tsx
│   └── rsvp-form.tsx
├── expired/
│   └── page.tsx
└── page.tsx
```

### Relevant API Routes
```
./src/app/api/
├── invitation/
│   └── lookup/
│       └── route.ts
├── invitations/
│   ├── [token]/
│   │   └── validate/
│   │       └── route.ts
│   ├── bulk-create/
│   │   └── route.ts
│   ├── create/
│   │   └── route.ts
│   ├── validate/
│   │   └── route.ts
│   └── verify/
│       └── route.ts
└── rsvp/
    ├── status/
    │   └── route.ts
    └── submit/
        └── route.ts
```

### QR Scanner Components
```
./src/components/invitation/
├── qr-scanner.tsx
└── scanner-overlay.tsx
```

## 📊 Data Schema

### Invitation Schema
```typescript
// Database schema for invitations
interface Invitation {
  id: string;              // UUID primary key
  event_id: string;        // Foreign key to events table
  email: string;           // Guest email address
  name: string;            // Guest name
  token: string;           // Unique invitation token
  status: string;          // 'sent', 'opened', 'accepted', 'declined'
  plus_one_allowed: boolean; // Whether guest can bring a plus one
  created_at: string;      // Creation timestamp
  sent_at: string | null;  // When invitation was sent
  opened_at: string | null; // When invitation was opened
  responded_at: string | null; // When guest responded
}

// Database schema for RSVPs
interface RSVP {
  id: string;               // UUID primary key
  invitation_id: string;    // Foreign key to invitations table
  status: 'pending' | 'accepted' | 'declined'; // RSVP status
  guest_count: number;      // Number of guests (1 or 2 with plus one)
  dietary_restrictions: string | null; // Dietary restrictions text
  notes: string | null;     // Additional notes from guest
  created_at: string;       // Creation timestamp
  updated_at: string;       // Last update timestamp
}
```

### Zod Validation Schema
```typescript
import { z } from 'zod';

// Validation schema for RSVP form
export const rsvpFormSchema = z.object({
  status: z.enum(['accepted', 'declined']),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;

// Validation schema for invitation token
export const invitationTokenSchema = z.object({
  token: z.string().uuid(),
});
```

## 🧩 Component Structure

### Invitation Page Component
```typescript
// src/app/invitation/[token]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { validateInvitationToken } from '@/lib/supabase/invitations';
import RsvpDetails from './rsvp-details';
import RsvpForm from './rsvp-form';

export default async function InvitationPage({ params }: { params: { token: string } }) {
  const { token } = params;
  
  // Server-side token validation
  const invitation = await validateInvitationToken(token);
  
  if (!invitation) {
    notFound();
  }
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <Suspense fallback={<InvitationSkeleton />}>
        <RsvpDetails invitation={invitation} />
        <RsvpForm invitation={invitation} />
      </Suspense>
    </div>
  );
}
```

### RSVP Form Component
```typescript
// src/app/invitation/[token]/rsvp-form.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { rsvpFormSchema, type RsvpFormValues } from '@/lib/validations/rsvp';

export default function RsvpForm({ invitation }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      status: 'accepted',
      plusOne: false,
      plusOneName: '',
      dietaryRestrictions: '',
      notes: '',
    },
  });
  
  const handleSubmit = async (values: RsvpFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Submit to API
      const response = await fetch('/api/rsvp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: invitation.token,
          ...values,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit RSVP');
      }
      
      // Redirect to confirmation page
      router.push(`/invitation/${invitation.token}/confirmation/${values.status}`);
    } catch (error) {
      console.error('Error submitting RSVP:', error);
      // Handle error
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Form fields */}
      </form>
    </Form>
  );
}
```

## 🔌 API Endpoints

### Token Validation Endpoint
```typescript
// src/app/api/invitations/[token]/validate/route.ts
import { NextResponse } from 'next/server';
import { getInvitationByToken } from '@/lib/supabase/invitations';

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const { token } = params;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }
    
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Update invitation status to 'opened' if not already responded
    if (invitation.status === 'sent') {
      await updateInvitationStatus(token, 'opened');
    }
    
    return NextResponse.json({
      invitation: {
        id: invitation.id,
        eventId: invitation.event_id,
        name: invitation.name,
        email: invitation.email,
        status: invitation.status,
        plusOneAllowed: invitation.plus_one_allowed,
      },
    });
  } catch (error) {
    console.error('Error validating invitation token:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### RSVP Submission Endpoint
```typescript
// src/app/api/rsvp/submit/route.ts
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createRsvp, updateInvitationStatus } from '@/lib/supabase/invitations';

const rsvpSubmissionSchema = z.object({
  token: z.string().uuid(),
  status: z.enum(['accepted', 'declined']),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional().nullable(),
  dietaryRestrictions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = rsvpSubmissionSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid request data', issues: result.error.issues },
        { status: 400 }
      );
    }
    
    const { token, status, plusOne, plusOneName, dietaryRestrictions, notes } = result.data;
    
    // Validate invitation token
    const invitation = await getInvitationByToken(token);
    
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 404 }
      );
    }
    
    // Create or update RSVP record
    const rsvp = await createRsvp({
      invitation_id: invitation.id,
      status,
      guest_count: plusOne ? 2 : 1,
      dietary_restrictions: dietaryRestrictions || null,
      notes: notes || null,
    });
    
    // Update invitation status
    await updateInvitationStatus(token, status);
    
    // Send confirmation email
    await sendRsvpConfirmationEmail({
      email: invitation.email,
      name: invitation.name,
      status,
      eventId: invitation.event_id,
    });
    
    return NextResponse.json({ success: true, rsvp });
  } catch (error) {
    console.error('Error submitting RSVP:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🎨 UI Components

### RSVP Form Fields
```tsx
// RSVP Attendance Selection
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

// Plus One Toggle
{invitation.plus_one_allowed && (
  <FormField
    control={form.control}
    name="plusOne"
    render={({ field }) => (
      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <FormLabel className="text-base">Bringing a guest?</FormLabel>
          <FormDescription>
            You may bring one guest to this event
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
)}

// Conditional Plus One Name Field
{form.watch('plusOne') && (
  <FormField
    control={form.control}
    name="plusOneName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Guest's Name</FormLabel>
        <FormControl>
          <Input placeholder="Enter your guest's name" {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
)}

// Dietary Restrictions Field
<FormField
  control={form.control}
  name="dietaryRestrictions"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Dietary Restrictions</FormLabel>
      <FormControl>
        <Textarea
          placeholder="Please let us know of any dietary restrictions or allergies"
          className="resize-none"
          {...field}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Notes Field
<FormField
  control={form.control}
  name="notes"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Additional Notes</FormLabel>
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

// Submit Button
<Button type="submit" className="w-full" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Submitting...
    </>
  ) : (
    'Submit RSVP'
  )}
</Button>
```

### Event Details Component
```tsx
// src/app/invitation/[token]/rsvp-details.tsx
'use client';

import Image from 'next/image';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDate, formatTime } from '@/lib/utils';

export default function RsvpDetails({ invitation, event }) {
  return (
    <div className="space-y-6">
      {/* Event Hero */}
      <div className="relative h-64 w-full overflow-hidden rounded-xl bg-gradient-to-b from-black/70 to-black/30">
        {event.cover_image && (
          <Image
            src={event.cover_image}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
          <h1 className="text-3xl font-bold text-white mb-1">
            {event.title}
          </h1>
          <p className="text-white/80">
            You're invited by {event.host_name}
          </p>
        </div>
      </div>

      {/* Event Details Card */}
      <Card>
        <CardHeader>
          <CardTitle>Event Details</CardTitle>
          <CardDescription>
            Important information about the event
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Date</p>
              <p className="text-muted-foreground">
                {formatDate(event.start_date)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Time</p>
              <p className="text-muted-foreground">
                {formatTime(event.start_time)} - {formatTime(event.end_time)}
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Location</p>
              <p className="text-muted-foreground">
                {event.location_name}
              </p>
              <p className="text-sm text-muted-foreground">
                {event.location_address}
              </p>
            </div>
          </div>
          
          {event.description && (
            <div className="pt-2 border-t">
              <p className="text-sm whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 🧪 Testing Strategies

### 1. Unit Testing
- Test form validation logic
- Test API endpoint handling
- Test token validation
- Test component rendering

### 2. Integration Testing
- Test complete RSVP flow end-to-end
- Test different form submission scenarios
- Test error handling and recovery
- Test confirmation emails

### 3. Device Testing
- Test on various mobile devices
- Test on desktop browsers
- Test with different connection speeds
- Test with and without camera access

## 🔗 References

1. [React Hook Form Documentation](https://react-hook-form.com/get-started)
2. [Zod Validation Library](https://zod.dev/)
3. [Next.js Server Components Documentation](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
4. [TanStack Form Documentation](https://tanstack.com/form/latest)
5. [Supabase Authentication Docs](https://supabase.com/docs/guides/auth)
6. [Shadcn/ui Form Components](https://ui.shadcn.com/docs/components/form) 