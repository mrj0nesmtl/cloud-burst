import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRoundCheck, ShieldAlert, CheckCircle2, XCircle, ImageIcon } from 'lucide-react'
import { EnhancedModeratorClient } from './enhanced-moderator-client'
import { ModerationStats } from '@/components/moderation/ModerationStats'
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
    
    // Get all rejected media from user's events
    const { data: rejectedMedia, error: rejectedError } = await supabase
      .from('media')
      .select('*, event:event_id(name)')
      .in('event_id', eventIds)
      .eq('status', 'rejected')
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent ones
    
    if (rejectedError) throw rejectedError
    
    // Format media for client component
    const formatMedia = (media: any[]) => media.map(item => ({
      id: item.id,
      event_id: item.event_id,
      title: item.title || 'Untitled',
      description: item.description || '',
      media_type: item.media_type,
      status: item.status,
      url: item.url,
      thumbnail_url: item.thumbnail_url,
      storage_path: item.storage_path,
      created_at: item.created_at,
      updated_at: item.updated_at,
      width: item.width,
      height: item.height,
      size: item.size,
      uploaded_by: item.uploaded_by,
      moderation_reason: item.moderation_reason,
      moderated_at: item.moderated_at,
      moderated_by: item.moderated_by,
      event_name: item.event?.name || 'Unknown Event'
    }));
    
    const formattedPendingMedia = formatMedia(pendingMedia)
    const formattedApprovedMedia = formatMedia(approvedMedia)
    const formattedRejectedMedia = formatMedia(rejectedMedia)
    
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
          <ModerationStats 
            pendingCount={pendingMedia.length}
            approvedCount={approvedMedia.length}
            rejectedCount={rejectedMedia.length}
            className="mb-6"
          />
          
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
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
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
                <EnhancedModeratorClient 
                  mediaItems={formattedPendingMedia} 
                  tabId="pending" 
                />
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
                <EnhancedModeratorClient 
                  mediaItems={formattedApprovedMedia} 
                  tabId="approved" 
                />
              )}
            </TabsContent>
            
            <TabsContent value="rejected">
              {rejectedMedia.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <XCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Rejected Media</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    You haven't rejected any media items yet.
                  </p>
                </div>
              ) : (
                <EnhancedModeratorClient 
                  mediaItems={formattedRejectedMedia} 
                  tabId="rejected" 
                />
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