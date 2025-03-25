# Session 30: Implementation Resources
## Current Version: 0.8.1
## Last Updated: March 25, 2025, 7:00 PM
## Session: 30 - Gallery Implementation Continuation

This document provides helpful resources, code snippets, and examples for the gallery implementation in Session 30.

## Database Schema

### Media Table

```sql
CREATE TYPE media_type AS ENUM ('photo', 'video', 'audio');

CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  media_type media_type NOT NULL DEFAULT 'photo',
  title TEXT,
  description TEXT,
  storage_path TEXT NOT NULL,
  original_filename TEXT,
  content_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- For video/audio in seconds
  is_approved BOOLEAN NOT NULL DEFAULT FALSE,
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX media_event_id_idx ON media(event_id);
CREATE INDEX media_album_id_idx ON media(album_id);
CREATE INDEX media_user_id_idx ON media(user_id);
CREATE INDEX media_created_at_idx ON media(created_at);
CREATE INDEX media_media_type_idx ON media(media_type);
CREATE INDEX media_tags_idx ON media USING GIN (tags);

-- Row Level Security Policies
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Owners can do anything with their media
CREATE POLICY media_owner_policy ON media
  USING (user_id = auth.uid());

-- Event organizers can manage media for their events
CREATE POLICY media_organizer_policy ON media
  USING (
    event_id IN (
      SELECT id FROM events 
      WHERE organizer_id = auth.uid()
    )
  );

-- Event attendees can view approved media
CREATE POLICY media_attendee_view_policy ON media
  FOR SELECT
  USING (
    is_approved = TRUE AND
    event_id IN (
      SELECT event_id FROM event_attendees 
      WHERE user_id = auth.uid()
    )
  );

-- Guest upload token tracking
CREATE TABLE media_upload_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  token TEXT NOT NULL UNIQUE,
  email TEXT,
  name TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  max_uploads INTEGER DEFAULT 50,
  current_uploads INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX media_upload_tokens_token_idx ON media_upload_tokens(token);
CREATE INDEX media_upload_tokens_event_id_idx ON media_upload_tokens(event_id);
```

### Album Table

```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order TEXT DEFAULT 'created_at_desc',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index for common queries
CREATE INDEX albums_event_id_idx ON albums(event_id);
CREATE INDEX albums_created_by_idx ON albums(created_by);

-- Row Level Security Policies
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;

-- Owners can do anything with their albums
CREATE POLICY albums_owner_policy ON albums
  USING (created_by = auth.uid());

-- Event organizers can manage albums for their events
CREATE POLICY albums_organizer_policy ON albums
  USING (
    event_id IN (
      SELECT id FROM events
      WHERE organizer_id = auth.uid()
    )
  );

-- Public albums are visible to attendees
CREATE POLICY albums_public_policy ON albums
  FOR SELECT
  USING (
    is_public = TRUE AND
    event_id IN (
      SELECT event_id FROM event_attendees
      WHERE user_id = auth.uid()
    )
  );
```

## TypeScript Interfaces

### Media Types

```typescript
// src/types/media.ts
import { Database } from './supabase';

export type MediaType = 'photo' | 'video' | 'audio';

export interface Media {
  id: string;
  event_id: string;
  album_id?: string | null;
  user_id?: string | null;
  media_type: MediaType;
  title?: string | null;
  description?: string | null;
  storage_path: string;
  original_filename?: string | null;
  content_type: string;
  size_bytes: number;
  width?: number | null;
  height?: number | null;
  duration?: number | null; // For video/audio in seconds
  is_approved: boolean;
  is_featured: boolean;
  metadata: MediaMetadata;
  tags: string[];
  created_at: string;
  updated_at: string;
  url?: string; // Not stored in DB, generated when needed
  thumbnail_url?: string; // Not stored in DB, generated when needed
}

export interface MediaMetadata {
  caption?: string;
  location?: {
    latitude?: number;
    longitude?: number;
    name?: string;
  };
  camera?: {
    make?: string;
    model?: string;
  };
  exif?: {
    exposure?: string;
    aperture?: string;
    iso?: number;
    focal_length?: string;
    timestamp?: string;
  };
  colors?: string[]; // Prominent colors in the media
  [key: string]: any;
}

export interface Photo extends Media {
  media_type: 'photo';
}

export interface Video extends Media {
  media_type: 'video';
  duration: number;
  thumbnail_url: string;
}

export type DbMedia = Database['public']['Tables']['media']['Row'];
export type MediaInsert = Database['public']['Tables']['media']['Insert'];
export type MediaUpdate = Database['public']['Tables']['media']['Update'];

export interface MediaUploadResult {
  media: Media;
  url: string;
  thumbnail_url?: string;
}

export type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'size_asc' | 'size_desc';

export type FilterOption = {
  mediaType?: MediaType[];
  tags?: string[];
  dateRange?: {
    from?: Date;
    to?: Date;
  };
  approvalStatus?: 'approved' | 'unapproved' | 'all';
};

export type ViewMode = 'grid' | 'masonry' | 'list';
```

