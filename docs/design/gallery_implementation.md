# Gallery Implementation Specification

## Overview

The Gallery feature is a core component of the Cloud Burst platform, allowing event photographers and invited guests to upload, organize, and showcase their photos for event attendees. This document outlines the technical requirements, implementation plan, and development approach for the Gallery feature.

## Current Status (Updated March 27, 2025)

- Gallery layout implemented with proper padding
- Directory structure created and functioning:
  - `/protected/gallery/` (main gallery page)
  - `/protected/gallery/all/` (all photos view)
  - `/protected/gallery/events/` (events list view)
  - `/protected/gallery/albums/` (albums view)
  - `/protected/gallery/moderate/` (moderation interface)
- Basic navigation established in sidebar
- Fixed critical Next.js App Router architecture issues:
  - Added `'use client'` directives to interactive components:
    - `GalleryHeader.tsx`
    - `MasonryGrid.tsx`
    - `MediaViewer.tsx`
  - Ensured proper client/server component separation
  - Resolved authentication flows in gallery pages
- Corrected data mapping issues:
  - Implemented proper mapping between database types and component types
  - Fixed `MediaItem` interface to correctly use `MediaStatus` enum
  - Added event data to media items for better context

## Implementation Progress

Current implementation progress is at **40%** toward full completion.

Key components implemented:
- ✅ Basic gallery layout and navigation
- ✅ Client/server component architecture
- ✅ Media item interfaces and type mapping
- ✅ Basic media cards
- ✅ Preliminary masonry grid
- ⏳ Advanced filtering (in progress)
- ⏳ Album management (in progress)
- ⏳ Guest upload system (in progress)

## Database Schema Decision

We will implement **Option 1**: Rename the `photos` table to `media` to handle both photos and videos, providing greater flexibility as we expand platform capabilities.

**Considerations that led to this decision**:
- Shared attributes: storage_path, metadata, event_id, uploaded_by, status
- Media-specific attributes can be stored as JSON or in separate columns
- Simplified queries compared to maintaining separate tables
- Easier expansion to other media types in the future
- More consistent permission structure

## Database Schema

```sql
-- Media table (renamed from Photos)
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  duration_seconds INTEGER, -- For videos
  content_type TEXT NOT NULL,
  caption TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  moderation_status TEXT DEFAULT 'pending',
  metadata JSONB DEFAULT '{}', -- EXIF data for photos, video metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Albums table
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  cover_media_id UUID,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Media Tags
CREATE TABLE media_tags (
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  tag TEXT NOT NULL,
  PRIMARY KEY (media_id, tag)
);

-- Moderation Logs
CREATE TABLE moderation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media(id) ON DELETE CASCADE,
  moderator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Guest Uploads - tracking invitations and uploads
CREATE TABLE guest_uploads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  invitation_id UUID REFERENCES invitations(id) ON DELETE SET NULL,
  guest_email TEXT NOT NULL,
  upload_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  uploaded_media_count INTEGER DEFAULT 0,
  last_upload_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);
```

## RLS Policies

```sql
-- Media table policies
CREATE POLICY "Users can view their own media" ON media
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Event organizers can view event media" ON media
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM events
    WHERE events.id = media.event_id
    AND events.organizer_id = auth.uid()
  ));

CREATE POLICY "Public media are viewable by anyone" ON media
  FOR SELECT
  USING (is_public = TRUE);

CREATE POLICY "Guests with valid tokens can upload media" ON media
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM guest_uploads
    WHERE guest_uploads.event_id = media.event_id
    AND guest_uploads.upload_token = current_setting('app.upload_token', true)
    AND guest_uploads.is_active = TRUE
    AND guest_uploads.expires_at > CURRENT_TIMESTAMP
  ));

-- Similar policies for other tables
```

## Technical Requirements

### 1. Media Upload System

#### Backend Requirements
- Supabase Storage bucket configuration with appropriate RLS policies
- File size limits and validation (10MB per photo, 50MB per video)
- Support for JPEG, PNG, WebP formats for photos
- Support for MP4, WebM formats for videos
- Support for EXIF data extraction
- Serverless function for image/video optimization

