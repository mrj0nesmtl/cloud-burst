"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Checkbox } from '@/components/ui/checkbox'
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
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

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
})

type FormValues = z.infer<typeof formSchema>

interface EventFormProps {
  initialData?: any
  userId: string
  mode?: 'create' | 'edit'
}

export function EventForm({ initialData, userId, mode = 'create' }: EventFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Default values
  const defaultValues: Partial<FormValues> = {
    name: initialData?.name || '',
    description: initialData?.description || '',
    date: initialData?.date ? new Date(initialData.date) : undefined,
    location: initialData?.location || '',
    is_public: initialData?.is_public ?? true,
    max_attendees: initialData?.max_attendees || undefined,
    custom_url: initialData?.custom_url || '',
  }
  
  // Initialize form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })
  
  // Submit handler
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true)
    
    try {
      const supabase = createClient()
      
      if (mode === 'create') {
        // Create new event
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
              status: 'draft',
            },
          ])
          .select()
        
        if (error) throw error
        
        toast.success('Event created successfully')
        router.push(`/protected/events/${data[0].id}`)
      } else {
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <Input placeholder="123 Main St, City, Country" {...field} />
                </FormControl>
                <FormDescription>
                  Where your event will be held.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="max_attendees"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Maximum Attendees</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="100"
                    {...field}
                    value={field.value || ''}
                    onChange={(e) => {
                      const value = e.target.value === '' ? undefined : parseInt(e.target.value, 10)
                      field.onChange(value)
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Optional: Limit the number of attendees.
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
                  <Input placeholder="my-event" {...field} value={field.value || ''} />
                </FormControl>
                <FormDescription>
                  Optional: Create a custom URL for your event.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
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
        
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Event' : 'Update Event'}
          </Button>
        </div>
      </form>
    </Form>
  )
} 