### Album Types

```typescript
// src/types/albums.ts
import { Database } from './supabase';
import { Media } from './media';

export interface Album {
  id: string;
  event_id: string;
  name: string;
  description?: string | null;
  cover_media_id?: string | null;
  created_by?: string | null;
  is_public: boolean;
  sort_order?: string | null;
  created_at: string;
  updated_at: string;
  media_count?: number; // Not stored, calculated when needed
  cover_image?: Media; // Not stored, joined when needed
}

export type DbAlbum = Database['public']['Tables']['albums']['Row'];
export type AlbumInsert = Database['public']['Tables']['albums']['Insert'];
export type AlbumUpdate = Database['public']['Tables']['albums']['Update'];
```

## Component Examples

### Media Card Component

```tsx
// src/components/gallery/MediaCard.tsx
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Share, MoreHorizontal, Play, Check } from "lucide-react";
import { cn } from '@/lib/utils';
import { Media, MediaType } from '@/types/media';

interface MediaCardProps {
  media: Media;
  aspectRatio?: 'portrait' | 'square' | 'video' | 'auto';
  width?: number;
  height?: number;
  onSelect?: (media: Media) => void;
  onView?: (media: Media) => void;
  isSelected?: boolean;
  isSelectable?: boolean;
  showActions?: boolean;
  priority?: boolean;
}

export function MediaCard({
  media,
  aspectRatio = 'auto',
  width,
  height,
  onSelect,
  onView,
  isSelected = false,
  isSelectable = false,
  showActions = true,
  priority = false
}: MediaCardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleImageLoad = () => {
    setIsLoading(false);
  };
  
  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSelect) onSelect(media);
  };
  
  const handleView = () => {
    if (onView) onView(media);
  };
  
  // Determine aspect ratio for container
  const aspectRatioClass = 
    aspectRatio === 'portrait' ? 'aspect-[3/4]' :
    aspectRatio === 'square' ? 'aspect-square' :
    aspectRatio === 'video' ? 'aspect-video' :
    `aspect-auto`;
  
  return (
    <Card 
      className={cn(
        "overflow-hidden group transition-all duration-200",
        isSelected && "ring-2 ring-primary"
      )}
      style={{ 
        width: width ? `${width}px` : 'auto', 
        height: height ? `${height}px` : 'auto' 
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleView}
    >
      <CardContent className="p-0">
        <div className={cn(
          "relative w-full", 
          aspectRatioClass
        )}>
          {/* Media preview */}
          {media.media_type === 'photo' && (
            <Image 
              src={media.url || `/api/media/${media.id}/url`}
              alt={media.title || media.original_filename || 'Photo'}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={cn(
                "object-cover transition-all duration-200",
                isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'
              )}
              onLoad={handleImageLoad}
              priority={priority}
            />
          )}
          
          {media.media_type === 'video' && (
            <>
              <Image 
                src={media.thumbnail_url || `/api/media/${media.id}/thumbnail`}
                alt={media.title || media.original_filename || 'Video'}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className={cn(
                  "object-cover transition-all duration-200",
                  isLoading ? 'scale-110 blur-sm' : 'scale-100 blur-0'
                )}
                onLoad={handleImageLoad}
                priority={priority}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/50 rounded-full p-2">
                  <Play className="h-8 w-8 text-white" />
                </div>
              </div>
            </>
          )}
          
          {/* Selection indicator */}
          {isSelectable && (
            <div 
              className={cn(
                "absolute top-2 left-2 h-6 w-6 rounded-full flex items-center justify-center border-2 transition-colors",
                isSelected 
                  ? "bg-primary border-primary" 
                  : "bg-black/30 border-white/70"
              )}
              onClick={handleSelect}
            >
              {isSelected && <Check className="h-4 w-4 text-white" />}
            </div>
          )}
          
          {/* Actions overlay */}
          {showActions && (
            <div 
              className={cn(
                "absolute inset-0 bg-black/30 flex items-end justify-between p-3 transition-opacity duration-200",
                (isHovered || isSelected) ? "opacity-100" : "opacity-0"
              )}
            >
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                >
                  <Share className="h-4 w-4" />
                </Button>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### Masonry Grid Component

```tsx
// src/components/gallery/MasonryGrid.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useResizeObserver } from '@/hooks/use-resize-observer';
import { Media } from '@/types/media';
import { MediaCard } from './MediaCard';

