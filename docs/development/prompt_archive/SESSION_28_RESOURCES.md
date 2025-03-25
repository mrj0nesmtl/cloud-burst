# Session 28 Resources: Gallery Implementation & Dashboard Enhancements

## Overview

This document provides essential resources for Session 28, which focuses on gallery implementation, dashboard enhancements, invitation system integration, and onboarding flow development. It includes relevant directory structures, documentation references, and implementation guidance.

## Key Directory Structures

### Gallery System Structure

```
src/
├── app/
│   ├── protected/
│   │   ├── gallery/
│   │   │   ├── page.tsx                 # Main gallery landing page
│   │   │   ├── layout.tsx               # Gallery layout with tabs
│   │   │   ├── upload/
│   │   │   │   └── page.tsx             # Upload interface
│   │   │   ├── events/
│   │   │   │   └── page.tsx             # Events gallery
│   │   │   ├── albums/
│   │   │   │   ├── page.tsx             # Albums list
│   │   │   │   └── [albumId]/
│   │   │   │       └── page.tsx         # Single album view
│   │   │   ├── moderation/
│   │   │   │   └── page.tsx             # Content moderation queue
│   │   │   └── settings/
│   │   │       └── page.tsx             # Gallery settings
│   │   ├── events/
│   │   │   └── [eventId]/
│   │   │       └── gallery/
│   │   │           └── page.tsx         # Event-specific gallery
├── components/
│   ├── gallery/
│   │   ├── upload-dropzone.tsx          # Drag-and-drop upload component
│   │   ├── media-card.tsx               # Media item display component
│   │   ├── masonry-layout.tsx           # Responsive masonry grid
│   │   ├── gallery-filter.tsx           # Filtering controls
│   │   ├── album-creator.tsx            # Album creation interface
│   │   ├── guest-upload.tsx             # Guest upload interface
│   │   ├── media-viewer.tsx             # Media lightbox/detail view
│   │   └── moderation-queue.tsx         # Content moderation tools
├── lib/
│   ├── supabase/
│   │   ├── media.ts                     # Media-related database functions
│   │   ├── albums.ts                    # Album management functions
│   │   └── guest-uploads.ts             # Guest upload token handling
├── types/
│   ├── media.ts                         # Media-related TypeScript types
│   ├── albums.ts                        # Album TypeScript types
│   └── guest.ts                         # Guest upload TypeScript types
```

### Dashboard Analytics Structure

```
src/
├── app/
│   ├── protected/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   ├── page.tsx             # Main analytics dashboard
│   │   │   │   ├── events/
│   │   │   │   │   └── page.tsx         # Event analytics
│   │   │   │   ├── engagement/
│   │   │   │   │   └── page.tsx         # User engagement metrics
│   │   │   │   └── media/
│   │   │   │       └── page.tsx         # Media analytics
├── components/
│   ├── dashboard/
│   │   ├── analytics/
│   │   │   ├── metrics-card.tsx         # Analytics metric card
│   │   │   ├── chart-component.tsx      # Data visualization chart
│   │   │   ├── date-range-picker.tsx    # Date filtering component
│   │   │   ├── export-tools.tsx         # Data export functionality
│   │   │   └── mobile-metrics.tsx       # Mobile-optimized metrics
```

### Invitation System Structure

```
src/
├── app/
│   ├── protected/
│   │   ├── invitations/
│   │   │   ├── page.tsx                 # Invitation management page
│   │   │   ├── create/
│   │   │   │   └── page.tsx             # Create invitation page
│   │   │   ├── templates/
│   │   │   │   └── page.tsx             # Email template management
│   │   │   └── [invitationId]/
│   │   │       └── page.tsx             # Individual invitation
├── components/
│   ├── invitations/
│   │   ├── invitation-form.tsx          # Invitation creation form
│   │   ├── qr-generator.tsx             # QR code generation
│   │   ├── email-template-editor.tsx    # Template customization
│   │   ├── guest-permissions.tsx        # Permission management
│   │   └── rsvp-tracker.tsx             # Response tracking
```

### Onboarding Flow Structure

```
src/
├── app/
│   ├── onboarding/
│   │   ├── layout.tsx                   # Onboarding layout
│   │   ├── page.tsx                     # Onboarding start page
│   │   ├── profile/
│   │   │   └── page.tsx                 # Profile setup page
│   │   ├── organization/
│   │   │   └── page.tsx                 # Organization setup
│   │   ├── templates/
│   │   │   └── page.tsx                 # Template selection
│   │   └── complete/
│   │       └── page.tsx                 # Completion celebration
├── components/
│   ├── onboarding/
│   │   ├── progress-tracker.tsx         # Onboarding progress
│   │   ├── step-navigator.tsx           # Step navigation
│   │   ├── template-selector.tsx        # Event template cards
│   │   ├── contextual-help.tsx          # Inline help tooltips
│   │   └── welcome-email.tsx            # Welcome email preview
```

## Database Schema Updates

### Media Table Migration

