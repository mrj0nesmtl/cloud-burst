import { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, User, Check, X, Eye } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getPhotoUrl } from '@/app/lib/photos-client'

export const metadata: Metadata = {
  title: 'All Photos | Admin | Cloud Burst',
  description: 'Manage all photos in the system',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPhotosPage() {
  // Get user role from Supabase
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user?.id)
    .single()
  
  const isAdmin = profile?.role === 'super_admin' || profile?.role === 'admin'
  
  // Redirect if not admin
  if (!isAdmin) {
    redirect('/protected/dashboard')
  }
  
  // Fetch all photos with event and uploader info
  const { data: photos } = await supabase
    .from('photos')
    .select(`
      *,
      events:event_id (
        id,
        name,
        date
      ),
      profiles:uploaded_by (
        id,
        email,
        full_name
      )
    `)
    .order('created_at', { ascending: false })
  
  // Transform data
  const transformedPhotos = photos?.map(photo => ({
    ...photo,
    event: photo.events,
    uploader: photo.profiles,
    url: getPhotoUrl(photo.storage_path)
  })) || []
  
  // Group photos by approval status
  const approvedPhotos = transformedPhotos.filter(photo => photo.is_approved)
  const pendingPhotos = transformedPhotos.filter(photo => !photo.is_approved)
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">All Photos</h1>
          <p className="text-muted-foreground">
            Admin view of all photos in the system
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search photos..."
              className="w-[200px] sm:w-[300px] pl-8"
            />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">{transformedPhotos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved
            <Badge variant="secondary" className="ml-2">{approvedPhotos.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            <Badge variant="secondary" className="ml-2">{pendingPhotos.length}</Badge>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="space-y-4">
          <PhotoGrid photos={transformedPhotos} />
        </TabsContent>
        
        <TabsContent value="approved" className="space-y-4">
          <PhotoGrid photos={approvedPhotos} />
        </TabsContent>
        
        <TabsContent value="pending" className="space-y-4">
          <PhotoGrid photos={pendingPhotos} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function PhotoGrid({ photos }: { photos: any[] }) {
  if (photos.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground py-8">No photos found in this category.</p>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={photo.url}
              alt={photo.filename || 'Photo'}
              fill
              className="object-cover"
            />
            <div className="absolute top-2 right-2">
              {photo.is_approved ? (
                <Badge className="bg-green-500">Approved</Badge>
              ) : (
                <Badge variant="outline" className="bg-background/80">Pending</Badge>
              )}
            </div>
          </div>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">
                  {photo.filename || 'Untitled'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(photo.created_at)}
                </div>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <User className="mr-1 h-3.5 w-3.5" />
                <span className="truncate">
                  {photo.uploader?.full_name || photo.uploader?.email || 'Unknown'}
                </span>
              </div>
              
              <div className="flex items-center text-xs text-muted-foreground">
                <Link 
                  href={`/protected/events/${photo.event_id}`}
                  className="truncate hover:text-blue-500 transition-colors"
                >
                  {photo.event?.name || 'Unknown Event'}
                </Link>
              </div>
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t">
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0" asChild>
                    <Link href={photo.url} target="_blank">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Link>
                  </Button>
                  
                  {!photo.is_approved && (
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-green-500 hover:text-green-500">
                      <Check className="h-4 w-4" />
                      <span className="sr-only">Approve</span>
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-red-500 hover:text-red-500">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Reject/Delete</span>
                  </Button>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {photo.width && photo.height ? `${photo.width}×${photo.height}` : ''}
                  {photo.size && (
                    <span className="ml-2">
                      {Math.round(photo.size / 1024)} KB
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
} 