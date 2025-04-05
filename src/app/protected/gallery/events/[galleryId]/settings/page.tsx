import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GallerySettingsForm } from '@/components/gallery/gallery-settings-form'
import { Settings } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Gallery Settings | Cloud Burst',
  description: 'Customize gallery settings for your event',
}

export default async function GallerySettingsPage({ params }: { params: { galleryId: string } }) {
  const { galleryId } = params
  
  if (!galleryId) {
    return notFound()
  }
  
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Check session
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin?returnTo=/protected/gallery/events')
  }
  
  // Get gallery
  const { data: gallery, error: galleryError } = await supabase
    .from('galleries')
    .select('*, events(*)')
    .eq('id', galleryId)
    .single()
  
  if (galleryError || !gallery) {
    console.error('Error fetching gallery:', galleryError)
    return notFound()
  }
  
  // Check if the user has access to this gallery
  const { data: event } = await supabase
    .from('events')
    .select('organizer_id')
    .eq('id', gallery.event_id)
    .single()
  
  if (!event || event.organizer_id !== session.user.id) {
    return (
      <div style={{ 
        width: '100%', 
        padding: '24px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You do not have permission to access this gallery.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }
  
  // Event name from the joined events table
  const eventName = gallery.events?.name || 'Event Gallery'
  
  return (
    <div style={{ 
      width: '100%', 
      padding: '24px',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <Card style={{
        border: '1px solid var(--border)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        background: 'var(--background)',
        overflow: 'hidden'
      }}>
        <CardHeader style={{ padding: '24px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '12px'
          }}>
            <Settings className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-2xl">{eventName} Settings</CardTitle>
              <CardDescription>Customize how your gallery looks and behaves</CardDescription>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent style={{ padding: '24px' }}>
          <GallerySettingsForm gallery={gallery} />
        </CardContent>
      </Card>
    </div>
  )
} 