```sql
-- Rename photos table to media
ALTER TABLE photos RENAME TO media;

-- Add media type and metadata fields
ALTER TABLE media ADD COLUMN media_type TEXT NOT NULL DEFAULT 'photo';
ALTER TABLE media ADD COLUMN duration INTEGER; -- For videos (in seconds)
ALTER TABLE media ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;

-- Create indexes for efficient filtering
CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_event_id ON media(event_id);
CREATE INDEX idx_media_created_at ON media(created_at);

-- Update RLS policies
CREATE POLICY "Media visible to event attendees and organizers"
  ON media
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM event_attendees WHERE event_id = media.event_id
      UNION
      SELECT user_id FROM event_organizers WHERE event_id = media.event_id
    )
  );
```

### Albums Structure

```sql
-- Create albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  cover_media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create album_media junction table
CREATE TABLE album_media (
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  added_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (album_id, media_id)
);

-- Set up RLS policies
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;
```

### Guest Upload System

```sql
-- Create guest_upload_tokens table
CREATE TABLE guest_upload_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  email TEXT,
  name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  is_used BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  max_uploads INTEGER DEFAULT 20
);

-- Set up RLS policies
ALTER TABLE guest_upload_tokens ENABLE ROW LEVEL SECURITY;
```

## Key Documentation References

### Development Rules to Reference

- **Frontend Architecture Guidelines**: Essential for component architecture
- **React Component Standards**: Guidelines for building media components
- **State Management Standards**: For handling gallery state with Zustand
- **TypeScript Standards**: For proper typing of media and related entities
- **Quality Assurance Practices**: Testing standards for new features
- **Form Handling Standards**: For media upload and album creation forms
- **Navigation Patterns**: For navigating between gallery views
- **Dashboard Component Standards**: For analytics implementation
- **Security Standards**: For guest upload token implementation
- **Core Development Standards**: For overall code quality

### Helpful Project Documentation

1. **Gallery Implementation Pattern**
   - `docs/design/gallery-system.md`: Comprehensive design for gallery
   - `docs/user-flows/media-management.md`: User flow for media handling

2. **Component Patterns**
   - `docs/design/component-library.md`: Component design standards
   - `docs/design/responsive-patterns.md`: Mobile-first design patterns

3. **Database Migration**
   - `docs/architecture/database-schema.md`: Database schema documentation
   - `supabase/migrations/`: SQL migration examples

4. **Authentication & Security**
   - `docs/security/token-based-auth.md`: Guidelines for token-based auth
   - `docs/security/guest-access.md`: Guest access implementation

5. **Testing Strategy**
   - `docs/quality-assurance/component-testing.md`: Test strategies
   - `docs/quality-assurance/performance-testing.md`: Performance benchmarks

## Implementation Priorities Checklist

1. **Database Migration**
   - [ ] Create SQL migration script
   - [ ] Update TypeScript types
   - [ ] Modify Supabase utility functions
   - [ ] Test migration in development

2. **Upload Components**
   - [ ] Implement responsive dropzone
   - [ ] Create progress visualization
   - [ ] Add file validation
   - [ ] Build success/error states

3. **Media Gallery Components**
   - [ ] Build media card component
   - [ ] Implement masonry layout
   - [ ] Add lazy loading
   - [ ] Create filtering controls

4. **Album Management**
   - [ ] Build album creation interface
   - [ ] Implement media assignment
   - [ ] Create album view components
   - [ ] Add sharing functionality

5. **Guest Upload System**
   - [ ] Create token generation
   - [ ] Build guest upload interface
   - [ ] Implement moderation queue
   - [ ] Add notification system

6. **Dashboard Analytics**
   - [ ] Create metrics cards
   - [ ] Implement data visualization
   - [ ] Add filtering capabilities
   - [ ] Build export functionality

7. **Invitation System**
   - [ ] Implement email templates
   - [ ] Add QR code integration
   - [ ] Create guest permissions
   - [ ] Build RSVP functionality

8. **Onboarding Flow**
   - [ ] Create step-by-step interface
   - [ ] Build profile completion
   - [ ] Implement template selection
   - [ ] Add welcome automation

## Technical Implementation Notes

### Masonry Layout Implementation

