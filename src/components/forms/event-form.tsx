"use client"

import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Upload, X, ImageIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Form schema with all validations
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Event name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: "Event date is required.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
  max_attendees: z.coerce.number().optional(),
  is_public: z.boolean().default(false),
  cover_image_url: z.string().url().optional().or(z.literal("")),
  thumbnail_image: z.any().optional(),
  custom_url: z.string().optional(),
})

// Types for our form data
type FormData = z.infer<typeof formSchema>

export function EventForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [customUrl, setCustomUrl] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  
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

  // Form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      status: "draft",
      max_attendees: 100,
      is_public: false,
      cover_image_url: "",
      custom_url: "",
    },
  })

  // Generate a URL-friendly slug from the event name
  useEffect(() => {
    const name = form.watch("name")
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove special chars
        .replace(/\s+/g, "-") // Replace spaces with hyphens
        .replace(/-+/g, "-") // Remove consecutive hyphens
      
      // Update the custom URL field automatically if it hasn't been manually edited
      if (!customUrl || customUrl === "") {
        form.setValue("custom_url", slug)
        setCustomUrl(slug)
      }
    }
  }, [form.watch("name")])

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
    
    // Update form value
    form.setValue('thumbnail_image', file)
  }

  // Clear the thumbnail
  const clearThumbnail = () => {
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview)
    }
    setThumbnailPreview(null)
    setThumbnailFile(null)
    form.setValue('thumbnail_image', undefined)
  }

  // Handle form submission
  async function onSubmit(data: FormData) {
    if (!isPreviewMode) {
      // Switch to preview mode instead of submitting
      setIsPreviewMode(true)
      return
    }
    
    // If in preview mode, proceed with actual submission
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      // Ensure user exists before proceeding
      if (!user) {
        throw new Error("User not authenticated")
      }
      
      const userId = user.id
      
      // Upload thumbnail if exists
      let thumbnailUrl = ""
      if (thumbnailFile) {
        const timestamp = new Date().getTime()
        const fileExtension = thumbnailFile.name.split('.').pop()
        const filePath = `event-thumbnails/${timestamp}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-assets')
          .upload(filePath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          })
          
        if (uploadError) {
          console.error("Error uploading thumbnail:", uploadError)
          throw new Error("Failed to upload thumbnail image")
        }
        
        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('event-assets')
          .getPublicUrl(filePath)
          
        thumbnailUrl = publicUrl
      }
      
      // Create event with user ID
      const { data: response, error } = await supabase
        .from("events")
        .insert({
          name: data.name,
          description: data.description || "",
          date: data.date.toISOString(),
          location: data.location,
          status: data.status,
          max_attendees: data.max_attendees || null,
          is_public: data.is_public,
          cover_image_url: thumbnailUrl || data.cover_image_url || null,
          custom_url: data.custom_url || null,
          user_id: userId,
          created_by: userId,
          organizer_id: userId,
          qr_code_url: ""
        } as any)
        .select("id")
        .single()
      
      if (error) {
        throw error
      }
      
      // Get the new event ID
      const eventId = (response as any).id as string
      
      if (!eventId) {
        throw new Error("Failed to get event ID")
      }
      
      // Update the event with the QR code URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=https%3A%2F%2Fcb-beta.replit.app%2Fevents%2F${eventId}%2Fgallery&size=300x300&margin=10`
      
      // Use a complete type assertion to avoid TypeScript errors
      await supabase
        .from("events")
        .update({ 
          qr_code_url: qrCodeUrl 
        } as any)
        .match({ id: eventId } as any)
      
      // Create gallery for the event
      const { error: galleryError } = await supabase
        .from("galleries")
        .insert({
          event_id: eventId,
          name: `${data.name} Gallery`,
          description: `Gallery for ${data.name}`,
          settings: {
            layout: "grid",
            allowUploads: true,
            allowedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
            maxUploadSize: 10 * 1024 * 1024, // 10MB
            requireApproval: true
          }
        } as any)
      
      if (galleryError) {
        console.error("Error creating gallery:", galleryError)
        // Continue despite gallery error
      }
      
      toast.success("Event created successfully!")
      
      // Give database a moment to process all writes before redirecting
      // Increased timeout to ensure database consistency and force a full page refresh
      // rather than client-side navigation to ensure all data is refreshed
      setTimeout(() => {
        // Hard redirect to force complete data refetch from all sources
        window.location.href = "/protected/dashboard"
      }, 2000)
      
    } catch (error) {
      console.error("Error creating event:", error)
      toast.error("Failed to create event. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Function to exit preview mode and return to edit mode
  const exitPreview = () => {
    setIsPreviewMode(false)
  }

  // Render a read-only preview of the form data
  if (isPreviewMode) {
    const formData = form.getValues()
    
    return (
      <div className="w-full">
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-4 mb-6">
          <h3 className="text-amber-800 dark:text-amber-300 font-medium flex items-center gap-2 text-sm">
            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 9v4"></path>
              <path d="M12 16h.01"></path>
              <path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18z"></path>
            </svg>
            Preview Mode
          </h3>
          <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">
            This is a preview of your event. Review all details before creating the event.
          </p>
        </div>
        
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr", 
          gap: "24px", 
          marginBottom: "32px" 
        }}>
          {/* Main Event Information Preview */}
          <div style={{ width: "100%" }}>
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-6">{formData.name}</h3>
                
                <div className="space-y-6">
                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", 
                    gap: isMobile ? "16px" : "24px" 
                  }}>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                      <p className="text-base font-medium">{formData.date ? format(formData.date, "PPP") : "No date selected"}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                      <p className="text-base font-medium break-words">{formData.location}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="whitespace-pre-line text-base break-words">{formData.description || "No description provided"}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Event URL</h4>
                    <p className="text-primary text-base font-medium break-all">{process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-beta.replit.app'}/events/{formData.custom_url || ""}</p>
                  </div>
                  
                  {thumbnailPreview && (
                    <div className="space-y-3 pt-1">
                      <h4 className="text-sm font-medium text-muted-foreground">Event Thumbnail</h4>
                      <div className="relative w-full max-w-full sm:max-w-[350px] h-[220px] rounded-md overflow-hidden border border-border">
                        <Image 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Event Settings Preview */}
          <div style={{ width: "100%" }}>
            <Card className="h-full">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Event Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                    <div className="flex items-center mt-1">
                      <span className={`h-2 w-2 rounded-full mr-2 ${
                        formData.status === 'draft' ? 'bg-amber-500' : 
                        formData.status === 'published' ? 'bg-green-500' : 'bg-gray-500'
                      }`}></span>
                      <span className="capitalize">{formData.status}</span>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Maximum Attendees</h4>
                    <p className="font-medium">{formData.max_attendees || "Unlimited"}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Visibility</h4>
                    <p className="font-medium">{formData.is_public ? "Public event" : "Private event"}</p>
                  </div>
                  
                  <div className="pt-4">
                    <div className="bg-muted/50 rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Auto-Created Resources</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M8 11l0 5"></path>
                            <path d="M8 8l0 .01"></path>
                            <path d="M12 16l0 -5"></path>
                            <path d="M16 16v-3a2 2 0 0 0 -4 0"></path>
                          </svg>
                          <span>Event QR Code</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 8h.01"></path>
                            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"></path>
                            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"></path>
                            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"></path>
                          </svg>
                          <span>Event Gallery</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 flex-shrink-0 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 3a1 1 0 0 1 1 1v4.535l3.928 -2.267a1 1 0 0 1 1.366 .366l1 1.732a1 1 0 0 1 -.366 1.366l-3.927 2.268l3.927 2.269a1 1 0 0 1 .366 1.366l-1 1.732a1 1 0 0 1 -1.366 .366l-3.928 -2.269v4.536a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-4.536l-3.928 2.268a1 1 0 0 1 -1.366 -.366l-1 -1.732a1 1 0 0 1 .366 -1.366l3.927 -2.268l-3.927 -2.268a1 1 0 0 1 -.366 -1.366l1 -1.732a1 1 0 0 1 1.366 -.366l3.928 2.267v-4.535a1 1 0 0 1 1 -1h2z"></path>
                          </svg>
                          <span>Invitation System</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Preview Actions */}
        <div className="flex justify-end border-t border-border pt-6">
          <div className="flex gap-3 items-center">
            <Button variant="outline" type="button" onClick={exitPreview}>
              Back to Edit
            </Button>
            <Button 
              type="button" 
              disabled={isSubmitting} 
              className="min-w-[120px]"
              onClick={() => onSubmit(formData)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Event"
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} style={{ width: '100%' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : (isTablet ? '1fr 1fr' : '2fr 1fr'),
          gap: '24px',
          marginBottom: '32px'
        }}>
          {/* Main Event Information */}
          <div className="lg:col-span-2">
            <Card style={{ 
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'var(--background)'
            }}>
              <CardContent style={{ padding: '24px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">1</span>
                    Event Details
                  </h3>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '20px'
                  }}>
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                          <FormLabel>Event Name <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Event Date <span className="text-destructive">*</span></FormLabel>
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
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <Input placeholder="Enter event location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter event description" 
                              className="resize-none min-h-[120px]" 
                              {...field} 
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                
                <div style={{ marginTop: '32px' }}>
                  <Separator style={{ margin: '20px 0' }} />
                  
                  <h3 style={{ 
                    fontSize: '16px',
                    fontWeight: '600',
                    marginBottom: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">2</span>
                    Customization
                  </h3>
                  
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: '20px'
                  }}>
                    <FormItem style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                      <FormLabel>Event Thumbnail</FormLabel>
                      <div className="space-y-4">
                        {/* Thumbnail preview */}
                        {thumbnailPreview ? (
                          <div className="relative w-full max-w-[300px] h-[200px] rounded-md overflow-hidden border border-border">
                            <Image 
                              src={thumbnailPreview} 
                              alt="Thumbnail preview" 
                              fill 
                              className="object-cover"
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-2 right-2 h-8 w-8 rounded-full"
                              onClick={clearThumbnail}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center w-full max-w-[300px] h-[200px] rounded-md border border-dashed border-border bg-muted/50">
                            <div className="flex flex-col items-center gap-2">
                              <ImageIcon className="h-10 w-10 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">No thumbnail uploaded</p>
                            </div>
                          </div>
                        )}
                        
                        {/* Upload button */}
                        <div className="flex gap-3">
                          <Button 
                            type="button" 
                            variant="outline" 
                            onClick={() => document.getElementById('thumbnail-upload')?.click()}
                            disabled={isSubmitting}
                            className="relative cursor-pointer"
                          >
                            <Upload className="mr-2 h-4 w-4" />
                            {thumbnailPreview ? 'Change Thumbnail' : 'Upload Thumbnail'}
                            <input
                              id="thumbnail-upload"
                              type="file"
                              accept="image/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                              onChange={handleThumbnailUpload}
                            />
                          </Button>
                          
                          {thumbnailPreview && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={clearThumbnail}
                              disabled={isSubmitting}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Remove
                            </Button>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          Upload a thumbnail image for your event. This will be displayed on the event gallery page and across the platform.
                        </p>
                      </div>
                    </FormItem>
                    
                    <FormField
                      control={form.control}
                      name="cover_image_url"
                      render={({ field }) => (
                        <FormItem style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                          <FormLabel>Cover Image URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://example.com/image.jpg" 
                              {...field} 
                              value={field.value || ""}
                              disabled={!!thumbnailPreview}
                            />
                          </FormControl>
                          <FormDescription>
                            {thumbnailPreview 
                              ? "This field is disabled because you've uploaded a thumbnail image"
                              : "Alternatively, provide a URL to an image that represents your event"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="custom_url"
                      render={({ field }) => (
                        <FormItem style={{ gridColumn: isMobile ? 'span 1' : 'span 2' }}>
                          <FormLabel>Custom URL</FormLabel>
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground text-sm">{process.env.NEXT_PUBLIC_SITE_URL || 'https://cb-beta.replit.app'}/events/</span>
                            <FormControl>
                              <Input 
                                className="max-w-sm" 
                                placeholder="my-awesome-event" 
                                {...field} 
                                onChange={(e) => {
                                  field.onChange(e)
                                  setCustomUrl(e.target.value)
                                }}
                                value={field.value || ""}
                              />
                            </FormControl>
                          </div>
                          <FormDescription>
                            Create a custom URL for easier sharing
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Event Settings */}
          <div className="lg:col-span-1">
            <Card style={{ 
              border: '1px solid var(--border)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              background: 'var(--background)'
            }}>
              <CardContent style={{ padding: '24px' }}>
                <h3 style={{ 
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-medium">3</span>
                  Event Settings
                </h3>
                
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a status" />
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
                                Published
                              </div>
                            </SelectItem>
                            <SelectItem value="archived">
                              <div className="flex items-center">
                                <span className="h-2 w-2 rounded-full bg-gray-500 mr-2"></span>
                                Archived
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="max_attendees"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Attendees</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseInt(e.target.value))}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="is_public"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Public Event</FormLabel>
                          <FormDescription>
                            Make this event visible to the public in listings and searches
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <div className="pt-6">
                    <div className="bg-muted/50 rounded-md p-4">
                      <h4 className="font-medium text-sm mb-2">Auto-Created Resources</h4>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4m0 2a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2z"></path>
                            <path d="M8 11l0 5"></path>
                            <path d="M8 8l0 .01"></path>
                            <path d="M12 16l0 -5"></path>
                            <path d="M16 16v-3a2 2 0 0 0 -4 0"></path>
                          </svg>
                          Event QR Code
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M15 8h.01"></path>
                            <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z"></path>
                            <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5"></path>
                            <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3"></path>
                          </svg>
                          Event Gallery
                        </li>
                        <li className="flex items-center gap-2">
                          <svg className="h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 3a1 1 0 0 1 1 1v4.535l3.928 -2.267a1 1 0 0 1 1.366 .366l1 1.732a1 1 0 0 1 -.366 1.366l-3.927 2.268l3.927 2.269a1 1 0 0 1 .366 1.366l-1 1.732a1 1 0 0 1 -1.366 .366l-3.928 -2.269v4.536a1 1 0 0 1 -1 1h-2a1 1 0 0 1 -1 -1v-4.536l-3.928 2.268a1 1 0 0 1 -1.366 -.366l-1 -1.732a1 1 0 0 1 .366 -1.366l3.927 -2.268l-3.927 -2.268a1 1 0 0 1 -.366 -1.366l1 -1.732a1 1 0 0 1 1.366 -.366l3.928 2.267v-4.535a1 1 0 0 1 1 -1h2z"></path>
                          </svg>
                          Invitation System
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Form Actions */}
        <div className="flex justify-end border-t border-border pt-6">
          <div className="flex gap-3 items-center">
            <Button variant="outline" type="button" onClick={() => router.push('/protected/events/manage')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Preview Event"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
} 