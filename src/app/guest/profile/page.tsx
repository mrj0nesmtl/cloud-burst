'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Loader2, ArrowLeft, User2Icon, Camera, AlertCircle, Upload, Trash2, Lightbulb } from 'lucide-react'
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
import { toast as sonnerToast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'
import { invitationTokenService } from '@/lib/tokens/invitation-token'
import { useToken } from '@/contexts/token-context'
import { TokenErrorAlert } from '@/components/guest/token-error'
import Link from 'next/link'
import crypto from 'crypto'

const guestProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  notes: z.string().optional(),
  avatar_url: z.string().optional(),
})

type GuestProfileFormValues = z.infer<typeof guestProfileSchema>

// Add these interface extensions at the top of the file after imports
interface ExtendedMediaTrackCapabilities extends MediaTrackCapabilities {
  torch?: boolean;
}

interface TorchConstraintSet extends MediaTrackConstraintSet {
  torch?: boolean;
}

interface ProfileData {
  name: string;
  email: string;
  phone?: string | null;
  notes?: string | null;
  avatar_url?: string | null;
  invitation_id: string;
  updated_at: string;
  created_at?: string;
}

export default function GuestProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  
  // Get token from context
  const { token: invitationToken, tokenData, isLoading: tokenLoading, error: tokenError } = useToken()
  
  const eventId = searchParams.get('event')
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [guest, setGuest] = useState<any>(null)
  const [event, setEvent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<string>('profile')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null)
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [flashlightActive, setFlashlightActive] = useState(false)
  const [testPhotos, setTestPhotos] = useState<string[]>([])
  const [isTakingPhoto, setIsTakingPhoto] = useState(false)
  
  const supabase = createClientComponentClient()

  const form = useForm<GuestProfileFormValues>({
    resolver: zodResolver(guestProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      notes: '',
      avatar_url: '',
    },
  })

  // Function to get guest data by invitation token
  const getGuestDataByToken = async (token: string) => {
    try {
      // Get invitation by token
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, email, event_id, name')
        .eq('token', token)
        .single()

      if (invitationError || !invitation) {
        console.error('Invalid invitation token or invitation not found', invitationError)
        setError('Invalid invitation token or invitation not found')
        setIsLoading(false)
        return null
      }
      
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, date, location')
        .eq('id', invitation.event_id)
        .single()
        
      if (eventError) {
        console.error('Error fetching event:', eventError)
      } else {
        setEvent(eventData)
      }
      
      // Get guest profile if exists
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_id', invitation.id)
        .maybeSingle()
      
      if (guestError) {
        console.error('Error fetching guest:', guestError)
      }
      
      // For RSVP data
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .eq('invitation_id', invitation.id)
        .maybeSingle()
        
      if (rsvpError) {
        console.error('Error fetching RSVP:', rsvpError)
      }
        
      // Populate form with existing data or defaults - using multiple sources in priority order
      const guestName = guestData?.name || invitation.name || rsvpData?.guest_name || ''
      const guestEmail = guestData?.email || invitation.email || rsvpData?.guest_email || ''
      const guestPhone = guestData?.phone || rsvpData?.guest_phone || ''
      const guestNotes = guestData?.notes || rsvpData?.guest_notes || ''
      const guestAvatar = guestData?.avatar_url || null
      
      if (guestAvatar) {
        setAvatarUrl(guestAvatar)
      }
      
      form.reset({
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        notes: guestNotes,
        avatar_url: guestAvatar || '',
      })
      
      setGuest(guestData || { invitation_id: invitation.id })
      
      return { invitation, guest: guestData, event: eventData }
    } catch (error) {
      console.error('Error fetching guest data by token:', error)
      setError('Failed to load your profile data')
      return null
    }
  }
  
  // Function to get guest data by event ID
  const getGuestDataByEventId = async (eventId: string) => {
    try {
      // Get invitation for this event directly
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('id, email, event_id, name, token')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (invitationError || !invitation) {
        setError('Unable to find an invitation for this event. Please check the event ID or get a new invitation.')
        setIsLoading(false)
        return null
      }
      
      // Store the token for future use
      if (invitation.token) {
        invitationTokenService.storeToken(invitation.token)
      }
      
      // Get event details
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('id, name, date, location')
        .eq('id', invitation.event_id)
        .single()
        
      if (eventError) {
        console.error('Error fetching event:', eventError)
      } else {
        setEvent(eventData)
      }
      
      // Now check if there's an RSVP for this invitation
      const { data: rsvp, error: rsvpError } = await supabase
        .from('rsvps')
        .select('id, status, guest_name, guest_email, guest_phone, guest_notes')
        .eq('invitation_id', invitation.id)
        .eq('status', 'accepted')
        .maybeSingle()
        
      if (rsvpError) {
        console.error('Error fetching RSVP:', rsvpError)
        // Continue anyway, as the invitation might not have an RSVP yet
      }
      
      // Get guest profile if exists
      const { data: guest, error: guestError } = await supabase
        .from('guests')
        .select('*')
        .eq('invitation_id', invitation.id)
        .maybeSingle()
      
      if (guestError) {
        console.error('Error fetching guest:', guestError)
      }
        
      // Populate form with existing data or defaults - using multiple sources in priority order
      const guestName = guest?.name || rsvp?.guest_name || invitation.name || ''
      const guestEmail = guest?.email || rsvp?.guest_email || invitation.email || ''
      const guestPhone = guest?.phone || rsvp?.guest_phone || ''
      const guestNotes = guest?.notes || rsvp?.guest_notes || ''
      const guestAvatar = guest?.avatar_url || null
      
      if (guestAvatar) {
        setAvatarUrl(guestAvatar)
      }
      
      form.reset({
        name: guestName,
        email: guestEmail,
        phone: guestPhone,
        notes: guestNotes,
        avatar_url: guestAvatar || '',
      })
      
      setGuest(guest || { invitation_id: invitation.id })
      
      return { invitation, guest, event: eventData }
    } catch (error) {
      console.error('Error in getGuestDataByEventId:', error)
      setError('Failed to load your profile data')
      return null
    }
  }

  // Effect to load guest data on component mount
  useEffect(() => {
    const loadGuestData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Wait for token loading to complete
      if (tokenLoading) {
        return;
      }
      
      // Handle token error
      if (tokenError) {
        setError(tokenError.userMessage);
        setIsLoading(false);
        return;
      }
      
      // If we have a token, use it
      if (invitationToken) {
        const result = await getGuestDataByToken(invitationToken);
        if (result) {
          // Success
        } else {
          // Error already set in getGuestDataByToken
        }
      } 
      // If we have an event ID but no token, try to get data by event
      else if (eventId) {
        const result = await getGuestDataByEventId(eventId);
        if (result) {
          // Success
        } else {
          // Error already set in getGuestDataByEventId
        }
      }
      // No token or event ID
      else {
        setError('No invitation information found. Please use the link from your invitation email.');
      }
      
      setIsLoading(false);
    };
    
    loadGuestData();
  }, [invitationToken, eventId, tokenLoading, tokenError]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    
    const file = e.target.files[0]
    setAvatarFile(file)
    
    // Create a preview
    const objectUrl = URL.createObjectURL(file)
    setAvatarUrl(objectUrl)
    
    // Set the value in the form
    form.setValue('avatar_url', objectUrl)
  }
  
  const uploadAvatar = async (file: File, invitationId: string): Promise<string | null> => {
    if (!file) return null
    
    try {
      setUploadingAvatar(true)
      
      // Create a unique file path
      const fileExt = file.name.split('.').pop()
      const filePath = `avatars/${invitationId}/${Date.now()}.${fileExt}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(filePath, file)
        
      if (uploadError) {
        throw uploadError
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(filePath)
        
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your avatar",
        variant: "destructive",
      })
      return null
    } finally {
      setUploadingAvatar(false)
    }
  }
  
  const removeAvatar = () => {
    setAvatarUrl(null)
    setAvatarFile(null)
    form.setValue('avatar_url', '')
  }
  
  const initializeCamera = async () => {
    if (activeTab === 'camera' && !isCameraActive) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', aspectRatio: 9/16 }
        })
        
        setCameraStream(stream)
        setIsCameraActive(true)
        
        // Find the video element and set its srcObject
        const videoElement = document.getElementById('camera-preview') as HTMLVideoElement
        if (videoElement) {
          videoElement.srcObject = stream
        }
      } catch (error) {
        console.error('Error accessing camera:', error)
      }
    }
  }
  
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      setCameraStream(null)
      setIsCameraActive(false)
    }
  }
  
  useEffect(() => {
    if (activeTab === 'camera') {
      initializeCamera()
    } else {
      stopCamera()
    }
    
    return () => {
      stopCamera()
    }
  }, [activeTab])

  const toggleFlashlight = async () => {
    try {
      if (!cameraStream) return;
      
      // Get video track
      const videoTrack = cameraStream.getVideoTracks()[0];
      
      // Check if track supports torch mode - use type assertion for torch property
      const capabilities = videoTrack.getCapabilities() as ExtendedMediaTrackCapabilities;
      if (!capabilities.torch) {
        toast({
          title: "Flashlight not available",
          description: "Your device doesn't support flashlight control",
          variant: "destructive",
        });
        return;
      }
      
      // Toggle torch mode - use type assertion for torch property
      const newTorchState = !flashlightActive;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newTorchState } as TorchConstraintSet]
      });
      
      setFlashlightActive(newTorchState);
      
      toast({
        title: newTorchState ? "Flashlight on" : "Flashlight off",
        description: newTorchState ? "Flashlight has been turned on" : "Flashlight has been turned off",
        variant: "default",
      });
    } catch (error) {
      console.error('Error toggling flashlight:', error);
      toast({
        title: "Flashlight error",
        description: "Unable to control your device's flashlight",
        variant: "destructive",
      });
    }
  };

  const takeTestPhoto = async () => {
    if (!cameraStream) {
      toast({
        title: "Camera not active",
        description: "Please allow camera access to take a photo",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsTakingPhoto(true);
      
      // Get video element
      const videoElement = document.getElementById('camera-preview') as HTMLVideoElement;
      if (!videoElement) return;
      
      // Create a canvas element
      const canvas = document.createElement('canvas');
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
      
      // Draw the current video frame to the canvas
      const context = canvas.getContext('2d');
      if (!context) return;
      
      // Add a flash effect
      const flashOverlay = document.getElementById('flash-overlay');
      if (flashOverlay) {
        flashOverlay.classList.add('active');
        setTimeout(() => {
          flashOverlay.classList.remove('active');
        }, 300);
      }
      
      // Draw the video frame with a slight delay to show the flash effect
      setTimeout(() => {
        context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to data URL
        const photoUrl = canvas.toDataURL('image/jpeg');
        
        // Add to test photos
        setTestPhotos(prev => [photoUrl, ...prev]);
        
        // Schedule deletion after 5 minutes
        setTimeout(() => {
          setTestPhotos(prev => prev.filter(url => url !== photoUrl));
        }, 5 * 60 * 1000); // 5 minutes
        
        toast({
          title: "Photo captured",
          description: "Test photo will be deleted after 5 minutes",
        });
        
        setIsTakingPhoto(false);
      }, 100);
      
    } catch (error) {
      console.error('Error taking photo:', error);
      toast({
        title: "Error taking photo",
        description: "There was a problem capturing your photo",
        variant: "destructive",
      });
      setIsTakingPhoto(false);
    }
  };

  const onSubmit = async (values: GuestProfileFormValues) => {
    setIsSubmitting(true);
    try {
      if (!guest?.invitation_id && !invitationToken) {
        throw new Error('No invitation ID available');
      }
      
      const invitationId = guest?.invitation_id || tokenData?.invitationId;
      
      // First get the event_id from the invitation
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations')
        .select('event_id')
        .eq('id', invitationId)
        .single();
        
      if (invitationError || !invitation?.event_id) {
        console.error('Error getting invitation:', invitationError);
        throw new Error('Could not find associated event for this invitation');
      }
      
      // Upload avatar if there's a new file
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile, invitationId);
        if (uploadedUrl) {
          finalAvatarUrl = uploadedUrl;
        }
      }
      
      // Generate an access token (UUID)
      const accessToken = crypto.randomUUID ? crypto.randomUUID() : 
        `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      // Direct guest table update - now includes event_id and access_token
      const { data, error } = await supabase
        .from('guests')
        .upsert({
          invitation_id: invitationId,
          event_id: invitation.event_id,
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          notes: values.notes || null,
          avatar_url: finalAvatarUrl || null,
          access_token: accessToken,
          status: 'registered',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Guest profile error details:', error);
        throw new Error(`Failed to save profile: ${error.message}`);
      }
      
      // Show success message
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
      // Navigate to the next step with a from=profile parameter to trigger a welcome toast
      router.push(`/guest/dashboard?token=${invitationToken}&from=profile`);
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save profile',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  if (tokenError) {
    return (
      <div className="container max-w-4xl py-10">
        <TokenErrorAlert 
          error={tokenError} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive" className="mb-8">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertTitle>Error loading profile</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <div className="flex justify-center mt-8">
          <Button
            onClick={() => window.location.reload()}
            className="mr-4"
          >
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  const getBackUrl = () => {
    if (invitationToken) {
      return `/guest/dashboard?token=${invitationToken}`;
    }
    if (eventId) {
      return `/event/${eventId}`;
    }
    return '/';
  };

  return (
    <div className="container max-w-4xl pt-6 pb-10">
      <div className="mb-2 flex justify-between items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => router.push(getBackUrl())}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Your Setup for {event?.name || 'this event'}</h1>
        <p className="text-muted-foreground mt-1">
          Update your information and prepare your camera for the event
        </p>
      </div>

      {activeTab === 'profile' ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User2Icon className="h-5 w-5" />
              Your Information
            </CardTitle>
            <CardDescription>
              Please provide or update your contact information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <Avatar className="h-32 w-32 border-4 border-primary/10 shadow-lg transition-all duration-200">
                      <AvatarImage src={avatarUrl || ''} alt={form.getValues().name} className="object-cover" />
                      <AvatarFallback className="text-2xl bg-primary/10">
                        {form.getValues().name?.slice(0, 2).toUpperCase() || 'GU'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Label htmlFor="avatar" className="cursor-pointer w-full h-full">
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                          <Upload className="h-8 w-8 text-white" />
                        </div>
                        <input 
                          id="avatar" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange} 
                          className="hidden" 
                        />
                      </Label>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Label 
                      htmlFor="avatar-btn" 
                      className="cursor-pointer flex items-center gap-2 py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                    >
                      <Upload className="h-4 w-4" />
                      {avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                      <input 
                        id="avatar-btn" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                      />
                    </Label>
                    
                    {avatarUrl && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={removeAvatar}
                        className="h-10"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {avatarUrl && (
                    <p className="text-xs text-muted-foreground">
                      Your profile picture will be visible to event hosts and other attendees
                    </p>
                  )}
                </div>
                
                <FormField
                  control={form.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

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

                <div className="pt-4 flex justify-between">
                  <Button 
                    type="button" 
                    onClick={() => setActiveTab('camera')} 
                    className="w-full"
                  >
                    Continue to Setup Camera
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      ) : (
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Camera Setup
            </CardTitle>
            <CardDescription>
              Let's set up and test your camera for the event
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 py-0">
            <div className="relative bg-black">
              <div className="aspect-[9/16] max-w-md mx-auto relative overflow-hidden">
                <video 
                  id="camera-preview" 
                  className="absolute inset-0 h-full w-full object-cover" 
                  autoPlay 
                  playsInline
                  muted
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-white text-sm">Camera preview will appear here</p>
                  </div>
                )}
                
                {/* Flash overlay for photo effect */}
                <div 
                  id="flash-overlay" 
                  className="absolute inset-0 bg-white opacity-0 transition-opacity duration-200 pointer-events-none"
                ></div>
                
                {/* TikTok-style UI elements */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-4">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full h-12 w-12 bg-white/20 backdrop-blur-sm text-white border border-white/30"
                    onClick={toggleFlashlight}
                  >
                    <Lightbulb className={`h-6 w-6 ${flashlightActive ? 'text-yellow-300' : 'text-white'}`} />
                  </Button>
                  
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full h-12 w-12 bg-white/20 backdrop-blur-sm text-white border border-white/30"
                  >
                    <Camera className="h-6 w-6" />
                  </Button>
                </div>
                
                <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                  <Button
                    variant="secondary"
                    className="rounded-full px-8 bg-white text-black font-medium"
                    onClick={takeTestPhoto}
                    disabled={isTakingPhoto || !isCameraActive}
                  >
                    {isTakingPhoto ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : null}
                    Take Test Photo
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">Test Photo Gallery</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Test photos will be automatically deleted after 5 minutes.
              </p>
              
              <div className="grid grid-cols-3 gap-2 mb-4">
                {testPhotos.length === 0 ? (
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">No photos yet</p>
                  </div>
                ) : (
                  testPhotos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Test photo ${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setActiveTab('profile')}>
              Back to Profile
            </Button>
            <Button 
              onClick={() => {
                // Submit the form programmatically
                form.handleSubmit(onSubmit)();
              }}
              disabled={isSubmitting || uploadingAvatar}
            >
              {(isSubmitting || uploadingAvatar) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Setup
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

// Add this CSS at the end of the file
const flashStyle = `
  #flash-overlay.active {
    opacity: 0.9;
    animation: flash 300ms ease-out;
  }
  
  @keyframes flash {
    0% { opacity: 0.9; }
    100% { opacity: 0; }
  }
`;

// Inject the flash animation styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = flashStyle;
  document.head.appendChild(styleElement);
}