# Session 34: Technical Resources

## 📚 Technical Resources for RSVP System & Invited User Flow

This document provides technical references, code snippets, and implementation examples for completing the RSVP system and invited user flow in Session 34.

## 🔑 Magic Link Authentication

### Implementation Pattern

```typescript
// src/lib/auth/magic-link.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from '@/components/ui/use-toast';

export async function sendMagicLink(email: string, redirectTo: string) {
  const supabase = createClientComponentClient();
  
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    });
    
    if (error) throw error;
    
    toast({
      title: 'Magic link sent',
      description: 'Check your email for a magic link to sign in.',
      variant: 'default',
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error sending magic link:', error);
    
    toast({
      title: 'Failed to send magic link',
      description: 'Please try again later.',
      variant: 'destructive',
    });
    
    return { success: false, error };
  }
}
```

### Usage Example

```tsx
// src/components/rsvp/magic-link-form.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sendMagicLink } from '@/lib/auth/magic-link';

export function MagicLinkForm({ invitationToken }: { invitationToken: string }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Include the invitation token in the redirect URL
      const redirectUrl = `${window.location.origin}/invitation/${invitationToken}/auth-callback`;
      await sendMagicLink(email, redirectUrl);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Sign in to access this event</CardTitle>
        <CardDescription>
          Enter your email to receive a magic link for secure access
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## 📷 Camera Integration

### Camera Access Hook

```typescript
// src/hooks/useCamera.ts
'use client'

import { useState, useEffect, useRef } from 'react';

interface UseCameraOptions {
  videoConstraints?: MediaTrackConstraints;
  onError?: (error: Error) => void;
}