interface MasonryGridProps {
  items: Media[];
  columnWidth?: number;
  gap?: number;
  className?: string;
  onMediaSelect?: (media: Media) => void;
  onMediaView?: (media: Media) => void;
  selectedItems?: string[];
  isSelectable?: boolean;
}

export function MasonryGrid({
  items,
  columnWidth = 300,
  gap = 16,
  className = '',
  onMediaSelect,
  onMediaView,
  selectedItems = [],
  isSelectable = false
}: MasonryGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width: containerWidth } = useResizeObserver(containerRef);
  const [columns, setColumns] = useState(3);

  // Calculate number of columns based on container width
  useEffect(() => {
    if (!containerWidth) return;
    
    const calculatedColumns = Math.max(1, Math.floor(containerWidth / columnWidth));
    setColumns(calculatedColumns);
  }, [containerWidth, columnWidth]);

  // Distribute items into columns
  const getColumnItems = () => {
    const columnItems: Media[][] = Array.from({ length: columns }, () => []);
    
    // Simple distribution: assign to shortest column
    items.forEach((item) => {
      // Find index of shortest column
      const columnHeights = columnItems.map(column => 
        column.reduce((height, media) => {
          // Calculate approximate height based on aspect ratio
          const aspectRatio = 
            media.media_type === 'video' ? 16/9 :
            (media.width && media.height) ? media.width / media.height : 
            1; // Default to square if dimensions unknown
          
          return height + (columnWidth / aspectRatio) + gap;
        }, 0)
      );
      
      const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
      columnItems[shortestColumnIndex].push(item);
    });
    
    return columnItems;
  };

  const columnItems = getColumnItems();

  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
    >
      <div 
        className="flex"
        style={{ gap: `${gap}px` }}
      >
        {columnItems.map((column, columnIndex) => (
          <div 
            key={`column-${columnIndex}`}
            className="flex flex-col"
            style={{ 
              gap: `${gap}px`, 
              width: `${100 / columns}%` 
            }}
          >
            {column.map((item) => (
              <MediaCard 
                key={item.id}
                media={item}
                aspectRatio="auto"
                width={columnWidth}
                onSelect={onMediaSelect}
                onView={onMediaView}
                isSelected={selectedItems.includes(item.id)}
                isSelectable={isSelectable}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Upload Dropzone Component

```tsx
// src/components/gallery/upload-dropzone.tsx
'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileUp,
  AlertCircle, 
  X,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;
// Allowed file types
const ACCEPTED_FILE_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
};

interface UploadFile extends File {
  id: string;
  preview: string;
  progress: number;
  error?: string;
  uploaded?: boolean;
}

interface UploadDropzoneProps {
  eventId: string;
  albumId?: string;
  onUploadComplete?: (files: any[]) => void;
  maxFiles?: number;
  className?: string;
}

export function UploadDropzone({
  eventId,
  albumId,
  onUploadComplete,
  maxFiles = 20,
  className = '',
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Limit the number of files
    const totalFiles = files.length + acceptedFiles.length;
    
    if (totalFiles > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload a maximum of ${maxFiles} files at once.`,
        variant: "destructive",
      });
      
      // Only take what we can handle
      acceptedFiles = acceptedFiles.slice(0, maxFiles - files.length);
    }
    
    // Process accepted files
    const newFiles = acceptedFiles.map(file => {
      // Generate preview for images
      const preview = URL.createObjectURL(file);
      
      return {
        ...file,
        id: Math.random().toString(36).substring(2, 11),
        preview,
        progress: 0,
      };
    });
    
    setFiles(prev => [...prev, ...newFiles]);
  }, [files, maxFiles, toast]);

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    isDragAccept,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxSize: MAX_FILE_SIZE,
    maxFiles: maxFiles - files.length,
    disabled: isUploading || files.length >= maxFiles,
  });

  const removeFile = (fileId: string) => {
    setFiles(prev => {
      const newFiles = prev.filter(f => f.id !== fileId);
      const fileToRemove = prev.find(f => f.id === fileId);
      
      // Revoke object URL to prevent memory leaks
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    const uploadedFiles = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Upload logic will go here
        await new Promise(resolve => {
          // Simulate upload progress
          let progress = 0;
          const interval = setInterval(() => {
            progress += 5;
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            ));
            
            if (progress >= 100) {
              clearInterval(interval);
              // Mark as uploaded
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, uploaded: true } : f
              ));
              resolve(null);
            }
          }, 100);
        });
        
        // Add to uploaded files
        uploadedFiles.push(file);
      } catch (error) {
        console.error("Upload error:", error);
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, error: 'Failed to upload file' } : f
        ));
      }
    }
    
    setIsUploading(false);
    
    if (uploadedFiles.length > 0 && onUploadComplete) {
      onUploadComplete(uploadedFiles);
    }
    
    toast({
      title: "Upload complete",
      description: `Successfully uploaded ${uploadedFiles.length} files.`,
    });
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div 
        {...getRootProps()} 
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive && !isDragReject && "border-primary bg-primary/10",
          isDragReject && "border-destructive bg-destructive/10",
          isUploading && "opacity-50 cursor-not-allowed",
          (isUploading || files.length >= maxFiles) && "pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        
        <div className="flex flex-col items-center justify-center space-y-3 py-4">
          {isDragActive ? (
            <Upload className="h-10 w-10 text-primary animate-bounce" />
          ) : (
            <FileUp className="h-10 w-10 text-muted-foreground" />
          )}
          
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium">
              {isDragActive 
                ? isDragAccept 
                  ? "Drop the files here" 
                  : "This file type is not supported"
                : "Drag & drop files here or click to browse"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              Supported formats: JPG, PNG, WEBP, HEIC, MP4, MOV (up to 10MB)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {files.length} / {maxFiles} files selected
            </p>
          </div>
        </div>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="font-medium text-sm">Upload queue</div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {files.map(file => (
              <div 
                key={file.id} 
                className={cn(
                  "relative group rounded-md overflow-hidden border",
                  file.error ? "border-destructive" : "border-border"
                )}
              >
                <div className="aspect-square relative">
                  <img 
                    src={file.preview} 
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(file.preview)}
                  />
                  
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {file.type.startsWith('video/') ? (
                      <Film className="h-8 w-8 text-white" />
                    ) : (
                      <ImageIcon className="h-8 w-8 text-white" />
                    )}
                  </div>
                  
                  {!isUploading && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 text-white hover:bg-black/70"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {isUploading && file.progress < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 px-2 py-1">
                      <Progress value={file.progress} className="h-1" />
                    </div>
                  )}
                  
                  {file.uploaded && (
                    <div className="absolute bottom-1 right-1 bg-primary text-white text-xs px-2 py-1 rounded-full">
                      Uploaded
                    </div>
                  )}
                </div>
                
                <div className="p-2 space-y-1">
                  <p className="text-xs font-medium truncate">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                
                {file.error && (
                  <div className="absolute inset-0 bg-background/90 flex items-center justify-center p-4">
                    <div className="text-center space-y-2">
                      <AlertCircle className="h-6 w-6 text-destructive mx-auto" />
                      <p className="text-xs text-destructive">{file.error}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFiles([]);
              }}
              disabled={isUploading}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              onClick={uploadFiles}
              disabled={isUploading || files.length === 0}
            >
              {isUploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Helper Functions for Media Operations

```typescript
// src/lib/utils/media-helpers.ts

/**
 * Generate storage path for a media item
 */
export function generateStoragePath(
  eventId: string, 
  userId: string, 
  fileName: string, 
  mediaType: 'photo' | 'video' | 'audio' = 'photo'
): string {
  const timestamp = new Date().getTime();
  const fileExt = fileName.split('.').pop();
  const safeFileName = `${timestamp}-${fileName.replace(/[^a-zA-Z0-9]/g, '-')}`;
  
  return `events/${eventId}/${mediaType}s/${userId}/${safeFileName}`;
}

/**
 * Calculate dimensions for responsive images
 */
export function calculateResponsiveSize(
  originalWidth: number, 
  originalHeight: number, 
  containerWidth: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight;
  
  const width = Math.min(originalWidth, containerWidth);
  const height = width / aspectRatio;
  
  return { width, height };
}

/**
 * Generate thumbnail URL from a media item
 */
export function getThumbnailUrl(
  mediaId: string, 
  supabaseUrl: string, 
  storagePath: string
): string {
  // For videos, we'll use a specific thumbnail endpoint
  if (storagePath.includes('/videos/')) {
    return `/api/media/${mediaId}/thumbnail`;
  }
  
  // For images, we append a size parameter to the Supabase URL
  return `${supabaseUrl}/storage/v1/object/public/media/${storagePath}?width=400`;
}

/**
 * Extract metadata from EXIF data
 */
export async function extractExifData(file: File): Promise<Record<string, any>> {
  // This would use a library like exifr in a real implementation
  // For now, we'll return a placeholder
  return {
    exif: {
      make: 'Unknown',
      model: 'Unknown',
      exposureTime: null,
      fNumber: null,
      iso: null,
      focalLength: null,
      timestamp: new Date().toISOString(),
    }
  };
}
```

## Migration Script Example

```typescript
// src/scripts/migrate-photos-to-media.ts

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migratePhotosToMedia() {
  console.log('Starting migration...');
  
  // Get all photos
  const { data: photos, error } = await supabase
    .from('photos')
    .select('*');
    
  if (error) {
    console.error('Error fetching photos:', error);
    process.exit(1);
  }
  
  console.log(`Found ${photos.length} photos to migrate`);
  
  // Process each photo
  for (const photo of photos) {
    console.log(`Migrating photo ${photo.id}`);
    
    try {
      // Insert into new media table
      const { data, error: insertError } = await supabase
        .from('media')
        .insert({
          id: photo.id, // Preserve the same ID
          event_id: photo.event_id,
          user_id: photo.uploaded_by,
          media_type: 'photo',
          title: null,
          description: null,
          storage_path: photo.storage_path,
          original_filename: photo.filename,
          content_type: photo.metadata?.mime_type || 'image/jpeg',
          size_bytes: photo.metadata?.size || 0,
          width: photo.metadata?.width || null,
          height: photo.metadata?.height || null,
          is_approved: photo.is_approved,
          is_featured: false,
          metadata: photo.metadata || {},
          tags: [],
          created_at: photo.created_at,
          updated_at: photo.updated_at || photo.created_at,
        })
        .select();
        
      if (insertError) {
        console.error(`Error migrating photo ${photo.id}:`, insertError);
        continue;
      }
      
      console.log(`Successfully migrated photo ${photo.id} to media ${data[0].id}`);
    } catch (e) {
      console.error(`Exception migrating photo ${photo.id}:`, e);
    }
  }
  
  console.log('Migration completed');
}

migratePhotosToMedia().catch(console.error);
```

These resources should provide a strong foundation for implementing the gallery features in Session 30. 