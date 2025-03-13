import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { FileIcon, ImageIcon } from 'lucide-react'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'All Media | Gallery | Cloud Burst',
  description: 'View all media across your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function AllMediaPage() {
  // Get server-side supabase instance
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/gallery/all')

    // Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', session.user.id)
    
    if (eventsError) throw eventsError
    
    if (!events || events.length === 0) {
      return (
        <div style={{ width: '100%', padding: '24px' }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>All Media</h1>
            <p style={{ color: 'var(--muted-foreground)' }}>
              View all photos and media across your events
            </p>
          </div>
          
          <Card className="border-border/40 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileIcon className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Media Found</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-md">
                  You don't have any media yet. Create an event and upload photos to get started.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // Get all photos from user's events
    const eventIds = events.map(event => event.id)
    const { data: photosData, error: photosError } = await supabase
      .from('photos')
      .select('*, event:event_id(id, name, date)')
      .in('event_id', eventIds)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
    
    if (photosError) throw photosError
    
    // Map the Supabase response to our Photo type
    const photos = photosData.map(photo => {
      const { event, ...photoData } = photo;
      return {
        ...photoData,
        event: event ? {
          id: event.id,
          name: event.name,
          date: event.date
        } : undefined
      };
    });
    
    return (
      <div style={{ width: '100%', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>All Media</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            {photos.length > 0
              ? `Showing ${photos.length} photos across all your events`
              : 'No photos found across your events'
            }
          </p>
        </div>
        
        <Card className="border-border/40 shadow-sm">
          <CardContent className="pt-6">
            <GalleryGrid 
              photos={photos}
              layout="grid"
              emptyMessage="No photos found. Upload photos to your events to see them here."
              showEventName={true}
            />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error('Error loading all media:', error)
    return (
      <div style={{ width: '100%', padding: '24px' }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Error Loading Media</h1>
          <p style={{ color: 'var(--muted-foreground)' }}>
            There was an error loading your media. Please try again later.
          </p>
        </div>
      </div>
    )
  }
} 