```tsx
// src/components/gallery/masonry-layout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { MediaCard } from './media-card';
import type { Media } from '@/types/media';

type MasonryLayoutProps = {
  media: Media[];
  columnCount?: number;
  gap?: number;
};

export function MasonryLayout({ 
  media, 
  columnCount: defaultColumnCount = 3,
  gap = 16 
}: MasonryLayoutProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [columnCount, setColumnCount] = useState(defaultColumnCount);
  const [columns, setColumns] = useState<Media[][]>(Array(defaultColumnCount).fill([]));

  // Responsive column adjustment
  useEffect(() => {
    const updateColumns = () => {
      if (!containerRef.current) return;
      
      const width = containerRef.current.clientWidth;
      let newColumnCount = defaultColumnCount;
      
      if (width < 640) newColumnCount = 1;
      else if (width < 768) newColumnCount = 2;
      else if (width < 1024) newColumnCount = 3;
      else if (width < 1280) newColumnCount = 4;
      else newColumnCount = 5;
      
      setColumnCount(newColumnCount);
    };
    
    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, [defaultColumnCount]);
  
  // Distribute media across columns
  useEffect(() => {
    const newColumns = Array.from({ length: columnCount }, () => [] as Media[]);
    
    media.forEach((item, index) => {
      const shortestColumnIndex = newColumns
        .map((column, i) => ({ 
          height: column.reduce((sum, media) => sum + (media.height || 300), 0),
          index: i 
        }))
        .sort((a, b) => a.height - b.height)[0].index;
      
      newColumns[shortestColumnIndex].push(item);
    });
    
    setColumns(newColumns);
  }, [media, columnCount]);
  
  return (
    <div
      ref={containerRef}
      className="w-full"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columnCount}, 1fr)`,
        gap: `${gap}px`,
      }}
    >
      {columns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px` }}>
          {column.map((item) => (
            <MediaCard key={item.id} media={item} />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### Upload Dropzone Implementation

```tsx
// src/components/gallery/upload-dropzone.tsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { uploadMedia } from '@/lib/supabase/media';

type UploadDropzoneProps = {
  eventId: string;
  onComplete?: (mediaIds: string[]) => void;
  maxFiles?: number;
  acceptedFileTypes?: Record<string, string[]>;
};

export function UploadDropzone({
  eventId,
  onComplete,
  maxFiles = 10,
  acceptedFileTypes = {
    'image/*': ['.jpg', '.jpeg', '.png', '.gif'],
    'video/*': ['.mp4', '.mov', '.avi']
  }
}: UploadDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files at once.`);
      acceptedFiles = acceptedFiles.slice(0, maxFiles - files.length);
    }
    
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, [files.length, maxFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxFiles,
    disabled: uploading
  });

  const handleUpload = async () => {
    if (files.length === 0) return;
    setUploading(true);
    
    const uploadedIds: string[] = [];
    
    for (const file of files) {
      try {
        const mediaId = await uploadMedia({
          file,
          eventId,
          onProgress: (percent) => {
            setProgress(prev => ({ ...prev, [file.name]: percent }));
          }
        });
        
        setCompleted(prev => [...prev, file.name]);
        uploadedIds.push(mediaId);
      } catch (error) {
        console.error('Upload error:', error);
        setErrors(prev => ({ 
          ...prev, 
          [file.name]: error instanceof Error ? error.message : 'Upload failed' 
        }));
      }
    }
    
    setUploading(false);
    if (onComplete) onComplete(uploadedIds);
  };

  const removeFile = (name: string) => {
    setFiles(files.filter(file => file.name !== name));
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[name];
      return newProgress;
    });
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setCompleted(prev => prev.filter(fileName => fileName !== name));
  };

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive 
            ? 'border-primary bg-primary/10' 
            : 'border-muted-foreground/30 hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          {isDragActive
            ? 'Drop the files here...'
            : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Supports images (JPG, PNG, GIF) and videos (MP4, MOV, AVI)
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Files to upload ({files.length})</h3>
          <ul className="space-y-2">
            {files.map((file) => (
              <li 
                key={file.name} 
                className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
              >
                <div className="flex items-center space-x-2 truncate flex-1">
                  {completed.includes(file.name) ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : errors[file.name] ? (
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                  ) : (
                    <div className="w-5 h-5 flex-shrink-0" />
                  )}
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                
                {progress[file.name] !== undefined && progress[file.name] < 100 && (
                  <Progress value={progress[file.name]} className="w-24 h-2" />
                )}
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(file.name)}
                  disabled={uploading && !errors[file.name]}
                >
                  <X className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
          
          {Object.keys(errors).length > 0 && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-md p-2">
              <p className="text-sm font-medium text-red-500">Some files failed to upload</p>
              <ul className="text-xs space-y-1 mt-1">
                {Object.entries(errors).map(([fileName, error]) => (
                  <li key={fileName}>{fileName}: {error}</li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={uploading || files.length === 0}
            >
              {uploading ? 'Uploading...' : 'Upload Files'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
```

## Mobile-First Implementation Patterns

For all components in this session, follow these mobile-first implementation patterns:

1. **Responsive Design Approach**:
   - Start with mobile layout and enhance for larger screens
   - Use viewport detection for conditional rendering
   - Implement direct style approach for consistent rendering

2. **Touch-Friendly Controls**:
   - Minimum touch target size of 44px × 44px
   - Implement touch gestures for common actions
   - Provide visual feedback for touch interactions

3. **Optimized Media Loading**:
   - Use responsive images with srcSet
   - Implement lazy loading for all media
   - Prioritize loading visible content first
   - Use appropriate image formats and compression

4. **Bandwidth Considerations**:
   - Serve appropriately sized media based on device
   - Implement effective caching strategies
   - Provide low-quality image placeholders (LQIP)
   - Consider connection quality for video playback

5. **Accessibility Requirements**:
   - Ensure keyboard navigation for all interactions
   - Implement proper focus management
   - Provide text alternatives for all media
   - Use ARIA attributes for custom controls

This document serves as a reference guide for Session 28 implementation. Use these resources to ensure consistent, high-quality implementation of the gallery system, dashboard enhancements, invitation system, and onboarding flow. 