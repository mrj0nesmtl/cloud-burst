"use client"

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { UploadWithTags } from '@/components/gallery/upload-with-tags'
import { usePhotosStore } from '@/store/photos-store'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EventUploadPage() {
  const params = useParams<{ id: string }>()
  const eventId = params.id
  const { fetchEventPhotos } = usePhotosStore()
  const [suggestedTags, setSuggestedTags] = useState<string[]>([
    'portrait', 'group', 'landscape', 'action', 'candid', 
    'food', 'decoration', 'venue', 'entertainment', 'ceremony'
  ])
  
  // Handle upload complete
  const handleUploadComplete = () => {
    // Refresh the photos list
    fetchEventPhotos(eventId)
  }
  
  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/events/${eventId}/gallery`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Upload Photos</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add Photos to Event</CardTitle>
          <CardDescription>
            Upload your photos and add tags to help others find them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UploadWithTags
            eventId={eventId}
            onUploadComplete={handleUploadComplete}
            suggestedTags={suggestedTags}
          />
        </CardContent>
      </Card>
    </div>
  )
}
