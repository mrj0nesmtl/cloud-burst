# Session 28 Development Prompt: Gallery Implementation & Dashboard Enhancements

## Project Context
Cloud Burst is transitioning into version 0.8.0, focusing on implementing a comprehensive gallery system, enhancing the dashboard with analytics, integrating the invitation system with email templates, and developing the onboarding flow for new organizers. Following the successful resolution of build errors and permission issues in Session 27, we now have a stable foundation to build these critical features.

## Current Status
- Successfully resolved build errors related to server-only imports
- Fixed event visibility and permission issues
- Enhanced UI for better visibility in light mode
- Improved event ownership and management
- Platform is stable and ready for feature implementation

## Technical Requirements

### 1. Gallery System Implementation
- **Database Migration**: Create a flexible schema that supports both photos and videos
- **Upload Component**: Build a responsive drag-and-drop interface with progress visualization
- **Media Card Components**: Design consistent, visually appealing cards with appropriate actions
- **Masonry Layout**: Implement a dynamic column system that adapts to different screen sizes
- **Album Management**: Develop intuitive interfaces for organizing media into albums
- **Guest Upload System**: Implement secure token-based authentication for guest contributions

### 2. Dashboard Enhancements
- **Analytics Panels**: Create clean, informative UI components displaying key metrics
- **Data Visualization**: Implement charts and graphs for illustrating trends and engagement
- **Filtering and Export**: Add tools for filtering data by date range and exporting results
- **Mobile Optimization**: Ensure analytics are accessible and useful on all devices

### 3. Invitation System Integration
- **Email Templates**: Develop professional, customizable email designs for various communications
- **QR Code Tracking**: Integrate QR codes within emails for easy check-in and tracking
- **Guest Permissions**: Implement fine-grained control over guest access and contributions
- **RSVP Functionality**: Create simple response mechanisms with real-time dashboard updates

### 4. Onboarding Flow
- **Step-by-Step Setup**: Guide new users through creating profiles and initial events
- **Template Selection**: Offer pre-defined event templates for quick starts
- **Welcome Automation**: Implement personalized emails and in-app guidance
- **Contextual Help**: Provide just-in-time assistance throughout the interface

## Development Approach
- Follow mobile-first design principles
- Ensure type safety with TypeScript
- Implement comprehensive testing for all components
- Maintain accessibility compliance (WCAG 2.1 AA)
- Optimize performance for large media collections
- Follow security best practices for user data and uploads
- Write clean, maintainable code with proper documentation

## Implementation Timeline
- **March 23-25**: Database migration, upload component
- **March 26-28**: Media cards, masonry layout
- **March 29-31**: Album management, guest uploads, analytics, invitations, onboarding
- **April 1**: Target Beta 0.9.0 release

## Specific Tasks

1. **Design and implement the database schema evolution**:
   - Rename photos table to media
   - Add fields for video-specific metadata
   - Update related tables and relationships
   - Implement appropriate RLS policies

2. **Create a responsive upload dropzone component**:
   - Support drag-and-drop and file browsing
   - Implement file type and size validation
   - Add progress visualization
   - Create appropriate success/error states
   - Optimize for touch devices

3. **Build the gallery interface with masonry layout**:
   - Implement responsive grid system
   - Create media card components
   - Add lazy loading for performance
   - Ensure keyboard accessibility
   - Optimize for mobile viewing

4. **Develop album management system**:
   - Create interfaces for album creation and editing
   - Implement media assignment to albums
   - Add cover selection capability
   - Create sharing options
   - Build album navigation

5. **Implement guest upload system**:
   - Design token-based authentication
   - Create secure upload interface
   - Add validation and moderation queue
   - Implement expiration for upload tokens
   - Build organizer notification system

6. **Enhance dashboard with analytics**:
   - Design analytics panels with clean UI
   - Implement metrics tracking
   - Create data visualization components
   - Add export functionality
   - Optimize for mobile viewing

