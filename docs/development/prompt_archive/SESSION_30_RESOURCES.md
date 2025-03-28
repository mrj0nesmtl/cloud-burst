# Session 30: Implementation Resources
## Current Version: 0.8.1
## Last Updated: March 27, 2025, 9:00 AM
## Session: 30 - Gallery Implementation Continuation

This document provides helpful resources, code snippets, and examples for the gallery implementation in Session 30. As we've confirmed that the database structure is complete but tables are empty, our focus will be on implementing the upload and display components to populate and visualize media content.

## Database Schema Status

Database schema migration is 100% complete. The following tables have been created:

- `media` - Core table for storing photos, videos, and audio
- `albums` - For organizing media into collections
- `album_media` - Junction table for associating media with albums
- `media_upload_tokens` - For tracking guest upload permissions

All appropriate indexes and RLS policies are in place. The tables are currently empty and ready for implementation.

## Implementation Priorities

1. **Upload Components** - To populate the media table
2. **Display Components** - To visualize the uploaded content
3. **Album Management** - To organize media
4. **Guest Upload System** - To allow event attendees to contribute

## Database Schema

### Media Table (✅ Implemented)

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

### Album Table (✅ Implemented)

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

## TypeScript Interfaces (✅ Implemented)

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

## Priority Implementation Components

### 1. Upload Dropzone Component (Priority)

This should be our first implementation focus to start populating the media table:

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
import { uploadMedia } from '@/lib/supabase/media';

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
        // Upload logic with progress tracking
        const mediaType = file.type.startsWith('video/') ? 'video' : 'photo';
        
        // Start upload and track progress
        await uploadMedia({
          file,
          eventId,
          albumId,
          mediaType,
          onProgress: (progress) => {
            setFiles(prev => prev.map(f => 
              f.id === file.id ? { ...f, progress } : f
            ));
          }
        });
        
        // Mark as uploaded
        setFiles(prev => prev.map(f => 
          f.id === file.id ? { ...f, uploaded: true } : f
        ));
        
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

### 2. Media Upload Implementation

Create the necessary backend functions to handle uploads:

```typescript
// src/lib/supabase/media.ts
'use client';

import { v4 as uuidv4 } from 'uuid';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/supabase';
import { Media, MediaType, MediaUploadResult } from '@/types/media';
import { generateStoragePath } from '@/lib/utils/media-helpers';

interface UploadMediaParams {
  file: File;
  eventId: string;
  albumId?: string;
  mediaType: MediaType;
  title?: string;
  description?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Upload media to Supabase storage and create a record in the media table
 */
export async function uploadMedia({
  file,
  eventId,
  albumId,
  mediaType,
  title,
  description,
  onProgress = () => {},
}: UploadMediaParams): Promise<MediaUploadResult> {
  const supabase = createClientComponentClient<Database>();
  
  // Get the current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error('Authentication required to upload media');
  }
  
  // Generate a unique ID for this media
  const mediaId = uuidv4();
  
  // Generate storage path
  const storage_path = generateStoragePath(eventId, user.id, file.name, mediaType);
  
  // Start upload with progress tracking
  onProgress(10);
  
  // Upload to Supabase Storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('media')
    .upload(storage_path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
      duplex: 'half',
    });
  
  if (storageError) {
    throw new Error(`Error uploading to storage: ${storageError.message}`);
  }
  
  onProgress(60);
  
  // Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('media')
    .getPublicUrl(storage_path);
  
  // Create thumbnail for videos if needed
  let thumbnailUrl = undefined;
  if (mediaType === 'video') {
    // This would be a call to create a thumbnail
    // For now, we'll use a placeholder
    thumbnailUrl = '/placeholders/video-thumbnail.jpg';
  }
  
  onProgress(70);
  
  // Extract metadata
  let width = null;
  let height = null;
  let duration = null;
  
  if (mediaType === 'photo') {
    // For images, create a temporary URL and get dimensions
    const img = new Image();
    const imgPromise = new Promise<void>((resolve) => {
      img.onload = () => {
        width = img.width;
        height = img.height;
        resolve();
      };
      img.onerror = () => {
        resolve();
      };
    });
    
    img.src = URL.createObjectURL(file);
    await imgPromise;
    URL.revokeObjectURL(img.src);
  } else if (mediaType === 'video') {
    // For videos, we would extract dimensions and duration
    // This would require more complex processing
    duration = 0; // Placeholder
  }
  
  onProgress(80);
  
  // Create record in the media table
  const { data: mediaData, error: mediaError } = await supabase
    .from('media')
    .insert({
      id: mediaId,
      event_id: eventId,
      album_id: albumId || null,
      user_id: user.id,
      media_type: mediaType,
      title: title || file.name,
      description: description || null,
      storage_path,
      original_filename: file.name,
      content_type: file.type,
      size_bytes: file.size,
      width,
      height,
      duration,
      is_approved: false, // Default to unapproved until reviewed
      is_featured: false,
      metadata: {},
      tags: [],
    })
    .select()
    .single();
  
  if (mediaError) {
    // Clean up the storage if media record creation fails
    await supabase.storage.from('media').remove([storage_path]);
    throw new Error(`Error creating media record: ${mediaError.message}`);
  }
  
  onProgress(100);
  
  // Return the created media with URLs
  return {
    media: {
      ...mediaData,
      url: publicUrl,
      thumbnail_url: thumbnailUrl,
    } as Media,
    url: publicUrl,
    thumbnail_url: thumbnailUrl,
  };
}

// Other media-related functions will go here
```

### 3. Media Card Component (For Display)

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

## Next Steps

1. First implement the upload components and test that they properly populate the media table
2. Add server-side functions for retrieving and displaying media
3. Implement the masonry layout for viewing uploaded content
4. Add album management functionality
5. Implement the guest upload system

## Critical Note

Since our tables are empty, it's important to create a robust upload functionality first, then build the display components to show the uploaded content. By following this order, we can incrementally build and test the entire gallery system. 