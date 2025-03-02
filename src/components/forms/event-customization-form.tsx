'use client'

import * as z from 'zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { AlertCircle, CheckCircle2, Upload } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Slider } from '@/components/ui/slider'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { updateEventCustomizationSettings } from '@/lib/event-customization'

const eventCustomizationSchema = z.object({
  // Branding
  eventName: z.string().min(2, 'Event name must be at least 2 characters'),
  eventDescription: z.string().optional(),
  eventLogo: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Must be a valid hex color'),
  
  // Social
  enableSocialSharing: z.boolean(),
  autoPostToFacebook: z.boolean(),
  autoPostToInstagram: z.boolean(),
  autoPostToTwitter: z.boolean(),
  socialSharingMessage: z.string().optional(),
  
  // Chat
  enableLiveChat: z.boolean(),
  moderateChat: z.boolean(),
  allowGuestChat: z.boolean(),
  chatWelcomeMessage: z.string().optional(),
  
  // Display
  galleryLayout: z.enum(['grid', 'masonry', 'slideshow']),
  thumbnailSize: z.enum(['small', 'medium', 'large']),
  photoDisplayDuration: z.number().min(1).max(10),
  showPhotoInfo: z.boolean(),
})

type EventCustomizationValues = z.infer<typeof eventCustomizationSchema>

interface EventCustomizationFormProps {
  eventId?: string
  initialValues?: Partial<EventCustomizationValues>
  onSubmit: (values: EventCustomizationValues) => Promise<void>
}