7. **Integrate invitation system**:
   - Implement email templates
   - Add QR code tracking
   - Create guest permission management
   - Build RSVP functionality
   - Add notification system for responses

8. **Develop onboarding flow**:
   - Design step-by-step setup process
   - Implement profile completion workflow
   - Create event template selection
   - Add welcome email automation
   - Build contextual help system

## Success Criteria
- Users can upload, view, and organize both photos and videos
- Organizers can gain insights from the analytics dashboard
- Invitations can be sent with professional email templates
- New users can quickly set up profiles and first events
- All components maintain standards for performance, accessibility, and security

## Technical Stack Reference
- Next.js 14 with App Router
- TypeScript 5.0
- Zustand for state management
- Tailwind CSS for styling
- Shadcn/ui for components
- Supabase for authentication, database, and storage
- React Hook Form with Zod for forms
- TanStack Query v5 for data fetching

## Project Structure
```typescript
src/
├── app/                  # Next.js 14 App Router routes
│   ├── auth/            # Authentication routes
│   ├── dashboard/       # Protected dashboard routes
│   ├── events/          # Event management routes
│   ├── settings/        # User settings routes
│   └── gallery/         # Gallery management routes (focus area)
├── components/          
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard components
│   ├── gallery/        # Gallery components (focus area)
│   ├── ui/             # Shadcn UI components
│   └── forms/          # Form components
├── lib/                
│   ├── utils/          # Utility functions
│   ├── supabase/       # Supabase client
│   └── validation/     # Zod schemas
├── hooks/              # Custom React hooks
├── types/              # TypeScript types
├── styles/            # CSS/Tailwind styles
├── store/             # Zustand stores
└── middleware/        # Route middleware
```

## Gallery Implementation Focus
1. **Database Migration**
   - Rename `photos` table to `media`
   - Add video-specific fields
   - Create guest uploads tracking
   - Update RLS policies

2. **Core Components**
   - Upload dropzone with progress tracking
   - Gallery grid with media cards
   - Masonry layout implementation
   - Touch-optimized controls

3. **Guest Upload System**
   - Token-based authentication
   - Invitation management
   - Upload interface for guests
   - Moderation system

4. **Album Management**
   - Album creation interface
   - Media assignment to albums
   - Cover selection tools
   - Sharing capabilities

## Mobile-First Approach
All components will follow our established mobile-first patterns:
- Direct style approach with `style` prop
- Mobile detection in each component
- Touch-friendly interactions
- Responsive layouts based on viewport
- Performance optimization for mobile

## Technical Implementation Example
```tsx
// Example gallery grid component with mobile optimization
import { useState, useEffect } from 'react';

export function GalleryGrid({ media }) {
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
      gap: isMobile ? '16px' : '24px',
      padding: isMobile ? '16px' : '24px'
    }}>
      {media.map(item => (
        <MediaCard 
          key={item.id} 
          media={item} 
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}
```

## Development Approach
1. **Phase-Based Implementation**
   - Database Migration & Core Upload (Days 1-2)
   - Guest Upload System (Days 3-4)
   - Album Management (Days 5-6)
   - Advanced Features & Polish (Days 7-8)

2. **Quality Standards**
   - Mobile-responsive across all devices
   - Touch-friendly with proper target sizes
   - Performance optimized for image loading
   - Accessible with keyboard navigation
   - Secure with proper RLS policies

## Relevant Rules
The following rule sets should be referenced:
- gallery (focus on implementation patterns)
- mobile (for responsive implementation)
- ai-collaboration-guidelines
- core-standards

## Success Metrics
- Complete database schema migration
- Functional upload system for photos and videos
- Working guest upload with token validation
- Responsive masonry layout with optimized loading
- Touch-friendly controls on mobile devices
- Consistent rendering across all device sizes

Let's proceed with implementing the gallery system following our consolidated implementation plan and mobile-first approach. 