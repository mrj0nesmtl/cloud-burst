import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GalleryGrid } from '@/components/gallery/gallery-grid'
import { UploadDropzone } from '@/components/gallery/upload-dropzone'
import { getEvent } from '@/lib/supabase/events'
import { getApprovedEventPhotos } from '@/lib/supabase/photos'
import { formatDate } from '@/lib/utils'
import { CalendarDays, MapPin, ArrowLeft, Upload, Camera, Share2 } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface GalleryPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: GalleryPageProps): Promise<Metadata> {
  try {
    const event = await getEvent(params.id)
    
    return {
      title: `${event.name} Gallery | Cloud Burst`,
      description: `Photo gallery for ${event.name}`,
      openGraph: {
        title: `${event.name} Gallery | Cloud Burst`,
        description: `View and share photos from ${event.name}`,
        type: 'website'
      }
    }
  } catch (error) {
    return {
      title: 'Gallery Not Found | Cloud Burst',
      description: 'The requested gallery could not be found.'
    }
  }
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  try {
    // Fetch event data
    const event = await getEvent(params.id)
    
    // Check if event is published and public
    if (event.status !== 'published' || !event.is_public) {
      notFound()
    }
    
    // Fetch approved photos
    const photos = await getApprovedEventPhotos(params.id)
    
    return (
      <div className="bg-background min-h-screen">
        {/* Event Header */}
        <div className="relative">
          {event.cover_image_url && (
            <div className="absolute inset-0 h-[300px] md:h-[400px]">
              <Image
                src={event.cover_image_url}
                alt={event.name}
                fill
                className="object-cover opacity-20"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/90 to-background" />
            </div>
          )}
          
          <div className="container mx-auto px-4 pt-8 pb-12 relative">
            <div className="mb-6">
              <Button variant="ghost" size="sm" className="group" asChild>
                <Link href="/events">
                  <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Events
                </Link>
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{event.name}</h1>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center text-muted-foreground">
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {formatDate(event.date)}
                  </div>
                  
                  {event.location && (
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="mr-2 h-4 w-4" />
                      {event.location}
                    </div>
                  )}
                </div>
                
                {event.description && (
                  <p className="text-muted-foreground max-w-2xl mb-6">
                    {event.description}
                  </p>
                )}
                
                <div className="flex flex-wrap gap-3">
                  <Button className="bg-blue-500 hover:bg-blue-600" asChild>
                    <a href="#upload">
                      <Upload className="mr-2 h-4 w-4" />
                      Contribute Photos
                    </a>
                  </Button>
                  
                  <Button variant="outline">
                    <Share2 className="mr-2 h-4 w-4" />
                    Share Gallery
                  </Button>
                </div>
              </div>
              
              {event.cover_image_url && (
                <div className="relative w-full md:w-[300px] h-[200px] rounded-lg overflow-hidden shadow-md">
                  <Image
                    src={event.cover_image_url}
                    alt={event.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        {/* Gallery Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-2">Event Gallery</h2>
            <p className="text-muted-foreground">
              {photos.length > 0 
                ? `Browse through ${photos.length} photos from this event`
                : 'No photos available yet. Be the first to contribute!'}
            </p>
          </div>
          
          <Card className="border-border/60 shadow-sm mb-16">
            <CardContent className="p-6">
              <GalleryGrid 
                photos={photos}
                emptyMessage="No photos available yet. Check back later or contribute your own photos."
              />
            </CardContent>
          </Card>
          
          {/* Upload Section */}
          <div id="upload" className="scroll-mt-16">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="mr-2 h-5 w-5 text-blue-500" />
                  Contribute Your Photos
                </CardTitle>
                <CardDescription>
                  Share your photos from this event with other attendees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadDropzone 
                  eventId={params.id}
                  onUploadComplete={() => {}}
                />
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground border-t px-6 py-4 bg-muted/30">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-full">
                    <Camera className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-sm mb-1">Photo Submission Guidelines</p>
                    <p className="text-xs">
                      Uploaded photos will be reviewed before appearing in the gallery.
                      By uploading, you agree to share these photos with other event attendees.
                    </p>
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading gallery:', error)
    notFound()
  }
} 