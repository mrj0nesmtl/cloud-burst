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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast as sonnerToast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Label } from '@/components/ui/label'

const guestProfileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  notes: z.string().optional(),
  avatar_url: z.string().optional(),
})

type GuestProfileFormValues = z.infer<typeof guestProfileSchema>

export default function GuestProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const invitationToken = searchParams.get('token')
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
      console.log('Getting guest data by token:', token)
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
      
      console.log('Found invitation:', invitation)
      
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
      
      console.log('Setting form data:', { name: guestName, email: guestEmail, phone: guestPhone, notes: guestNotes, avatar_url: guestAvatar })
      
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
        .select('id, email, event_id, name')
        .eq('event_id', eventId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
        
      if (invitationError || !invitation) {
        setError('Unable to find an invitation for this event. Please check the event ID or get a new invitation.')
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
      
      // Now check if there's an RSVP for this invitation
      const { data: rsvp, error: rsvpError } = await supabase
        .from('rsvps')
        .select('id, status, guest_name, guest_email, guest_phone, guest_notes')
        .eq('invitation_id', invitation.id)
        .eq('status', 'yes')
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
      
      console.log('Setting form data:', { name: guestName, email: guestEmail, phone: guestPhone, notes: guestNotes, avatar_url: guestAvatar })
      
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
      console.error('Error fetching guest data by event ID:', error)
      setError('Failed to load your profile data')
      return null
    }
  }

  useEffect(() => {
    const loadGuestData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        if (!invitationToken && !eventId) {
          setError('No invitation token or event ID was provided')
          return
        }

        // If we have an eventId but no invitationToken, fetch the most recent invitation for this event
        if (!invitationToken && eventId) {
          const { data: invitation, error: invitationError } = await supabase
            .from('invitations')
            .select('token, email, event_id')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle()
            
          if (invitationError || !invitation) {
            setError('Unable to find an invitation for this event')
            return
          }
          
          // Use the found invitation token for the rest of the process
          router.replace(`/guest/profile?token=${invitation.token}`)
          return // Router will reload the page with the token
        }

        // Fetch invitation data
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, event_id, email')
          .eq('token', invitationToken as string)
          .single()

        if (invitationError || !invitation) {
          throw new Error('Invalid invitation token')
        }
        
        let profileData = null
        
        if (invitationToken) {
          profileData = await getGuestDataByToken(invitationToken)
        } else if (eventId) {
          profileData = await getGuestDataByEventId(eventId)
        }
        
        if (!profileData) {
          // Error already set within the get functions
          return
        }
      } catch (error) {
        console.error('Error loading guest data:', error)
        setError('Failed to load your profile data')
      } finally {
        setIsLoading(false)
      }
    }

    loadGuestData()
  }, [invitationToken, eventId])

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
        .from('guest-profiles')
        .upload(filePath, file)
        
      if (uploadError) {
        throw uploadError
      }
      
      // Get the public URL
      const { data } = supabase.storage
        .from('guest-profiles')
        .getPublicUrl(filePath)
        
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading avatar:', error)
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
      
      // Check if track supports torch mode
      const capabilities = videoTrack.getCapabilities();
      if (!capabilities.torch) {
        toast({
          title: "Flashlight not available",
          description: "Your device doesn't support flashlight control",
          variant: "destructive",
        });
        return;
      }
      
      // Toggle torch mode
      const newTorchState = !flashlightActive;
      await videoTrack.applyConstraints({
        advanced: [{ torch: newTorchState }]
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

  const onSubmit = async (values: GuestProfileFormValues) => {
    setIsSubmitting(true)
    setError(null)
    
    try {
      let invitationId: string | null = null
      
      // Get the invitation ID based on token or event ID
      if (invitationToken) {
        const { data, error } = await supabase
          .from('invitations')
          .select('id')
          .eq('token', invitationToken)
          .single()
          
        if (error || !data) {
          throw new Error('Invalid invitation token')
        }
        
        invitationId = data.id
      } else if (eventId) {
        // Get invitation for this event directly
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations')
          .select('id, email, event_id')
          .eq('event_id', eventId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()
          
        if (invitationError || !invitation) {
          throw new Error('Unable to find an invitation for this event')
        }
        
        invitationId = invitation.id
      }
      
      if (!invitationId) {
        throw new Error('No valid invitation found')
      }
      
      // Upload avatar if there's a new file
      let avatarUrl = values.avatar_url
      if (avatarFile) {
        const uploadedUrl = await uploadAvatar(avatarFile, invitationId)
        if (uploadedUrl) {
          avatarUrl = uploadedUrl
        }
      }
      
      // Check if guest profile already exists
      const { data: existingGuest } = await supabase
        .from('guests')
        .select('id')
        .eq('invitation_id', invitationId)
        .maybeSingle()
      
      // Create or update guest profile
      const guestData = {
        invitation_id: invitationId,
        name: values.name,
        email: values.email,
        phone: values.phone || null,
        notes: values.notes || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      }
      
      let guestOperation
      
      if (existingGuest?.id) {
        // Update existing guest
        guestOperation = supabase
          .from('guests')
          .update(guestData)
          .eq('id', existingGuest.id)
      } else {
        // Create new guest
        guestOperation = supabase
          .from('guests')
          .insert({
            ...guestData,
            created_at: new Date().toISOString(),
          })
      }
      
      const { error: guestError } = await guestOperation
      
      if (guestError) {
        throw new Error(guestError.message)
      }
      
      // Use the toast from useToast() with the proper structure
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully!",
        variant: "success",
      })
      
      // If the invitation has a different email than provided, update it
      const { data: invitation } = await supabase
        .from('invitations')
        .select('email')
        .eq('id', invitationId)
        .single()
        
      if (invitation && invitation.email !== values.email) {
        const { error: updateError } = await supabase
          .from('invitations')
          .update({ email: values.email })
          .eq('id', invitationId)
          
        if (updateError) {
          console.error('Error updating invitation email:', updateError)
          // Not critical, so we don't throw
        }
      }
      
      // After saving profile, switch to camera tab if we're on the profile tab
      if (activeTab === 'profile') {
        setActiveTab('camera')
      }
      
    } catch (error) {
      console.error('Error submitting profile:', error)
      setError(error instanceof Error ? error.message : 'Failed to update profile')
      // Use the toast from useToast() with the proper structure
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <p className="text-muted-foreground text-center mt-4">
          Please check your invitation link or contact the event organizer.
        </p>
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User2Icon className="h-4 w-4" />
            Profile Information
          </TabsTrigger>
          <TabsTrigger value="camera" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Camera Setup
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
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
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || ''} alt={form.getValues().name} />
                      <AvatarFallback>{form.getValues().name?.slice(0, 2).toUpperCase() || 'GU'}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex gap-2">
                      <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="avatar" className="cursor-pointer">
                          <div className="flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-accent">
                            <Upload className="h-4 w-4" />
                            {avatarUrl ? 'Change' : 'Upload'} Avatar
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
                      
                      {avatarUrl && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={removeAvatar}
                          className="h-9"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>
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
                    <Button type="submit" disabled={isSubmitting || uploadingAvatar} className="w-full">
                      {(isSubmitting || uploadingAvatar) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {uploadingAvatar ? 'Uploading Avatar...' : 'Save Profile & Continue to Camera Setup'}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="camera">
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
                    >
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
                  <div className="aspect-square bg-slate-200 dark:bg-slate-800 rounded-md flex items-center justify-center">
                    <p className="text-muted-foreground text-xs">No photos yet</p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setActiveTab('profile')}>
                Back to Profile
              </Button>
              <Button>
                Complete Setup
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 