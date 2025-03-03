"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createEvent } from '@/lib/supabase/events'
import { toast } from 'sonner'
import { CalendarDays, MapPin, Users, Image, Lock, Globe, Info } from 'lucide-react'

export function EventForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
    status: 'draft',
    max_attendees: '',
    is_public: false,
    cover_image_url: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Format the data for the API
      const eventData = {
        ...formData,
        max_attendees: formData.max_attendees ? parseInt(formData.max_attendees) : null
      }
      
      await createEvent(eventData)

      toast.success('Event created successfully!')
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
    <form onSubmit={handleSubmit}>
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="basic">Basic Information</TabsTrigger>
          <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Event Name</Label>
              <Input 
                id="name" 
                placeholder="Enter event name" 
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Event Date</Label>
              <Input 
                id="date" 
                type="datetime-local" 
                value={formData.date}
                onChange={handleChange}
                required
              />
              <p className="text-sm text-muted-foreground">
                <CalendarDays className="inline-block mr-1 h-3 w-3" />
                Set the date and time of your event
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input 
                id="location" 
                placeholder="Enter event location" 
                value={formData.location}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                <MapPin className="inline-block mr-1 h-3 w-3" />
                Where will the event take place?
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter event description" 
                value={formData.description}
                onChange={handleChange}
                className="min-h-[120px]"
              />
              <p className="text-sm text-muted-foreground">
                <Info className="inline-block mr-1 h-3 w-3" />
                Provide details about your event
              </p>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <div className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="status">Event Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Draft events are not visible to the public
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="max_attendees">Maximum Attendees</Label>
              <Input 
                id="max_attendees" 
                type="number" 
                placeholder="Leave empty for unlimited" 
                value={formData.max_attendees}
                onChange={handleChange}
                min="1"
              />
              <p className="text-sm text-muted-foreground">
                <Users className="inline-block mr-1 h-3 w-3" />
                Set a limit for the number of attendees
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="cover_image_url">Cover Image URL</Label>
              <Input 
                id="cover_image_url" 
                placeholder="https://example.com/image.jpg" 
                value={formData.cover_image_url}
                onChange={handleChange}
              />
              <p className="text-sm text-muted-foreground">
                <Image className="inline-block mr-1 h-3 w-3" />
                Add a cover image for your event
              </p>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_public">Public Event</Label>
                <p className="text-sm text-muted-foreground">
                  {formData.is_public ? (
                    <>
                      <Globe className="inline-block mr-1 h-3 w-3" />
                      Anyone can view this event
                    </>
                  ) : (
                    <>
                      <Lock className="inline-block mr-1 h-3 w-3" />
                      Only invited attendees can view this event
                    </>
                  )}
                </p>
              </div>
              <Switch 
                id="is_public"
                checked={formData.is_public}
                onCheckedChange={(checked) => handleSwitchChange('is_public', checked)}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-6 flex justify-end">
        <Button type="button" variant="outline" className="mr-2" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Event'}
        </Button>
      </div>
    </form>
  )
} 