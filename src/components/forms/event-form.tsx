"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, MapPinIcon, UsersIcon, ImageIcon, InfoIcon } from "lucide-react"

// UI Components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Types and utilities
import { createEvent } from '@/lib/supabase/events'
import { EventStatus } from '@/types/events'
import { toast } from 'sonner'
import { cn } from "@/lib/utils"
import { generateAndSaveEventQRCode } from '@/lib/qr-code'

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Event name must be at least 3 characters.",
  }),
  description: z.string().optional(),
  date: z.date({
    required_error: "Event date is required.",
  }),
  location: z.string().optional(),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']).default('draft'),
  max_attendees: z.preprocess(
    (val) => (val === '' ? undefined : Number(val)),
    z.number().positive().optional()
  ),
  is_public: z.boolean().default(false),
  cover_image_url: z.string().url().optional().or(z.literal('')),
  custom_url: z.string()
    .min(3, { message: "Custom URL must be at least 3 characters." })
    .max(50, { message: "Custom URL must be less than 50 characters." })
    .regex(/^[a-z0-9-]+$/, { 
      message: "Custom URL can only contain lowercase letters, numbers, and hyphens." 
    })
    .optional()
    .or(z.literal(''))
});

export function EventForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Initialize form with react-hook-form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      status: "draft",
      max_attendees: undefined,
      is_public: false,
      cover_image_url: "",
      custom_url: "",
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    
    try {
      // Generate custom_url from name if not provided
      if (!values.custom_url) {
        values.custom_url = values.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
      }
      
      // Format the data for the API
      const eventData = {
        name: values.name,
        description: values.description || "",
        date: values.date.toISOString(),
        location: values.location || "",
        status: values.status as EventStatus,
        max_attendees: values.max_attendees,
        is_public: values.is_public,
        cover_image_url: values.cover_image_url || "",
        custom_url: values.custom_url
      }
      
      // Create the event
      const response = await createEvent(eventData)
      
      if (response.error) {
        throw new Error(typeof response.error === 'object' && response.error !== null 
          ? (response.error as any).message || 'Failed to create event' 
          : 'Failed to create event')
      }
      
      const eventId = response.data?.id
      
      if (!eventId) {
        throw new Error('Event was created but no ID was returned')
      }
      
      // Generate and save QR code for the event
      await generateAndSaveEventQRCode(eventId)
      
      toast.success('Event created successfully! QR code has been generated.')
      router.push('/protected/events/manage')
      router.refresh()
    } catch (error) {
      console.error('Error creating event:', error)
      toast.error('Failed to create event. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" style={{ maxWidth: '100%' }}>
        <Tabs defaultValue="basic" className="w-full">
          <div className="overflow-hidden rounded-md mb-3" style={{ border: '1px solid var(--border)' }}>
            <TabsList className="w-full flex bg-muted" style={{ 
              padding: 0, 
              height: 'auto', 
              borderRadius: 0
            }}>
              <TabsTrigger 
                value="basic" 
                className="flex-1 text-xs py-2 px-2 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none"
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger 
                value="advanced" 
                className="flex-1 text-xs py-2 px-2 rounded-none data-[state=active]:bg-background data-[state=active]:shadow-none"
              >
                Advanced
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-3 mt-0">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Event Name
                  </FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Summer Wedding 2024" 
                      {...field} 
                      className="h-8 text-xs px-2" 
                    />
                  </FormControl>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    The name of your event as it will appear to attendees
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Event Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Event Date
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className="w-full h-8 px-2 text-xs justify-between font-normal"
                        >
                          {field.value ? (
                            format(field.value, "MMM d, yyyy")
                          ) : (
                            <span className="text-muted-foreground text-xs">Pick a date</span>
                          )}
                          <CalendarIcon className="h-3 w-3 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    The date when your event will take place
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Location
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <MapPinIcon className="w-3 h-3 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <Input 
                        placeholder="123 Main St, City, State" 
                        {...field} 
                        className="h-8 text-xs px-2" 
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    Where will the event take place?
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details about your event..." 
                      className="min-h-[80px] text-xs px-2 py-1.5" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="flex items-start text-[10px] text-muted-foreground">
                    <InfoIcon className="w-2.5 h-2.5 mr-1 mt-0.5 flex-shrink-0" />
                    <span>Describe your event to help attendees understand what to expect</span>
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-3 mt-0">
            {/* Event Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Event Status
                  </FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft" className="text-xs">Draft</SelectItem>
                      <SelectItem value="published" className="text-xs">Published</SelectItem>
                      <SelectItem value="completed" className="text-xs">Completed</SelectItem>
                      <SelectItem value="cancelled" className="text-xs">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    Draft events are only visible to you
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Maximum Attendees */}
            <FormField
              control={form.control}
              name="max_attendees"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Maximum Attendees
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <UsersIcon className="w-3 h-3 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <Input 
                        type="number" 
                        placeholder="Leave empty for unlimited" 
                        className="h-8 text-xs px-2"
                        {...field}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? undefined : parseInt(value));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    Limit the number of people who can attend your event
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Cover Image URL */}
            <FormField
              control={form.control}
              name="cover_image_url"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Cover Image URL
                  </FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <ImageIcon className="w-3 h-3 mr-1.5 text-muted-foreground flex-shrink-0" />
                      <Input 
                        placeholder="https://example.com/image.jpg" 
                        {...field} 
                        className="h-8 text-xs px-2"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    Add a cover image to make your event stand out
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Custom URL */}
            <FormField
              control={form.control}
              name="custom_url"
              render={({ field }) => (
                <FormItem className="space-y-1">
                  <FormLabel className="text-xs font-medium">
                    Custom URL
                  </FormLabel>
                  <FormControl>
                    <div className="flex flex-col w-full">
                      <div className="text-[10px] text-muted-foreground mb-1">cloud-burst.com/e/</div>
                      <Input 
                        placeholder="my-event" 
                        {...field} 
                        className="h-8 text-xs px-2"
                      />
                    </div>
                  </FormControl>
                  <FormDescription className="text-[10px] text-muted-foreground">
                    Create a custom URL for your event (optional)
                  </FormDescription>
                  <FormMessage className="text-[10px]" />
                </FormItem>
              )}
            />
            
            {/* Public Event Toggle */}
            <FormField
              control={form.control}
              name="is_public"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between p-2 border rounded-md">
                  <div className="space-y-0.5">
                    <FormLabel className="text-xs font-medium">Public Event</FormLabel>
                    <FormDescription className="text-[10px] text-muted-foreground">
                      {field.value
                        ? "Anyone can view and join this event"
                        : "Only invited attendees can view this event"}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="scale-75 data-[state=checked]:bg-primary"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
            className="text-xs h-7 px-2"
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="text-xs h-7 px-3"
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 