export function EventCustomizationForm({ 
  eventId, 
  initialValues, 
  onSubmit 
}: EventCustomizationFormProps) {
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [isUploading, setIsUploading] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string | null>(initialValues?.eventLogo || null)
  const [activeTab, setActiveTab] = useState('branding')

  const form = useForm<EventCustomizationValues>({
    resolver: zodResolver(eventCustomizationSchema),
    defaultValues: {
      eventName: '',
      eventDescription: '',
      eventLogo: '',
      primaryColor: '#3b82f6',
      secondaryColor: '#10b981',
      accentColor: '#f97316',
      enableSocialSharing: true,
      autoPostToFacebook: false,
      autoPostToInstagram: false,
      autoPostToTwitter: false,
      socialSharingMessage: 'Check out my event photos!',
      enableLiveChat: true,
      moderateChat: true,
      allowGuestChat: true,
      chatWelcomeMessage: 'Welcome to the event chat!',
      galleryLayout: 'grid',
      thumbnailSize: 'medium',
      photoDisplayDuration: 3,
      showPhotoInfo: true,
      ...initialValues,
    },
  })

  async function handleLogoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!event.target.files || event.target.files.length === 0) {
        return
      }
      
      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `event-logos/${eventId || 'new'}/${Date.now()}.${fileExt}`
      
      setIsUploading(true)
      
      // Upload to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('events')
        .upload(filePath, file, {
          upsert: true,
        })
        
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('events')
        .getPublicUrl(filePath)
        
      setLogoUrl(publicUrl)
      
      toast({
        title: 'Logo uploaded',
        description: 'Your event logo has been uploaded successfully.',
      })
    } catch (error: any) {
      toast({
        title: 'Upload failed',
        description: error.message || 'There was a problem uploading your logo.',
        variant: 'destructive',
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSubmit(data: EventCustomizationValues) {
    try {
      // Convert the form values to the format expected by the API
      const settingsToUpdate = {
        event_name: data.eventName,
        event_description: data.eventDescription,
        event_logo: logoUrl,
        primary_color: data.primaryColor,
        secondary_color: data.secondaryColor,
        accent_color: data.accentColor,
        enable_social_sharing: data.enableSocialSharing,
        auto_post_to_facebook: data.autoPostToFacebook,
        auto_post_to_instagram: data.autoPostToInstagram,
        auto_post_to_twitter: data.autoPostToTwitter,
        social_sharing_message: data.socialSharingMessage,
        enable_live_chat: data.enableLiveChat,
        moderate_chat: data.moderateChat,
        allow_guest_chat: data.allowGuestChat,
        chat_welcome_message: data.chatWelcomeMessage,
        gallery_layout: data.galleryLayout,
        thumbnail_size: data.thumbnailSize,
        photo_display_duration: data.photoDisplayDuration,
        show_photo_info: data.showPhotoInfo,
      }
      
      // Update the settings in the database
      await updateEventCustomizationSettings(settingsToUpdate, eventId)
      
      toast({
        title: 'Settings saved',
        description: 'Your event customization settings have been saved.',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings. Please try again.',
        variant: 'destructive',
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="social">Social</TabsTrigger>
            <TabsTrigger value="chat">Live Chat</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>
          
          <TabsContent value="branding" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Branding</CardTitle>
                <CardDescription>
                  Customize your event's appearance and branding
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="eventName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="eventDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Describe your event" 
                            className="resize-none" 
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div>
                    <FormLabel>Event Logo</FormLabel>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative h-24 w-24 overflow-hidden rounded-md border">
                        {logoUrl ? (
                          <img 
                            src={logoUrl} 
                            alt="Event logo" 
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-muted">
                            <span className="text-xs text-muted-foreground">No logo</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="relative"
                          disabled={isUploading}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          {isUploading ? 'Uploading...' : 'Upload Logo'}
                          <input
                            type="file"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={isUploading}
                          />
                        </Button>
                        <p className="mt-2 text-xs text-muted-foreground">
                          Recommended: 512x512px PNG or JPG
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Color Scheme</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-md border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="secondaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Secondary Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-md border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accentColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Accent Color</FormLabel>
                          <div className="flex items-center gap-2">
                            <div 
                              className="h-8 w-8 rounded-md border" 
                              style={{ backgroundColor: field.value }}
                            />
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="social" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Integration</CardTitle>
                <CardDescription>
                  Configure social media sharing and auto-posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enableSocialSharing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Social Sharing</FormLabel>
                        <FormDescription>
                          Allow guests to share photos on social media
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
                
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Auto-Posting</h3>
                  
                  <FormField
                    control={form.control}
                    name="autoPostToFacebook"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Facebook</FormLabel>
                          <FormDescription>
                            Automatically post new photos to Facebook
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
                  
                  <FormField
                    control={form.control}
                    name="autoPostToInstagram"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Instagram</FormLabel>
                          <FormDescription>
                            Automatically post new photos to Instagram
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
                  
                  <FormField
                    control={form.control}
                    name="autoPostToTwitter"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Twitter</FormLabel>
                          <FormDescription>
                            Automatically post new photos to Twitter
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
                </div>
                
                <FormField
                  control={form.control}
                  name="socialSharingMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default Sharing Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter default text for social media posts" 
                          className="resize-none" 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be used when sharing photos on social media
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="chat" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Chat Settings</CardTitle>
                <CardDescription>
                  Configure the live chat feed for your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="enableLiveChat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Live Chat</FormLabel>
                        <FormDescription>
                          Allow attendees to chat during the event
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
                
                <FormField
                  control={form.control}
                  name="moderateChat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Moderate Chat</FormLabel>
                        <FormDescription>
                          Review messages before they appear in the chat
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
                
                <FormField
                  control={form.control}
                  name="allowGuestChat"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Allow Guest Chat</FormLabel>
                        <FormDescription>
                          Let guests chat without creating an account
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
                
                <FormField
                  control={form.control}
                  name="chatWelcomeMessage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Welcome Message</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Enter a welcome message for the chat" 
                          className="resize-none" 
                          rows={2}
                        />
                      </FormControl>
                      <FormDescription>
                        This message will be displayed at the top of the chat
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="display" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Display Settings</CardTitle>
                <CardDescription>
                  Configure how photos are displayed in your event gallery
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="galleryLayout"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gallery Layout</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex flex-col space-y-1"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="grid" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Grid
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="masonry" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Masonry
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="slideshow" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Slideshow
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="thumbnailSize"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Thumbnail Size</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          className="flex space-x-4"
                        >
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="small" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Small
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="medium" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Medium
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="large" />
                            </FormControl>
                            <FormLabel className="font-normal">
                              Large
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="photoDisplayDuration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slideshow Duration (seconds)</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Slider
                            min={1}
                            max={10}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(value: number[]) => field.onChange(value[0])}
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>1s</span>
                            <span>{field.value}s</span>
                            <span>10s</span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        How long each photo displays in slideshow mode
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="showPhotoInfo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Show Photo Information</FormLabel>
                        <FormDescription>
                          Display metadata and captions with photos
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end">
          <Button type="submit">Save Customization Settings</Button>
        </div>
      </form>
    </Form>
  )
} 