export function useCamera({ 
  videoConstraints = { 
    facingMode: 'environment',
    width: { ideal: 1280 },
    height: { ideal: 720 }
  }, 
  onError 
}: UseCameraOptions = {}) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [error, setError] = useState<Error | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: false
      });
      
      setStream(mediaStream);
      setPermission('granted');
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      return mediaStream;
    } catch (err) {
      const error = err as Error;
      setError(error);
      setPermission('denied');
      
      if (onError) {
        onError(error);
      }
      
      return null;
    }
  };
  
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };
  
  const takePhoto = () => {
    if (!videoRef.current || !stream) return null;
    
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob for upload
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create photo blob'));
        }
      }, 'image/jpeg', 0.95);
    });
  };
  
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);
  
  return {
    videoRef,
    stream,
    permission,
    error,
    startCamera,
    stopCamera,
    takePhoto
  };
}
```

### Camera Component Example

```tsx
// src/components/camera/camera-capture.tsx
'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useCamera } from '@/hooks/useCamera';
import { Camera, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CameraCaptureProps {
  onCapture: (blob: Blob) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { videoRef, permission, error, startCamera, stopCamera, takePhoto } = useCamera();
  
  const handleStartCamera = async () => {
    await startCamera();
  };
  
  const handleCapture = async () => {
    const blob = await takePhoto();
    if (blob) {
      const imageUrl = URL.createObjectURL(blob);
      setCapturedImage(imageUrl);
      onCapture(blob);
    }
  };
  
  const handleRetake = () => {
    if (capturedImage) {
      URL.revokeObjectURL(capturedImage);
      setCapturedImage(null);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-0 relative">
        {permission === 'prompt' && (
          <div className="p-6 flex flex-col items-center">
            <Button onClick={handleStartCamera}>
              <Camera className="mr-2 h-4 w-4" />
              Access Camera
            </Button>
          </div>
        )}
        
        {permission === 'denied' && (
          <div className="p-6 text-center">
            <p className="text-red-500 mb-4">Camera access denied</p>
            <p className="text-sm text-muted-foreground">
              Please enable camera access in your browser settings.
            </p>
          </div>
        )}
        
        {permission === 'granted' && !capturedImage && (
          <div className="relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full aspect-[4/3] object-cover rounded-md"
            />
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
              <Button variant="outline" size="icon" onClick={onCancel}>
                <X className="h-5 w-5" />
              </Button>
              <Button variant="default" size="icon" onClick={handleCapture}>
                <Camera className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
        
        {capturedImage && (
          <div className="relative">
            <div className="relative w-full aspect-[4/3]">
              <Image
                src={capturedImage}
                alt="Captured"
                fill
                className="object-cover rounded-md"
              />
            </div>
            <div className="absolute bottom-4 inset-x-0 flex justify-center gap-4">
              <Button variant="outline" size="icon" onClick={handleRetake}>
                <Camera className="h-5 w-5" />
              </Button>
              <Button variant="default" size="icon" onClick={() => onCapture(new Blob())}>
                <ImageIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

## 📝 RSVP Form

### RSVP Schema

```typescript
// src/lib/validations/rsvp.schema.ts
import { z } from 'zod';

export const rsvpFormSchema = z.object({
  status: z.enum(['accepted', 'declined', 'pending']),
  guestCount: z.number().min(1).max(10),
  plusOne: z.boolean().default(false),
  plusOneName: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  notes: z.string().optional()
});

export type RsvpFormValues = z.infer<typeof rsvpFormSchema>;
```

### RSVP Form Component

```tsx
// src/components/rsvp/rsvp-form.tsx
'use client'

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { rsvpFormSchema, RsvpFormValues } from '@/lib/validations/rsvp.schema';

interface RsvpFormProps {
  invitationToken: string;
  eventName: string;
  eventDate: string;
  onSubmit: (values: RsvpFormValues & { token: string }) => Promise<void>;
}

export function RsvpForm({ invitationToken, eventName, eventDate, onSubmit }: RsvpFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<RsvpFormValues>({
    resolver: zodResolver(rsvpFormSchema),
    defaultValues: {
      status: 'pending',
      guestCount: 1,
      plusOne: false,
      dietaryRestrictions: '',
      notes: ''
    }
  });
  
  const handleSubmit = async (values: RsvpFormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        ...values,
        token: invitationToken
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const showPlusOneField = form.watch('plusOne');
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{eventName}</h2>
          <p className="text-muted-foreground">{eventDate}</p>
        </div>
        
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
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="pending" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      I'm not sure yet
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {form.watch('status') === 'accepted' && (
          <>
            <FormField
              control={form.control}
              name="plusOne"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Bringing a plus one?
                    </FormLabel>
                    <FormDescription>
                      Let us know if you'll be bringing a guest
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
            
            {showPlusOneField && (
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
            
            <FormField
              control={form.control}
              name="dietaryRestrictions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dietary Restrictions</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please let us know if you have any dietary restrictions"
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
        
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit RSVP'}
        </Button>
      </form>
    </Form>
  );
}
```

## 📊 Analytics Integration

### RSVP Analytics Utils

```typescript
// src/lib/analytics/rsvp-analytics.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function getRsvpAnalytics(eventId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: invitations, error: invitationsError } = await supabase
    .from('invitations')
    .select('id, email, sent_at, status')
    .eq('event_id', eventId);
    
  if (invitationsError) {
    console.error('Error fetching invitations:', invitationsError);
    return null;
  }
  
  const { data: rsvps, error: rsvpsError } = await supabase
    .from('rsvps')
    .select('invitation_id, status, guest_count, created_at')
    .eq('event_id', eventId);
    
  if (rsvpsError) {
    console.error('Error fetching RSVPs:', rsvpsError);
    return null;
  }
  
  // Calculate metrics
  const totalInvitations = invitations.length;
  const pendingRsvps = rsvps.filter(rsvp => rsvp.status === 'pending').length;
  const acceptedRsvps = rsvps.filter(rsvp => rsvp.status === 'accepted').length;
  const declinedRsvps = rsvps.filter(rsvp => rsvp.status === 'declined').length;
  
  const totalGuests = rsvps
    .filter(rsvp => rsvp.status === 'accepted')
    .reduce((total, rsvp) => total + rsvp.guest_count, 0);
    
  const responseRate = totalInvitations > 0 
    ? ((acceptedRsvps + declinedRsvps) / totalInvitations) * 100 
    : 0;
    
  const acceptanceRate = (acceptedRsvps + declinedRsvps) > 0 
    ? (acceptedRsvps / (acceptedRsvps + declinedRsvps)) * 100 
    : 0;
  
  return {
    totalInvitations,
    acceptedRsvps,
    declinedRsvps,
    pendingRsvps,
    totalGuests,
    responseRate,
    acceptanceRate,
    rsvpTimeline: rsvps.map(rsvp => ({
      date: rsvp.created_at,
      status: rsvp.status
    }))
  };
}
```

### Analytics Dashboard Component

```tsx
// src/components/analytics/rsvp-analytics-dashboard.tsx
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AreaChart } from '@/components/charts/area-chart';
import { PieChart } from '@/components/charts/pie-chart';

interface RsvpAnalyticsProps {
  eventId: string;
  analytics: {
    totalInvitations: number;
    acceptedRsvps: number;
    declinedRsvps: number;
    pendingRsvps: number;
    totalGuests: number;
    responseRate: number;
    acceptanceRate: number;
    rsvpTimeline: Array<{
      date: string;
      status: string;
    }>;
  };
}

export function RsvpAnalyticsDashboard({ eventId, analytics }: RsvpAnalyticsProps) {
  const pieChartData = [
    { name: 'Accepted', value: analytics.acceptedRsvps },
    { name: 'Declined', value: analytics.declinedRsvps },
    { name: 'Pending', value: analytics.pendingRsvps }
  ];
  
  // Process timeline data for chart
  const timelineData = analytics.rsvpTimeline.reduce((acc, { date, status }) => {
    const day = new Date(date).toLocaleDateString();
    const existingDay = acc.find(d => d.date === day);
    
    if (existingDay) {
      existingDay[status] = (existingDay[status] || 0) + 1;
    } else {
      acc.push({
        date: day,
        [status]: 1
      });
    }
    
    return acc;
  }, [] as Array<{ date: string; accepted?: number; declined?: number; pending?: number; }>);
  
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Invitations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInvitations}</div>
            <p className="text-xs text-muted-foreground">
              Invitations sent
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.responseRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of invitations responded to
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Acceptance Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.acceptanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Of responses are acceptances
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Guests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalGuests}</div>
            <p className="text-xs text-muted-foreground">
              Including plus ones
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>RSVP Status</CardTitle>
              <CardDescription>
                Distribution of RSVP responses
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <PieChart
                data={pieChartData}
                colors={['#16a34a', '#dc2626', '#64748b']}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Timeline</CardTitle>
              <CardDescription>
                RSVP responses over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <AreaChart
                data={timelineData}
                dataKeys={['accepted', 'declined', 'pending']}
                colors={['#16a34a', '#dc2626', '#64748b']}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

## 📧 API Endpoints

### RSVP Submission Endpoint

```typescript
// src/app/api/rsvp/submit/route.ts
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { rsvpFormSchema } from '@/lib/validations/rsvp.schema';

export async function POST(req: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const body = await req.json();
    const { token, ...rsvpData } = body;
    
    // Validate form data
    const validatedData = rsvpFormSchema.parse(rsvpData);
    
    // Get invitation by token
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, event_id')
      .eq('token', token)
      .single();
      
    if (invitationError || !invitation) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }
    
    // Check if RSVP already exists
    const { data: existingRsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('invitation_id', invitation.id)
      .single();
      
    // Determine if we should insert or update
    const operation = existingRsvp ? 'update' : 'insert';
    
    // Prepare RSVP data
    const rsvpRecord = {
      invitation_id: invitation.id,
      event_id: invitation.event_id,
      status: validatedData.status,
      guest_count: validatedData.plusOne ? 2 : 1,
      dietary_restrictions: validatedData.dietaryRestrictions || null,
      notes: validatedData.notes || null,
      plus_one_name: validatedData.plusOne ? validatedData.plusOneName : null
    };
    
    if (operation === 'insert') {
      const { error } = await supabase
        .from('rsvps')
        .insert(rsvpRecord);
        
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('rsvps')
        .update(rsvpRecord)
        .eq('id', existingRsvp.id);
        
      if (error) throw error;
    }
    
    // Update invitation status
    await supabase
      .from('invitations')
      .update({ status: validatedData.status })
      .eq('id', invitation.id);
    
    return NextResponse.json({ success: true, status: validatedData.status });
  } catch (error) {
    console.error('RSVP submission error:', error);
    
    return NextResponse.json(
      { error: 'Failed to process RSVP' },
      { status: 500 }
    );
  }
}
```

## 🔄 End-to-End Flow Example

### Invitation Page

```tsx
// src/app/invitation/[token]/page.tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { RsvpForm } from '@/components/rsvp/rsvp-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';

interface InvitationPageProps {
  params: {
    token: string;
  };
}

async function getInvitationDetails(token: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: invitation, error } = await supabase
    .from('invitations')
    .select(`
      id,
      email,
      status,
      events (
        id,
        name,
        date,
        location,
        description,
        cover_image_url
      )
    `)
    .eq('token', token)
    .single();
    
  if (error || !invitation) {
    return null;
  }
  
  return invitation;
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { token } = params;
  const invitation = await getInvitationDetails(token);
  
  if (!invitation) {
    notFound();
  }
  
  const event = invitation.events;
  const formattedDate = format(new Date(event.date), 'EEEE, MMMM d, yyyy');
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">You're Invited!</h1>
          <p className="text-muted-foreground mt-2">
            Please respond to your invitation below
          </p>
        </div>
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{event.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video relative mb-6 rounded-md overflow-hidden">
              {event.cover_image_url ? (
                <img
                  src={event.cover_image_url}
                  alt={event.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <p className="text-muted-foreground">No image available</p>
                </div>
              )}
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Date</h3>
                  <p>{formattedDate}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-muted-foreground">Location</h3>
                  <p>{event.location}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground">About</h3>
                <p>{event.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <RsvpForm
              invitationToken={token}
              eventName={event.name}
              eventDate={formattedDate}
              onSubmit={async (values) => {
                'use server';
                
                const response = await fetch('/api/rsvp/submit', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify(values),
                });
                
                if (!response.ok) {
                  throw new Error('Failed to submit RSVP');
                }
                
                const result = await response.json();
                
                // Redirect based on status
                if (result.status === 'accepted') {
                  redirect(`/invitation/${token}/confirmation/accepted`);
                } else if (result.status === 'declined') {
                  redirect(`/invitation/${token}/confirmation/declined`);
                } else {
                  redirect(`/invitation/${token}/confirmation/pending`);
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

## 📱 Testing Utilities

### Test Invitation Generator

```typescript
// src/lib/test-utils/invitation-generator.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { nanoid } from 'nanoid';

interface GenerateTestInvitationOptions {
  eventId: string;
  email: string;
  expireInDays?: number;
}

export async function generateTestInvitation({
  eventId,
  email,
  expireInDays = 30
}: GenerateTestInvitationOptions) {
  const supabase = createClientComponentClient();
  
  // Generate token
  const token = nanoid(16);
  
  // Calculate expiration date
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(now.getDate() + expireInDays);
  
  // Create invitation record
  const { data, error } = await supabase
    .from('invitations')
    .insert({
      event_id: eventId,
      email,
      token,
      status: 'pending',
      expires_at: expiresAt.toISOString(),
      is_test: true
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating test invitation:', error);
    throw error;
  }
  
  // Generate URL
  const invitationUrl = `${window.location.origin}/invitation/${token}`;
  
  return {
    invitation: data,
    token,
    invitationUrl
  };
}
```

## 📦 Database Migrations

### RSVP Table Migration

```sql
-- in supabase/migrations/[timestamp]_create_rsvps_table.sql
create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  status text not null check (status in ('accepted', 'declined', 'pending')),
  guest_count integer not null default 1,
  plus_one_name text,
  dietary_restrictions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add RLS policies
alter table public.rsvps enable row level security;

-- Event organizers can view all RSVPs for their events
create policy "Event organizers can view all RSVPs for their events"
on public.rsvps for select
to authenticated
using (
  exists (
    select 1 from public.events
    where events.id = rsvps.event_id
    and events.created_by = auth.uid()
  )
);

-- Users can view their own RSVPs
create policy "Users can view their own RSVPs"
on public.rsvps for select
to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = rsvps.invitation_id
    and invitations.email = auth.email()
  )
);

-- Users can update their own RSVPs
create policy "Users can update their own RSVPs"
on public.rsvps for update
to authenticated
using (
  exists (
    select 1 from public.invitations
    where invitations.id = rsvps.invitation_id
    and invitations.email = auth.email()
  )
);

-- Service role can manage all RSVPs
create policy "Service role can manage all RSVPs"
on public.rsvps for all
to service_role
using (true)
with check (true);

-- Add indexes for performance
create index idx_rsvp_invitation_id on public.rsvps(invitation_id);
create index idx_rsvp_event_id on public.rsvps(event_id);
create index idx_rsvp_status on public.rsvps(status);
``` 