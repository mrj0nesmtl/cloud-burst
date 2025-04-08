"use client"

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Calendar, Camera, ExternalLink, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { GallerySettings } from '@/types/gallery'
import { cn } from '@/lib/utils'

export interface GalleryEventCardProps {
  id: string
  eventId: string
  name: string
  date?: string
  thumbnailUrl?: string
  logoUrl?: string
  photoCount: number
  status?: string
  settings?: Partial<GallerySettings>
  organizerId?: string
  className?: string
}

export function GalleryEventCard({
  id,
  eventId,
  name,
  date,
  thumbnailUrl,
  logoUrl,
  photoCount,
  status = 'draft',
  settings = { layout: 'grid', useLogoAsThumbnail: false },
  className
}: GalleryEventCardProps) {
  // Determine which image to use as thumbnail
  const imageUrl = settings?.useLogoAsThumbnail && logoUrl ? logoUrl : thumbnailUrl

  // Format the date if available
  const formattedDate = date ? format(new Date(date), 'MMM d, yyyy') : 'No date set'
  
  // Determine status badge color
  const statusColor = 
    status?.toLowerCase() === 'draft' ? 'bg-amber-500/20 text-amber-500 hover:bg-amber-500/20' :
    status?.toLowerCase() === 'live' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/20' :
    status?.toLowerCase() === 'completed' ? 'bg-blue-500/20 text-blue-500 hover:bg-blue-500/20' :
    'bg-orange-500/20 text-orange-500 hover:bg-orange-500/20';

  return (
    <Card className={cn(
      "group overflow-hidden border bg-card shadow-sm hover:shadow-md flex flex-col w-full max-w-full",
      className
    )}>
      {/* Image Container with 4:3 Aspect Ratio */}
      <div className="relative bg-muted w-full aspect-[4/3]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name || 'Event gallery'}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Calendar className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
        
        {/* Date badge */}
        {date && (
          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
            {formattedDate}
          </div>
        )}
        
        {/* Bottom gradient and title */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-3">
            <h3 className="font-medium text-sm sm:text-base text-white mb-1 line-clamp-1">
              {name || 'Unnamed Event'}
            </h3>
            <div className="flex items-center">
              <div className="bg-black/40 backdrop-blur-sm text-white/90 text-xs px-2 py-1 rounded-full flex items-center">
                <Camera className="h-3 w-3 mr-1" />
                {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-2 sm:p-3 md:p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex flex-wrap items-center justify-between mb-2 sm:mb-3 gap-1 sm:gap-2">
            <div className="flex items-center text-xs text-muted-foreground">
              <Settings className="mr-1 h-3 w-3" />
              {settings?.layout || 'Grid'} Layout
            </div>
            <Badge className={`px-1.5 py-0.5 text-xs ${statusColor}`} variant="outline">
              {status || 'Draft'}
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-2 mt-2 sm:mt-3">
          <Button className="w-full text-xs sm:text-sm h-8" variant="default" size="sm" asChild>
            <Link href={`/protected/gallery/events/${eventId}`} prefetch={false}>
              <ExternalLink className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">View Gallery</span>
            </Link>
          </Button>
          <Button className="w-full text-xs sm:text-sm h-8" variant="outline" size="sm" asChild>
            <Link href={`/protected/gallery/events/${id}/settings`}>
              <Settings className="mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
              <span className="whitespace-nowrap">Settings</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 