#### Frontend Components
- Drag-and-drop upload zone
- Multi-file upload support
- Upload progress indicator
- Error handling for failed uploads
- Cancellation capability
- Mobile-friendly design with touch interactions

#### Implementation
```typescript
// Upload component structure with direct styles
import { useState, useEffect } from 'react';

interface UploadProps {
  eventId: string;
  onComplete: (uploadedFiles: UploadedFile[]) => void;
  maxFiles?: number;
  allowedTypes?: string[];
  invitationToken?: string; // For guest uploads
}

interface UploadedFile {
  id: string;
  filename: string;
  mediaType: 'photo' | 'video';
  size: number;
  url: string;
  thumbnailUrl: string;
  uploadedAt: Date;
}

export function UploadDropzone({ 
  eventId, 
  onComplete, 
  maxFiles = 10, 
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  invitationToken 
}: UploadProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Upload handlers and logic...
  
  return (
    <div style={{
      width: '100%',
      padding: isMobile ? '16px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div 
        style={{
          padding: '24px',
          borderRadius: '8px',
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'var(--border)'}`,
          backgroundColor: 'var(--background)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: isMobile ? '200px' : '300px',
          cursor: 'pointer',
          transition: 'border-color 0.2s ease'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          // Handle file drop
        }}
        onClick={() => {
          // Trigger file input click
        }}
      >
        {uploading ? (
          <div style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <p>Uploading {files.length} files... ({progress}%)</p>
            <div style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'var(--muted)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: 'var(--primary)',
                transition: 'width 0.2s ease'
              }} />
            </div>
          </div>
        ) : (
          <>
            <div style={{
              width: isMobile ? '48px' : '64px',
              height: isMobile ? '48px' : '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}>
              <UploadIcon size={isMobile ? 24 : 32} color="var(--primary)" />
            </div>
            <p style={{
              fontSize: isMobile ? '16px' : '18px',
              fontWeight: 'medium',
              marginBottom: '8px'
            }}>
              Drag and drop or click to upload
            </p>
            <p style={{
              fontSize: isMobile ? '14px' : '16px',
              color: 'var(--muted-foreground)'
            }}>
              {allowedTypes.includes('video/mp4') ? 'Photos & Videos' : 'Photos only'} (max {maxFiles} files)
            </p>
          </>
        )}
      </div>
      
      <input type="file" multiple style={{ display: 'none' }} />
      
      {files.length > 0 && !uploading && (
        <div style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <p>{files.length} files selected</p>
            <button style={{
              height: isMobile ? '48px' : '40px',
              minWidth: isMobile ? '100px' : '80px',
              padding: '0 16px',
              backgroundColor: 'var(--primary)',
              color: 'white',
              fontWeight: 'medium',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer'
            }}>
              Upload
            </button>
          </div>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {/* File list would go here */}
          </div>
        </div>
      )}
    </div>
  );
}
```

### 2. Gallery View Components

#### View Types
1. **Grid View**: Standard responsive grid layout
2. **Masonry View**: Pinterest-style variable height layout

#### Client/Server Component Architecture

For all gallery components that require interactivity and state management, we've implemented a proper client/server component architecture following Next.js 14 best practices:

1. **Server Components** - For data fetching and initial rendering:
   - Gallery page layout components
   - Event data fetching
   - Media listing components

2. **Client Components** - For interactive elements:
   - MasonryGrid (marked with `"use client"`)
   - GalleryHeader (marked with `"use client"`)
   - MediaViewer (marked with `"use client"`)
   - Filter controls
   - Media cards with interactive elements

#### Responsive Implementation
```typescript
// Responsive gallery grid with direct styles
// "use client" directive required for components using React hooks
import { useState, useEffect } from 'react';

interface GalleryGridProps {
  media: Media[];
  onSelect?: (media: Media) => void;
}

