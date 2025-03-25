"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Database } from "@/types/supabase";

// Import form components
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Form schema with validation
const formSchema = z.object({
  name: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  start_date: z.date({
    required_error: "Start date is required.",
  }),
  end_date: z.date().optional(),
  location: z.string().optional(),
  cover_image: z.string().url().optional(),
  is_public: z.boolean().default(false),
  custom_url: z.string()
    .min(3, { message: "URL must be at least 3 characters." })
    .max(50, { message: "URL must be less than 50 characters." })
    .regex(/^[a-z0-9-]+$/, { 
      message: "URL can only contain lowercase letters, numbers, and hyphens." 
    })
    .optional(),
});

export default function CreateEventPage() {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      location: "",
      cover_image: "",
      is_public: false,
      custom_url: "",
    },
  });

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Generate custom_url from title if not provided
      if (!values.custom_url) {
        values.custom_url = values.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '');
      }
      
      // Check if custom_url is already taken
      const { data: existingEvent } = await supabase
        .from('events')
        .select('id')
        .eq('custom_url', values.custom_url)
        .single();
        
      if (existingEvent) {
        form.setError('custom_url', { 
          message: "This URL is already taken. Please choose another." 
        });
        setIsSubmitting(false);
        return;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to create an event");
      }
      
      // Create event
      const { data, error } = await supabase
        .from('events')
        .insert([
          {
            name: values.name,
            description: values.description,
            date: values.start_date.toISOString(),
            start_date: values.start_date.toISOString(),
            end_date: values.end_date ? values.end_date.toISOString() : null,
            location: values.location,
            cover_image_url: values.cover_image,
            is_public: values.is_public,
            user_id: user.id,
            custom_url: values.custom_url,
          },
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      // Redirect to the new event page
      if (data && data[0]) {
        router.push(`/events/${data[0].id}`);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      // Handle error state
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Create New Event</h1>
          <p className="text-muted-foreground">
            Fill out the form below to create a new event.
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                    The name of your event.
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
                      placeholder="Describe your event..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your event.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
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
                      When does your event start?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
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
                      When does your event end? (Optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Event location" {...field} />
                  </FormControl>
                  <FormDescription>
                    Where will your event take place? (Optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cover_image"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cover Image URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/image.jpg" {...field} />
                  </FormControl>
                  <FormDescription>
                    Add a cover image for your event. (Optional)
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
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        {process.env.NEXT_PUBLIC_SITE_URL || "https://cb-beta.replit.app/"}/e/
                      </div>
                      <Input 
                        {...field} 
                        placeholder="my-amazing-event" 
                        className="flex-1"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          // Convert to URL-friendly format (lowercase, hyphens instead of spaces)
                          const value = e.target.value
                            .toLowerCase()
                            .replace(/\s+/g, '-')
                            .replace(/[^a-z0-9-]/g, '');
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    Create a memorable URL for your event. Leave blank to auto-generate from title.
                    Only lowercase letters, numbers, and hyphens are allowed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
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
                      Make this event visible to everyone. If unchecked, only invited users can access it.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Event"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
} 