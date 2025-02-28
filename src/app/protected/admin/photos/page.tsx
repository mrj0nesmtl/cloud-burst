import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server-config'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

async function PhotoGrid() {
  const supabase = createClient()
  
  const { data: photos } = await supabase
    .from('photos')
    .select('*, events(name), profiles(username)')
    .order('created_at', { ascending: false })
    .limit(20)

  if (!photos?.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No photos found
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <Card key={photo.id} className="overflow-hidden">
          <div className="aspect-square relative">
            <Image
              src={photo.url}
              alt={photo.caption || 'Event photo'}
              fill
              className="object-cover"
            />
          </div>
          <CardContent className="p-2">
            <p className="text-sm truncate">{photo.events?.name}</p>
            <p className="text-xs text-muted-foreground">
              By {photo.profiles?.username}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default function PhotosPage() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Photo Management</CardTitle>
          <CardDescription>
            View and manage photos across all events.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-sm">
              <Input placeholder="Search photos..." type="search" />
            </div>
            <Button>Upload Photos</Button>
          </div>
          
          <Suspense fallback={<LoadingSpinner />}>
            <PhotoGrid />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
} 