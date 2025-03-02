'use client'

import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/use-toast'
import { createClient } from '@/lib/supabase/client'

const newsletterSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }).optional(),
})

type NewsletterFormValues = z.infer<typeof newsletterSchema>

export function NewsletterForm() {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  })

  async function onSubmit(data: NewsletterFormValues) {
    setIsLoading(true)
    
    try {
      const supabase = createClient()
      
      // Insert into newsletter_subscribers table
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({
          email: data.email,
          name: data.name || null,
          status: 'active',
          subscribed_at: new Date().toISOString(),
        })
      
      if (error) throw error
      
      toast({
        title: 'Subscription successful!',
        description: 'Thank you for subscribing to our newsletter.',
      })
      
      form.reset()
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      toast({
        title: 'Subscription failed',
        description: 'There was an error subscribing to the newsletter. Please try again.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="your@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Subscribing...' : 'Subscribe to Newsletter'}
          </Button>
        </form>
      </Form>
    </div>
  )
} 