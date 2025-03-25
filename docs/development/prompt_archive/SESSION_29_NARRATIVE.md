# 🚀 Session 29: Gallery Implementation

## 📋 Background

We're building Cloud Burst, a Next.js 14 platform for event photography that allows photographers, event organizers, and attendees to collaborate around event photos. We've successfully completed Session 28, where we implemented the invitation system with SendGrid integration, enhanced API security, and improved form validation.

Now, in Session 29, we're focusing on implementing the Gallery feature, which is the core of our platform. This includes migrating from a simple `photos` table to a more versatile `media` table that can handle both photos and videos, creating responsive upload components, implementing a masonry layout gallery view, developing album management functionality, and building a guest upload system.

We're working with a tech stack that includes:
- Next.js 14 App Router
- TypeScript 5.0
- Supabase (Auth, Storage, Database)
- Shadcn/ui components
- Tailwind CSS
- Zustand for state management
- React Hook Form + Zod for form validation
- TanStack Query for data fetching

## 🎯 Session Goals

The primary goal for Session 29 is to implement the complete gallery system in preparation for our Beta 0.9.0 release scheduled for April 1, 2025. Specifically, we need to:

1. **Migrate Database Schema**: Convert from `photos` to `media` table with support for both images and videos
2. **Implement Upload Components**: Create responsive, accessible upload dropzone with drag-and-drop, progress indicators, and mobile support
3. **Build Media Cards**: Develop versatile media cards for both photos and videos
4. **Create Masonry Layout**: Implement responsive, performant masonry grid with virtualization
5. **Develop Album Management**: Build album creation, organization, and sharing functionality
6. **Implement Guest Upload System**: Create secure token-based system for invited guests to upload media

## 💻 Current State

The project is currently in a good state after completing the invitation system. We have:

- A functioning authentication system with role-based access control
- Events management with QR code generation
- Attendee management with invitation system
- SendGrid integration for email delivery
- A responsive UI with mobile navigation
- Form validation with Zod and React Hook Form

We've already established the basic structure for the Gallery feature:
- The basic routes are defined in `/protected/gallery/`
- We have design documentation in `docs/design/gallery_implementation.md` and `docs/design/media_schema_migration.md`
- Some early sketches of the components exist but need implementation

## 🔍 Key Technical Challenges

1. **Database Migration**: We need to design and implement a new schema that supports both photos and videos while maintaining proper relationships and security policies.

2. **Performance Optimization**: The gallery needs to handle potentially thousands of media items efficiently, requiring virtualization, lazy loading, and optimized rendering.

3. **Responsive Layout**: The masonry layout must work flawlessly across all device sizes, with special attention to mobile touch interactions.

4. **Accessibility**: All components must be keyboard accessible, work with screen readers, and follow WCAG guidelines.

5. **Security**: The guest upload system needs robust security to prevent abuse while allowing easy access for legitimate guests.

## 🛠️ Implementation Approach

### Database Migration

Start by implementing the schema changes described in `docs/design/media_schema_migration.md`:

```sql
-- Create media table with type discriminator
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL CHECK (media_type IN ('photo', 'video')),
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  url TEXT,
  thumbnail_url TEXT,
  size INTEGER,
  mime_type TEXT,
  width INTEGER,
  height INTEGER,
  duration INTEGER, -- New field for videos (in seconds)
  uploaded_by UUID REFERENCES auth.users(id),
  is_approved BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

Then create TypeScript interfaces in `src/types/media.ts`:

```typescript
export type MediaType = 'photo' | 'video';

export interface Media {
  id: string;
  event_id: string;
  media_type: MediaType;
  storage_path: string;
  filename: string;
  url?: string;
  thumbnail_url?: string;
  size?: number;
  mime_type?: string;
  width?: number | null;
  height?: number | null;
  duration?: number | null; // for videos
  uploaded_by: string | null;
  is_approved: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### Upload Component

Follow the direct style approach for layout as documented in `docs/design/consistent-layout.md` and `docs/design/layout-troubleshooting.md`. Make sure to implement mobile detection:

```tsx
// Upload component with mobile detection
export function UploadDropzone({ eventId, onComplete }: UploadProps) {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  // Implementation with conditional styling based on isMobile
}
```

### Masonry Layout

Implement a responsive masonry layout with dynamic column adjustment:

```tsx
export function MasonryGrid({ media }: MasonryGridProps) {
  const [columns, setColumns] = useState(3);
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      
      if (width < 640) setColumns(1);
      else if (width < 1024) setColumns(2);
      else if (width < 1536) setColumns(3);
      else setColumns(4);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Distribute media into columns
}
```

### Security Implementation

For the guest upload system, implement token-based security:

```typescript
// Validate guest upload token
export async function validateUploadToken(token: string, eventId: string) {
  const supabase = createServerComponentClient({ cookies });
  
  const { data, error } = await supabase
    .from('guest_uploads')
    .select('*')
    .eq('upload_token', token)
    .eq('event_id', eventId)
    .eq('is_active', true)
    .gt('expires_at', new Date().toISOString())
    .single();
    
  if (error || !data) {
    return false;
  }
  
  return true;
}
```

## 📚 Key Documentation

To assist with implementation, refer to these documents:

1. `docs/design/gallery_implementation.md` - Detailed design specifications
2. `docs/design/media_schema_migration.md` - Database migration plan
3. `docs/design/media_upload_sequence_diagram.md` - Upload flow
4. `docs/design/consistent-layout.md` - Layout guidelines
5. `docs/design/layout-troubleshooting.md` - Solutions for layout issues
6. `docs/rbac/role_based_access_control.md` - Permission system
7. `docs/backend-integration.mdc` - Backend patterns
8. `docs/core-standards.mdc` - Code standards

## 🔄 Workflow Recommendation

1. Start with the database migration to establish the foundation
2. Implement the core Supabase utility functions for media
3. Build the upload component with proper validation and feedback
4. Create the media card components for both photos and videos
5. Implement the masonry layout with responsive behavior
6. Add album management functionality
7. Create the guest upload system with proper security
8. Test thoroughly across devices and accessibility tools
9. Document the implementation thoroughly

## 🧪 Testing Approach

For each component, create test cases that verify:
- Functional behavior
- Responsive design across breakpoints
- Accessibility compliance
- Error handling
- Performance with large datasets

## 🚀 Get Started

Begin by examining the schema migration plan and implementing the necessary database changes. After that, proceed with building the upload components and then the gallery view.

Let's transform Cloud Burst with an amazing gallery system that delights users and showcases their precious moments!
