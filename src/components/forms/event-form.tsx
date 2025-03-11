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
      const createdEvent = await createEvent(eventData)
      
      // Generate and save QR code for the event
      await generateAndSaveEventQRCode(createdEvent.id)
      
      toast.success('Event created successfully! QR code has been generated.')
      router.push(`/protected/events/${createdEvent.id}/attendees`)
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
          </TabsList>
          
          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6 pt-6">
            {/* Event Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Summer Wedding 2024" {...field} />
                  </FormControl>
                  <FormDescription>
                    The name of your event as it will appear to attendees
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Event Date */}
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
                          variant={"outline"}
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
                    The date when your event will take place
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      <MapPinIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                      <Input placeholder="123 Main St, City, State" {...field} />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Where will the event take place?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide details about your event..." 
                      className="min-h-[120px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription className="flex items-center">
                    <InfoIcon className="w-4 h-4 mr-2" />
                    Describe your event to help attendees understand what to expect
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
          
          {/* Advanced Settings Tab */}
          <TabsContent value="advanced" className="space-y-6 pt-6">
            <Card>
              <CardContent className="pt-6 space-y-6">
                {/* Event Status */}
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
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Draft events are only visible to you
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Maximum Attendees */}
                <FormField
                  control={form.control}
                  name="max_attendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <UsersIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                          <Input 
                            type="number" 
                            placeholder="Leave empty for unlimited" 
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : parseInt(value));
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Limit the number of people who can attend your event
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Cover Image URL */}
                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Image URL</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <ImageIcon className="w-4 h-4 mr-2 text-muted-foreground" />
                          <Input placeholder="https://example.com/image.jpg" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add a cover image to make your event stand out
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Custom URL */}
                <FormField
                  control={form.control}
                  name="custom_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom URL</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <span className="text-muted-foreground mr-2">cloud-burst.com/e/</span>
                          <Input placeholder="my-event" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Create a custom URL for your event (optional)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Public Event Toggle */}
                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Event</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Anyone can view and join this event"
                            : "Only invited attendees can view this event"}
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
        
        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 