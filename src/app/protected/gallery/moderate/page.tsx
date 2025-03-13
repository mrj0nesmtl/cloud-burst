import { Metadata } from 'next'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserRoundCheck, ShieldAlert, CheckCircle2, XCircle, ImageIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Moderation | Gallery | Cloud Burst',
  description: 'Moderate photos for your events',
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
              Manage and approve photos submitted to your events
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShieldAlert className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Events Found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-md">
                You don't have any events yet. Create an event to start moderating photos.
              </p>
            </div>
          </CardContent>
        </Card>
      )
    }
    
    // Get all pending photos from user's events
    const eventIds = events.map(event => event.id)
    const { data: pendingPhotos, error: pendingError } = await supabase
      .from('photos')
      .select('*, event:event_id(name)')
      .in('event_id', eventIds)
      .eq('is_approved', false)
      .order('created_at', { ascending: false })
    
    if (pendingError) throw pendingError
    
    // Get all approved photos from user's events
    const { data: approvedPhotos, error: approvedError } = await supabase
      .from('photos')
      .select('*, event:event_id(name)')
      .in('event_id', eventIds)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })
      .limit(50) // Limit to recent ones
    
    if (approvedError) throw approvedError
    
    return (
      <Card className="border-border/40 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <UserRoundCheck className="mr-2 h-5 w-5 text-primary" />
            Moderation
          </CardTitle>
          <CardDescription>
            Manage and approve photos submitted to your events
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="pending" className="relative">
                Pending
                {pendingPhotos.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                    {pendingPhotos.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              {pendingPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Pending Photos</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    There are no photos waiting for your approval.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Here you'd render a component to display and moderate each pending photo */}
                  {/* This would include approve/reject actions, which would need client components */}
                  {pendingPhotos.map((photo) => (
                    <div key={photo.id} className="relative group overflow-hidden rounded-lg border bg-card shadow-sm">
                      <div className="relative aspect-square bg-muted">
                        {/* You would add the moderation component here */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Photo ID: {photo.id}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium">From: {photo.event?.name || 'Unknown Event'}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded: {new Date(photo.created_at).toLocaleDateString()}
                        </p>
                        <div className="mt-3 flex space-x-2">
                          <button className="flex-1 flex items-center justify-center rounded-md bg-green-500/10 text-green-500 py-1 text-xs font-medium">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approve
                          </button>
                          <button className="flex-1 flex items-center justify-center rounded-md bg-destructive/10 text-destructive py-1 text-xs font-medium">
                            <XCircle className="mr-1 h-3 w-3" />
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="approved">
              {approvedPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Approved Photos</h3>
                  <p className="mt-1 text-sm text-muted-foreground max-w-md">
                    You haven't approved any photos yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {/* Here you'd render recently approved photos */}
                  {approvedPhotos.map((photo) => (
                    <div key={photo.id} className="relative group overflow-hidden rounded-lg border bg-card shadow-sm">
                      <div className="relative aspect-square bg-muted">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">Photo ID: {photo.id}</p>
                        </div>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium">From: {photo.event?.name || 'Unknown Event'}</p>
                        <p className="text-xs text-muted-foreground">
                          Approved: {new Date(photo.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
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