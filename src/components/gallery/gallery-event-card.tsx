"use client"

import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { Calendar, Camera, ExternalLink, Settings } from 'lucide-react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ImagePlaceholder } from '@/components/ui/image-placeholder'
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
  name = 'Unnamed Event',
  date,
  thumbnailUrl,
  logoUrl,
  photoCount = 0,
  status = 'draft',
  settings = { layout: 'grid', useLogoAsThumbnail: false },
  className
}: GalleryEventCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isValidUrl, setIsValidUrl] = useState(false);
  
  // Determine which image to use as thumbnail
  const imageUrl = !imageError && settings?.useLogoAsThumbnail && logoUrl ? logoUrl : thumbnailUrl;
  
  // Validate image URL on component mount and when it changes
  useEffect(() => {
    if (!imageUrl) {
      setIsValidUrl(false);
      return;
    }
    
    // Reset error state when URL changes
    setImageError(false);
    
    // For development purposes, consider all strings that look like URLs as valid
    const isUrlLike = typeof imageUrl === 'string' && 
      (imageUrl.startsWith('http') || imageUrl.startsWith('blob:') || imageUrl.startsWith('data:'));
    
    setIsValidUrl(isUrlLike);
    
  }, [imageUrl, id]);

  // Format the date if available
  let formattedDate = 'No date set';
  try {
    if (date) {
      formattedDate = format(new Date(date), 'MMM d, yyyy');
    }
  } catch (error) {
    console.error(`Error formatting date`, error);
  }
  
  // Determine status badge color
  const statusColor = 
    status?.toLowerCase() === 'draft' ? 'bg-amber-500/20 text-amber-500' :
    status?.toLowerCase() === 'live' ? 'bg-green-500/20 text-green-500' :
    status?.toLowerCase() === 'published' ? 'bg-green-500/20 text-green-500' :
    status?.toLowerCase() === 'completed' ? 'bg-blue-500/20 text-blue-500' :
    'bg-orange-500/20 text-orange-500';

  return (
    <Card className={cn(
      "group overflow-hidden border bg-card shadow-sm hover:shadow-md transition-all duration-200",
      "flex flex-col h-full w-full",
      className
    )}>
      {/* Image Container with 4:3 Aspect Ratio */}
      <div className="relative bg-muted w-full aspect-[4/3]">
        {isValidUrl && imageUrl ? (
          <div className="relative w-full h-full">
            <Image
              src={imageUrl}
              alt={name || 'Event gallery'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={false}
              onError={() => {
                setImageError(true);
                setIsValidUrl(false);
              }}
            />
          </div>
        ) : (
          <ImagePlaceholder 
            type="event"
            title={`${name || 'Event'} Gallery`}
            iconSize={40}
          />
        )}
        
        {/* Date badge */}
        {date && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-md shadow-sm">
            {formattedDate}
          </div>
        )}
        
        {/* Bottom gradient and title */}
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/50 to-transparent">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-medium text-base sm:text-lg text-white mb-2 line-clamp-1">
              {name || 'Unnamed Event'}
            </h3>
            <div className="flex items-center">
              <div className="bg-black/50 backdrop-blur-sm text-white/90 text-xs px-2.5 py-1.5 rounded-full flex items-center shadow-sm">
                <Camera className="h-3.5 w-3.5 mr-1.5" />
                {photoCount} {photoCount === 1 ? 'Photo' : 'Photos'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Card content */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="w-full">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
              <Settings className="mr-1.5 h-3.5 w-3.5" />
              {settings?.layout || 'Grid'} Layout
            </div>
            <Badge className={`px-2 py-0.5 text-xs ${statusColor}`} variant="outline">
              {status || 'Draft'}
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <Button 
            className="w-full text-sm h-9" 
            variant="default" 
            size="sm" 
            asChild
          >
            <Link href={`/protected/gallery/events/${eventId}`} prefetch={false} className="flex items-center justify-center">
              <ExternalLink className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>View Gallery</span>
            </Link>
          </Button>
          <Button 
            className="w-full text-sm h-9" 
            variant="outline" 
            size="sm" 
            asChild
          >
            <Link href={`/protected/gallery/events/${id}/settings`} className="flex items-center justify-center">
              <Settings className="mr-2 h-4 w-4 flex-shrink-0" />
              <span>Settings</span>
            </Link>
          </Button>
        </div>
      </div>
    </Card>
  );
} 