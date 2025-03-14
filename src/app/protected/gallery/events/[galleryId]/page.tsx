import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save } from 'lucide-react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GallerySettingsForm } from '@/components/gallery/gallery-settings-form'
import { getGalleryForEvent, getUserGalleries } from '@/lib/supabase/galleries'
import { getEvent } from '@/lib/supabase/events.server'
import { Gallery } from '@/types/gallery'

interface GallerySettingsPageProps {
  params: {
    galleryId: string
  }
}

export default async function GallerySettingsPage({ params }: GallerySettingsPageProps) {
  const supabase = createServerComponentClient({ cookies })
  
  // Check if user is authenticated
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    redirect('/auth/signin?returnTo=/protected/gallery/events')
  }
  
  // Get the gallery
  try {
    // Get user galleries to verify access
    const userGalleries = await getUserGalleries()
    const gallery = userGalleries.find(g => g.id === params.galleryId)
    
    if (!gallery) {
      // User doesn't have access to this gallery
      redirect('/protected/gallery/events')
    }
    
    // Get the event data for the gallery
    const event = await getEvent(gallery.event_id)
    
    return (
      <div className="container py-6 space-y-6 max-w-3xl mx-auto">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-2 h-8 w-8 p-0"
            asChild
          >
            <Link href="/protected/gallery/events" aria-label="Back to galleries">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Gallery Settings</h1>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>{event.name || 'Event Gallery'}</CardTitle>
            <CardDescription>
              Configure how your event gallery looks and functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GallerySettingsForm gallery={gallery as Gallery} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading gallery settings:', error)
    return (
      <div className="container py-6">
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              There was a problem loading the gallery settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/protected/gallery/events">
                Return to Galleries
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
} 