export function GalleryGrid({ media, onSelect }: GalleryGridProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div style={{ 
      width: '100%',
      display: 'grid',
      gridTemplateColumns: isMobile 
        ? '1fr' 
        : 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: isMobile ? '16px' : '24px'
    }}>
      {media.map(item => (
        <MediaCard 
          key={item.id} 
          media={item} 
          onClick={() => onSelect?.(item)}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

// Responsive masonry layout implementation 
// "use client" directive required
interface MasonryGalleryProps {
  media: Media[];
  onSelect?: (media: Media) => void;
}

export function MasonryGallery({ media, onSelect }: MasonryGalleryProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [columns, setColumns] = useState(3);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else if (width < 1536) setColumns(3);
      else setColumns(4);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Distribute photos into columns
  const mediaColumns = Array.from({ length: columns }, () => []);
  media.forEach((item, i) => {
    mediaColumns[i % columns].push(item);
  });
  
  return (
    <div style={{ 
      width: '100%',
      display: 'grid',
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: isMobile ? '16px' : '24px'
    }}>
      {mediaColumns.map((columnItems, i) => (
        <div key={i} style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: isMobile ? '16px' : '24px' 
        }}>
          {columnItems.map(item => (
            <MediaCard 
              key={item.id} 
              media={item} 
              onClick={() => onSelect?.(item)}
              isMobile={isMobile}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

### 3. Guest Upload Features

For invited guests to upload media to events, we'll implement:

#### Token-Based Permission System
- Generate unique upload tokens for each invitation
- Store tokens with expiration dates
- Validate tokens before allowing uploads
- Associate uploads with the correct event and guest

#### Guest Upload Component
```typescript
// Guest upload component with direct styles
import { useState, useEffect } from 'react';

interface GuestUploadProps {
  eventId: string;
  invitationToken: string;
  guestEmail: string;
}

export function GuestUploadComponent({ 
  eventId, 
  invitationToken,
  guestEmail
}: GuestUploadProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Mobile detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      try {
        setIsLoading(true);
        // Call API to validate token
        // setIsValidToken(result.isValid);
        setIsLoading(false);
      } catch (err) {
        setError("Failed to validate your invitation. Please try again.");
        setIsLoading(false);
      }
    };
    
    validateToken();
  }, [eventId, invitationToken]);
  
  if (isLoading) {
    return (
      <div style={{
        width: '100%',
        padding: isMobile ? '16px' : '24px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '300px'
      }}>
        <p>Validating your invitation...</p>
      </div>
    );
  }
  
  if (error || !isValidToken) {
    return (
      <div style={{
        width: '100%',
        padding: isMobile ? '16px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        gap: '16px',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--destructive-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertIcon size={32} color="var(--destructive)" />
        </div>
        <h2 style={{
          fontSize: isMobile ? '20px' : '24px',
          fontWeight: 'bold'
        }}>Invalid Invitation</h2>
        <p style={{
          color: 'var(--muted-foreground)',
          maxWidth: '500px'
        }}>
          {error || "Your invitation is invalid or has expired. Please contact the event organizer."}
        </p>
      </div>
    );
  }
  
  return (
    <div style={{
      width: '100%',
      padding: isMobile ? '16px' : '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <h2 style={{ 
          fontSize: isMobile ? '20px' : '24px', 
          fontWeight: 'bold' 
        }}>
          Upload Your Media
        </h2>
        <p style={{ color: 'var(--muted-foreground)' }}>
          Uploading as {guestEmail}
        </p>
      </div>
      
      <UploadDropzone 
        eventId={eventId}
        invitationToken={invitationToken}
        onComplete={(files) => {
          // Handle upload completion
        }}
        allowedTypes={['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm']}
        maxFiles={20}
      />
    </div>
  );
}
```

## Implementation Phases & Status (Updated March 27, 2025)

### Phase 1: Core Media Management (March 19-21) - 80% Complete
1. ✅ Rename database tables and update schemas
2. ✅ Implement mobile-responsive media upload component
3. ✅ Create responsive gallery grid view
4. ✅ Build media card component with metadata display
5. ⏳ Add empty states and loading indicators (in progress)
6. ⏳ Implement basic filtering (in progress)

### Phase 2: Next.js App Router Architecture Fixes (March 22-24) - 100% Complete
1. ✅ Add `'use client'` directives to interactive components
2. ✅ Implement proper client/server component separation
3. ✅ Fix authentication flow in gallery pages
4. ✅ Fix server-side data fetching for galleries
5. ✅ Replace client-side data fetch with server-side equivalent
6. ✅ Correct type mappings between database and components

### Phase 3: Guest Upload System (March 25-26) - 20% Complete
1. ✅ Design guest invitation tracking system
2. ⏳ Implement token validation and security (in progress)
3. ⏳ Build guest upload user interface (in progress)
4. ❌ Create success/failure notifications
5. ❌ Add uploaded media gallery for guests
6. ❌ Implement moderation for guest uploads

### Phase 4: Album Management (March 27-28) - 10% Complete
1. ✅ Design album database structure
2. ⏳ Implement album creation/editing (in progress)
3. ❌ Create responsive album view page
4. ❌ Develop media-to-album assignment
5. ❌ Add cover image selection
6. ❌ Implement album sharing

### Phase 5: Advanced Features (March 29-30) - 0% Complete
1. ❌ Implement advanced filtering and search
2. ❌ Add metadata extraction and display
3. ❌ Create masonry layout option
4. ❌ Implement role-based views
5. ❌ Build download functionality

### Phase 6: Optimization & Finalization (March 31) - 0% Complete
1. ❌ Implement performance optimizations
2. ❌ Add comprehensive error handling
3. ❌ Enhance mobile touch interactions
4. ❌ Complete documentation
5. ❌ Final testing across devices

## Lessons Learned: Next.js 14 Client/Server Component Architecture

During our Session 30 implementation, we encountered and resolved several architectural issues related to the Next.js 14 App Router and its client/server component model:

1. **Component Categorization**: Interactive components using React hooks (`useState`, `useEffect`, etc.) must be marked with the `"use client"` directive
   
2. **Data Fetching Strategy**: 
   - Server components should handle initial data fetching
   - Client components should receive data as props or use client-side fetch mechanisms
   
3. **Authentication Context**:
   - Authentication state must be properly preserved between server and client components
   - Server-side data fetching should use server-side authentication methods
   
4. **Component Hierarchy**:
   - Server components can render client components but not vice versa
   - Data flows from server to client components through props
   
5. **Error Boundaries**:
   - Error boundaries should wrap client-side interactive components
   - Server errors and client errors need different handling approaches

## Development Approach

To ensure stability and reliability, we'll follow these principles:

1. **Mobile-First Development**
   - Start with mobile layouts first
   - Add responsive breakpoints for larger screens
   - Test on various device sizes
   - Ensure touch-friendly interactions

2. **Next.js 14 App Router Best Practices**
   - Properly mark client components with `"use client"` directive
   - Leverage server components for initial data fetching and static content
   - Pass data from server to client components through props
   - Implement proper error handling for both contexts

3. **Incremental Implementation**
   - Make small, testable changes
   - Test frequently after each component addition
   - Start with minimal implementations, then enhance
   - Add comprehensive error handling

4. **Error Prevention**
   - Add proper validation for all user inputs
   - Implement clear error states and messages
   - Use typesafe interfaces for all components
   - Test edge cases thoroughly

## Testing Considerations

- Test with large media sets (1000+ items)
- Verify lazy loading performance
- Test on low-bandwidth connections
- Verify storage security measures
- Test concurrent uploads from multiple users
- Validate against various device sizes and orientations
- Test touch interactions on actual mobile devices
- Verify proper client-side hydration of interactive components

## Accessibility Requirements

- All images must have alternative text
- Keyboard navigation for galleries
- Screen reader support for gallery views
- Focus management for modal dialogs
- ARIA attributes for interactive elements
- Touch target sizes meeting WCAG standards (44px minimum)

## Success Criteria

The gallery implementation will be considered successful when:

1. Users can upload media from both desktop and mobile devices
2. Invited guests can contribute media to events
3. Media displays properly in responsive grid and masonry layouts
4. Albums can be created and managed
5. Media can be filtered, sorted, and searched
6. The system performs well with large media collections
7. All interactions work smoothly on touch devices
8. The interface meets accessibility standards
9. Client/server component architecture correctly implements Next.js 14 best practices 