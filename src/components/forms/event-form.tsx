"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function EventForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    location: '',
    description: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('events')
        .insert(formData)

      if (error) throw error

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
    <form className="space-y-4" onSubmit={handleSubmit}>
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
            type="date" 
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input 
            id="location" 
            placeholder="Enter event location" 
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea 
            id="description" 
            placeholder="Enter event description" 
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <Button type="submit" className="mt-4" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Event'}
      </Button>
    </form>
  )
} 