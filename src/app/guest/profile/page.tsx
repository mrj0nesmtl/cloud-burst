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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { GuestNavBar } from '@/components/guest'

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
    console.log("Starting profile submission with values:", values);
    setIsSubmitting(true);
    try {
      if (!guest?.invitation_id && !invitationToken) {
        throw new Error('No invitation ID available');
      }
      
      // Get the invitation ID
      let invitationId = guest?.invitation_id;
      
      if (!invitationId) {
        console.log("No invitation ID in guest data, retrieving from token");
        // Get invitation id from token
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id')
          .eq('token', invitationToken)
          .single();
          
        if (invitationError || !invitation) {
          console.error("Failed to retrieve invitation ID:", invitationError);
          throw new Error('Could not find invitation');
        }
        
        console.log("Retrieved invitation ID:", invitation.id);
        invitationId = invitation.id;
      }
      
      console.log("Sending profile update request with data:", {
        id: guest?.id,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        notes: values.notes || null,
        avatar_url: avatarUrl || null,
        event_id: event?.id || eventId || '',
        invitation_id: invitationId,
        status: 'confirmed',
      });
      
      // Use the API endpoint to save the profile
      const response = await fetch('/api/guest/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: guest?.id,
          name: values.name,
          email: values.email,
          phone: values.phone || null,
          notes: values.notes || null,
          avatar_url: avatarUrl || null,
          event_id: event?.id || eventId || '',
          invitation_id: invitationId,
          status: 'confirmed',
        }),
      });
      
      const result = await response.json();
      console.log("Profile update response:", result);
      
      if (!response.ok) {
        console.error("Profile update failed with status:", response.status);
        throw new Error(result.error || 'Failed to update profile');
      }

      console.log("Profile updated successfully, redirecting to dashboard");
      // Now redirect to dashboard with success message
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
    <div style={{ width: '100%', maxWidth: '100%' }}>
      {/* If there's a token error, show the error UI */}
      {tokenError && !tokenLoading && (
        <div className="w-full max-w-md mx-auto mt-8 px-4">
          <TokenErrorAlert error={tokenError} />
        </div>
      )}

      {/* Show loading state while token validation is in progress */}
      {tokenLoading && (
        <div className="w-full h-full flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      )}

      {/* Main content - only show when we have a valid token and no errors */}
      {!tokenLoading && !tokenError && invitationToken && (
        <>
          <div className="w-full px-4 py-6">
            <div className="flex flex-col items-start mb-6">
              <div className="flex items-center gap-3 mb-2">
                <Link href={getBackUrl()}>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <h1 className="text-2xl font-bold">Your Profile</h1>
              </div>

              {event && (
                <p className="text-muted-foreground">
                  Event: {event.name}
                </p>
              )}
            </div>

            {/* Tabs for different sections */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 rounded-md">
                <TabsTrigger value="profile" className="rounded-l-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="camera" className="rounded-r-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  Camera Test
                </TabsTrigger>
              </TabsList>
              
              {/* Profile Tab Content */}
              <TabsContent value="profile">
                <div className="bg-background/95 backdrop-blur-md rounded-xl shadow-lg p-6">
                  {/* Avatar Section */}
                  <div className="mb-6 flex justify-center">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <Avatar className="w-24 md:w-32 h-24 md:h-32 border-4 border-primary/20">
                          <AvatarImage src={avatarUrl || undefined} />
                          <AvatarFallback className="bg-slate-700 text-2xl">
                            {guest?.name ? guest.name.charAt(0).toUpperCase() : <User2Icon className="h-8 w-8 md:h-10 md:w-10" />}
                          </AvatarFallback>
                        </Avatar>
                        
                        <Button
                          size="sm"
                          className="absolute bottom-0 right-0 rounded-full w-8 h-8 md:w-10 md:h-10 p-0 bg-primary shadow-lg hover:bg-primary/90"
                          onClick={() => document.getElementById('avatar-upload')?.click()}
                        >
                          <Camera className="h-4 w-4 md:h-5 md:w-5" />
                        </Button>
                        
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                        />
                      </div>
                      
                      {avatarUrl && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="mt-2 text-destructive hover:text-destructive/80 text-xs md:text-sm"
                          onClick={removeAvatar}
                        >
                          <Trash2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                          Remove
                        </Button>
                      )}
                      
                      {uploadingAvatar && (
                        <div className="mt-2">
                          <Progress value={45} className="w-[100px] h-1.5" />
                          <span className="text-xs text-muted-foreground mt-1 block">Uploading...</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Info Alert */}
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Profile Information</AlertTitle>
                    <AlertDescription>
                      We've pre-filled your information from your RSVP. Please verify and update as needed.
                    </AlertDescription>
                  </Alert>
                  
                  {/* Profile Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="name"
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
                        name="notes"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Notes</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Any notes or special requests for the event" 
                                className="resize-none" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Optional. This helps event hosts accommodate your needs.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button type="submit" disabled={isSubmitting || uploadingAvatar} className="w-full">
                        {(isSubmitting || uploadingAvatar) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Profile'
                        )}
                      </Button>
                    </form>
                  </Form>
                </div>
              </TabsContent>
              
              {/* Camera Test Tab Content */}
              <TabsContent value="camera">
                <Card className="bg-background/95 backdrop-blur-md rounded-xl shadow-lg">
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
                        <div className="absolute bottom-4 right-4 flex flex-col gap-3 md:gap-4">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-white/20 backdrop-blur-sm text-white border border-white/30"
                            onClick={toggleFlashlight}
                          >
                            <Lightbulb className={`h-5 w-5 md:h-6 md:w-6 ${flashlightActive ? 'text-yellow-300' : 'text-white'}`} />
                          </Button>
                          
                          <Button
                            size="icon"
                            variant="secondary"
                            className="rounded-full h-10 w-10 md:h-12 md:w-12 bg-white/20 backdrop-blur-sm text-white border border-white/30"
                          >
                            <Camera className="h-5 w-5 md:h-6 md:w-6" />
                          </Button>
                        </div>
                        
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                          <Button
                            variant="secondary"
                            className="rounded-full px-4 md:px-8 py-1.5 md:py-2 text-sm md:text-base bg-white text-black font-medium"
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
                    
                    <div className="p-4 md:p-6">
                      <h3 className="text-base md:text-lg font-semibold mb-1 md:mb-2">Test Photo Gallery</h3>
                      <p className="text-muted-foreground text-xs md:text-sm mb-3 md:mb-4">
                        Test photos will be automatically deleted after 5 minutes.
                      </p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
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
                  <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between p-4 md:p-6">
                    <Button variant="outline" onClick={() => setActiveTab('profile')} className="w-full sm:w-auto">
                      Back to Profile
                    </Button>
                    <Button 
                      onClick={() => {
                        // Submit the form programmatically
                        form.handleSubmit(onSubmit)();
                      }}
                      disabled={isSubmitting || uploadingAvatar}
                      className="w-full sm:w-auto"
                    >
                      {(isSubmitting || uploadingAvatar) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Complete Setup
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Bottom Navigation */}
          <GuestNavBar activeTab="profile" invitationToken={invitationToken} />
        </>
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