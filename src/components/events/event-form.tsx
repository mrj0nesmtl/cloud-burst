"use client"

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Upload, X, Instagram, Facebook, Twitter, Globe, Users, Palette, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
import Image from 'next/image'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { ThemePreview } from '@/components/events/theme-preview'
import { HexColorPicker } from "react-colorful"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Event } from "@/types/events"

// Form schema
const formSchema = z.object({
  name: z.string().min(2, 'Event name must be at least 2 characters'),
  description: z.string().optional(),
  date: z.date({
    required_error: 'Event date is required',
  }),
  location: z.string().min(3, 'Location must be at least 3 characters'),
  is_public: z.boolean().default(true),
  max_attendees: z.coerce.number().int().positive().optional(),
  custom_url: z.string().optional(),
  logo_url: z.string().optional(),
  use_logo_as_main_image: z.boolean().default(false),
  instagram_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  facebook_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  twitter_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  accent_color: z.string().default('#3b82f6'),
  status: z.enum(['draft', 'published', 'scheduled']).default('draft'),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  thumbnail_image: z.any().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface EventFormProps {
  initialData?: Event
  userId: string
  mode?: 'create' | 'edit'
}

export function EventForm({ initialData, userId, mode = 'create' }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialData?.logo_url || null)
  const [isUploading, setIsUploading] = useState(false)
  const [customUrl, setCustomUrl] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isExistingThumbnail, setIsExistingThumbnail] = useState(false)
  
  // Detect viewport size for responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth >= 768 && window.innerWidth < 1024)
    }
    
    handleResize() // Check on initial load
    window.addEventListener('resize', handleResize)
    
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Initialize form with existing data
  useEffect(() => {
    if (initialData && mode === 'edit') {
      // Set the thumbnail preview if the event has a cover image
      if (initialData.cover_image_url) {
        setThumbnailPreview(initialData.cover_image_url)
        setIsExistingThumbnail(true)
        setCustomUrl(initialData.custom_url || "")
      }
    }
  }, [initialData, mode])

  // Default values
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date) : undefined,
    location: initialData?.location || '',
    is_public: initialData?.is_public ?? true,
    max_attendees: initialData?.max_attendees || undefined,
    custom_url: initialData?.custom_url || '',
    logo_url: initialData?.logo_url || '',
    use_logo_as_main_image: initialData?.use_logo_as_main_image ?? false,
    instagram_url: initialData?.instagram_url || '',
    facebook_url: initialData?.facebook_url || '',
    twitter_url: initialData?.twitter_url || '',
    website_url: initialData?.website_url || '',
    accent_color: initialData?.accent_color || '#3b82f6',
    status: initialData?.status || 'draft',
    cover_image_url: initialData?.cover_image_url || '',
  }
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  
  // Handle logo upload
  const onLogoChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoFile(file)
        setLogoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    []
  )
  
  // Handle logo upload to Supabase Storage
  const uploadLogo = async (eventId: string): Promise<string | undefined> => {
    if (!logoFile) {
      return logoPreview || undefined // Return existing URL if no new file or undefined
    }
    
    setIsUploading(true)
    try {
      const supabase = createClient()
      
      // Create a unique filename
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `event-logo-${eventId}-${Date.now()}.${fileExt}`
      const filePath = `event-logos/${fileName}`
      
      // Upload the file
      const { error: uploadError } = await supabase
        .storage
        .from('event-assets')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: true
        })
      
      if (uploadError) throw uploadError
      
      // Get the public URL
      const { data } = supabase
        .storage
        .from('event-assets')
        .getPublicUrl(filePath)
      
      return data.publicUrl
    } catch (error) {
      console.error('Error uploading logo:', error)
      toast.error('Failed to upload logo')
      return undefined
    } finally {
      setIsUploading(false)
    }
  }
  
  // Reset logo file and preview
  const resetLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    form.setValue('logo_url', '')
  }
  
  // Function to handle thumbnail image upload
  const handleThumbnailUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    // Create a preview URL
    const previewUrl = URL.createObjectURL(file)
    setThumbnailPreview(previewUrl)
    setThumbnailFile(file)
    setIsExistingThumbnail(false)
    
    // Update form value
    form.setValue('thumbnail_image', file)
  }

  // Clear the thumbnail
  const clearThumbnail = () => {
    if (thumbnailPreview && !isExistingThumbnail) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailPreview(null)
    setThumbnailFile(null)
    setIsExistingThumbnail(false)
    form.setValue('thumbnail_image', undefined)
    form.setValue('cover_image_url', '')
  }
  
  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      let logoUrl = values.logo_url
      
      if (mode === 'create') {
        // Create new event first to get ID
        const { data, error } = await supabase
          .from('events')
          .insert([
            {
              name: values.name,
              description: values.description,
              date: values.date.toISOString(),
              location: values.location,
              is_public: values.is_public,
              max_attendees: values.max_attendees,
              custom_url: values.custom_url,
              organizer_id: userId,
              status: values.status,
              instagram_url: values.instagram_url,
              facebook_url: values.facebook_url,
              twitter_url: values.twitter_url,
              website_url: values.website_url,
              accent_color: values.accent_color,
              use_logo_as_main_image: values.use_logo_as_main_image,
            },
          ])
          .select()
        
        if (error) throw error
        
        // Upload logo if there is one
        if (logoFile) {
          logoUrl = await uploadLogo(data[0].id) || undefined;
          
          // Update event with logo URL
          if (logoUrl) {
            await supabase
              .from('events')
              .update({ logo_url: logoUrl } as any)
              .eq('id', data[0].id)
          }
        }
        
        toast.success('Event created successfully')
        router.push(`/protected/events/${data[0].id}`)
      } else {
        // For edit mode, upload logo first if there is a new one
        if (logoFile) {
          logoUrl = await uploadLogo(initialData.id) || undefined;
        }
        
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update({
            name: values.name,
            description: values.description,
            date: values.date.toISOString(),
            location: values.location,
            is_public: values.is_public,
            max_attendees: values.max_attendees,
            custom_url: values.custom_url,
            logo_url: logoUrl,
            instagram_url: values.instagram_url,
            facebook_url: values.facebook_url,
            twitter_url: values.twitter_url,
            website_url: values.website_url,
            accent_color: values.accent_color,
            status: values.status,
            use_logo_as_main_image: values.use_logo_as_main_image,
          })
          .eq('id', initialData.id)
        
        if (error) throw error
        
        toast.success('Event updated successfully')
        router.push(`/protected/events/${initialData.id}`)
        router.refresh()
      }
    } catch (error) {
      console.error('Error submitting event:', error)
      toast.error('Failed to save event')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Event Logo */}
        <div className="space-y-3">
          <FormLabel>Event Logo</FormLabel>
          <div className="flex items-center gap-6">
            {logoPreview ? (
              <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                <Image 
                  src={logoPreview} 
                  alt="Event logo preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-6 w-6 rounded-full"
                  onClick={resetLogo}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                <Upload className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onLogoChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo')?.click()}
                disabled={isUploading}
                className="mr-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Select Logo</>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended size: 1:1 ratio, at least 200x200px
              </p>
            </div>
          </div>
          
          {/* Add logo as main image toggle */}
          {logoPreview && (
            <FormField
              control={form.control}
              name="use_logo_as_main_image"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-4 pt-4 border-t">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Use as Gallery Thumbnail</FormLabel>
                    <FormDescription>
                      Use this logo as the main thumbnail image in the gallery view
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          )}
        </div>
        
        {/* Event Status - Added status selection */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Status</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-amber-500 mr-2"></span>
                      Draft
                    </div>
                  </SelectItem>
                  <SelectItem value="published">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                      Live
                    </div>
                  </SelectItem>
                  <SelectItem value="scheduled">
                    <div className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-blue-500 mr-2"></span>
                      Scheduled
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Draft: Only visible to you
                <br />
                Live: Accessible to attendees now
                <br />
                Scheduled: Will become accessible on the event date
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="My Amazing Event" {...field} />
              </FormControl>
              <FormDescription>
                The name of your event as it will appear to attendees.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell people about your event..."
                  className="min-h-32"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Describe your event, including any important details for attendees.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Event Date and Location - Improved layout */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Event Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormDescription>
                  The date when your event will take place.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="123 Main St, City, Country" 
                      {...field} 
                      className="pl-3"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter the full address where your event will be held.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Attendees and Custom URL - Improved layout */}
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="max_attendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Attendees</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="100"
                      {...field}
                      value={field.value || ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                        field.onChange(value)
                      }}
                      className="pl-3 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Optional: Limit the number of attendees for your event.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="custom_url"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custom URL</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="my-event" 
                      {...field} 
                      value={field.value || ''} 
                      className="pl-3 pr-10"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                      <Globe className="h-4 w-4" />
                    </div>
                  </div>
                </FormControl>
                <FormDescription>
                  Optional: Create a custom URL for your event (e.g., "my-amazing-event").
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Color Picker - Replaced theme selector with color picker */}
        <div className="rounded-lg border p-6">
          <FormField
            control={form.control}
            name="accent_color"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base flex items-center">
                  <Palette className="h-4 w-4 mr-2" />
                  Event Gallery Color
                </FormLabel>
                <div className="space-y-4 mt-2">
                  <FormControl>
                    <div className="flex flex-col items-center space-y-4">
                      <HexColorPicker 
                        color={field.value} 
                        onChange={field.onChange} 
                        className="w-full max-w-[240px]"
                      />
                      <div className="flex items-center space-x-2 w-full max-w-[240px]">
                        <div 
                          className="h-10 w-10 rounded-md border" 
                          style={{ backgroundColor: field.value }}
                        />
                        <Input 
                          value={field.value} 
                          onChange={(e) => field.onChange(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </FormControl>
                  <FormDescription>
                    This color will be used as the background color for your event gallery.
                  </FormDescription>
                  <div className="w-full p-4 rounded-md" style={{ backgroundColor: field.value + '20' }}>
                    <div className="flex justify-between items-center mb-2">
                      <div className="h-3 w-20 rounded-sm bg-white/80" />
                      <div className="h-3 w-6 rounded-sm" style={{ backgroundColor: field.value }} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(6)].map((_, i) => (
                        <div 
                          key={i} 
                          className="aspect-square rounded-sm bg-white/40 flex items-center justify-center"
                        >
                          <div className="h-6 w-6 rounded-sm" style={{ backgroundColor: field.value + '40' }} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        {/* Social Media Links - Made wider with better layout */}
        <div className="rounded-lg border p-6">
          <h3 className="text-lg font-medium mb-6 flex items-center">
            <Globe className="h-5 w-5 mr-2" />
            Social Media Links
          </h3>
          
          <div className="space-y-6">
            <FormField
              control={form.control}
              name="website_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <Globe className="mr-2 h-4 w-4" />
                    Website
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="https://www.example.com" 
                        {...field} 
                        value={field.value || ''} 
                        className="pl-3 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        <Globe className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="instagram_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <Instagram className="mr-2 h-4 w-4" />
                    Instagram
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="https://www.instagram.com/youraccount" 
                        {...field} 
                        value={field.value || ''} 
                        className="pl-3 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        <Instagram className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="facebook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="https://www.facebook.com/youraccount" 
                        {...field} 
                        value={field.value || ''} 
                        className="pl-3 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        <Facebook className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="twitter_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center text-muted-foreground">
                    <Twitter className="mr-2 h-4 w-4" />
                    Twitter/X
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                        placeholder="https://twitter.com/youraccount" 
                        {...field} 
                        value={field.value || ''} 
                        className="pl-3 pr-10"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
                        <Twitter className="h-4 w-4" />
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        {/* Public Event - Improved layout */}
        <FormField
          control={form.control}
          name="is_public"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Public Event</FormLabel>
                <FormDescription>
                  Make this event visible to everyone. If unchecked, only invited attendees can access it.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        {/* Event Thumbnail */}
        <div className="space-y-3">
          <FormLabel>Event Thumbnail</FormLabel>
          <div className="flex items-center gap-6">
            {thumbnailPreview ? (
              <div className="relative h-24 w-24 rounded-md overflow-hidden border">
                <Image 
                  src={thumbnailPreview} 
                  alt="Event thumbnail preview"
                  fill
                  className="object-cover"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-0 right-0 h-6 w-6 rounded-full"
                  onClick={clearThumbnail}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-md border border-dashed">
                <ImageIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
            <div>
              <Input
                id="thumbnail-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleThumbnailUpload}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('thumbnail-upload')?.click()}
                disabled={isSubmitting}
                className="mr-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>Select Thumbnail</>
                )}
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                Recommended size: 1:1 ratio, at least 200x200px
              </p>
            </div>
          </div>
        </div>
        
        {/* Form Actions - Improved layout */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting || isUploading}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              mode === 'create' ? 'Create Event' : 'Update Event'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
} 