import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRoundCheck, ShieldAlert, CheckCircle2, XCircle, ImageIcon } from 'lucide-react'
import { ModerationCard } from '@/components/media/ModerationCard'
import { ModeratorClient } from './moderator-client'
import Image from 'next/image'
import { getProxiedMediaUrl } from '@/lib/utils/media-proxy'

export const metadata: Metadata = {
  title: 'Moderation | Gallery | Cloud Burst',
  description: 'Moderate media for your events',
}

// Prevent caching and ensure fresh data
export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

export default async function ModerationPage() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  try {
    // Check session server-side
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError) throw sessionError
    if (!session) redirect('/auth/signin?returnTo=/protected/gallery/moderate')

    // Get user's events
    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', session.user.id)
    
    if (eventsError) throw eventsError
    
    if (!events || events.length === 0) {
      return (
        <Card className="border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserRoundCheck className="mr-2 h-5 w-5 text-primary" />
              Moderation
            </CardTitle>
            <CardDescription>
              Manage and approve media submitted to your events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Events Found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                You don't have any events yet. Create an event to start moderating media.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // Get all pending media from user's events
    const eventIds = events.map(event => event.id)
    const { data: pendingMedia, error: pendingError } = await supabase
      .from('media')
      .select('*, event:event_id(name)')
      .in('event_id', eventIds)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    if (pendingError) throw pendingError
    
    // Get all approved media from user's events
    const { data: approvedMedia, error: approvedError } = await supabase
      .from('media')
      .select('*, event:event_id(name)')
      .in('event_id', eventIds)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent ones
    
    if (approvedError) throw approvedError
    
    // Format media for client component
    const formattedPendingMedia = pendingMedia.map(media => ({
      id: media.id,
      event_id: media.event_id,
      title: media.title || 'Untitled',
      description: media.description || '',
      media_type: media.media_type,
      status: media.status,
      url: media.url,
      thumbnail_url: media.thumbnail_url,
      storage_path: media.storage_path,
      created_at: media.created_at,
      updated_at: media.updated_at,
      width: media.width,
      height: media.height,
      size: media.size,
      uploaded_by: media.uploaded_by,
      event_name: media.event?.name || 'Unknown Event'
    }))
    
    const formattedApprovedMedia = approvedMedia.map(media => ({
      id: media.id,
      event_id: media.event_id,
      title: media.title || 'Untitled',
      description: media.description || '',
      media_type: media.media_type,
      status: media.status,
      url: media.url,
      thumbnail_url: media.thumbnail_url,
      storage_path: media.storage_path,
      created_at: media.created_at,
      updated_at: media.updated_at,
      width: media.width,
      height: media.height,
      size: media.size,
      uploaded_by: media.uploaded_by,
      event_name: media.event?.name || 'Unknown Event'
    }))
    
    return (
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserRoundCheck className="mr-2 h-5 w-5 text-primary" />
            Moderation
          </CardTitle>
          <CardDescription>
            Manage and approve media submitted to your events
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingMedia.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {pendingMedia.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Pending Media</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    There are no media items waiting for your approval.
                  </p>
                </div>
              ) : (
                <ModeratorClient pendingMedia={formattedPendingMedia} />
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {approvedMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Approved Media</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    You haven't approved any media items yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 px-1">
                  {approvedMedia.map((media) => {
                    const thumbnailUrl = media.thumbnail_url ? getProxiedMediaUrl(media.thumbnail_url) : '';
                    const mediaUrl = media.url ? getProxiedMediaUrl(media.url) : '';
                    
                    return (
                      <Card key={media.id} className="overflow-hidden flex flex-col h-full shadow-md hover:shadow-lg transition-shadow w-full">
                        <div className="relative w-full aspect-video">
                          {(thumbnailUrl || mediaUrl) ? (
                            <Image 
                              src={thumbnailUrl || mediaUrl}
                              alt={media.title || 'Media item'} 
                              fill
                              className="object-cover transition-transform hover:scale-105" 
                              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted">
                              <ImageIcon className="h-20 w-20 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-5 flex-grow">
                          <h3 className="font-medium text-lg mb-2 truncate">{media.title || 'Untitled'}</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            From: {media.event?.name || 'Unknown Event'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Approved: {new Date(media.updated_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.error('Error loading moderation page:', error)
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <h1 className="text-xl font-bold text-destructive mb-2">Error Loading Moderation</h1>
        <p className="text-muted-foreground">
          There was an error loading the moderation page. Please try again later.
        </p>
      </div>
    )
  }
} 