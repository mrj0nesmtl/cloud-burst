# 📖 **User Flow Overview**  

## Cloud Burst
📅 *Updated: March 14, 2025*  
📊 *Version: 0.7.8*

## 📌 Situational Abstract
Following the successful implementation of the Gallery System with video support, Cloud Burst now offers a comprehensive media management platform. Users can capture and share both photos and videos seamlessly through QR code check-ins that patch directly to their mobile device cameras. The platform now features enhanced processing for both media types, with optimized streaming capabilities for video content and multiple viewing options for all media.

The media management system is approximately 90% complete, with recent additions including direct camera integration, video capture support, and enhanced gallery layouts that accommodate both photos and videos. Current development focuses on optimizing video processing and implementing advanced sharing options for mixed media galleries.

## 🔄 **Core User Flows** [Updated]

```mermaid
flowchart TD
    A[User] --> B{Auth Check}
    B -->|No Auth| C[Landing Page]
    B -->|Has Auth| D[Dashboard]
    B -->|Event URL/QR| E[Event Gallery]
    
    C --> |Sign Up| F[Auth Form]
    C --> |Sign In| F
    F --> |Success| D
    
    D --> G[Super Admin]
    D --> H[Admin]
    D --> I[Organizer]
    D --> J[Event Host]
    D --> K[User]
    D --> L[Guest]
    
    G --> M[Admin Dashboard]
    G --> N[Template Management]
    G --> O[User Management]
    G --> P[Role Management]
    
    H --> Q[Admin Dashboard]
    H --> R[Event Management]
    H --> S[Media Moderation]
    
    I --> T[Event Dashboard]
    I --> U[Event Creation]
    I --> V[Attendee Management]
    
    J --> W[Event Dashboard]
    J --> X[Basic Management]
    
    K --> Y[User Dashboard]
    K --> Z[Profile Settings]
    
    L --> AA[Gallery Access]
    E --> AA
    
    AA --> AB[View Gallery]
    AA --> AC[Capture Media]
    
    AC --> AD[Photo Capture]
    AC --> AE[Video Recording]
    
    AB --> AF[Grid View]
    AB --> AG[Masonry View]
    AB --> AH[Slideshow View]
    
    AF --> AI[Media Actions]
    AG --> AI
    AH --> AI
    
    AI --> AJ[Like/Comment]
    AI --> AK[Share]
    AI --> AL[Download]
    
    AD --> AM[Upload Process]
    AE --> AM
    AM --> AN[Processing]
    AN --> AO[Gallery Update]
```

## 📸 **Media Capture Flow** [Enhanced]

```mermaid
flowchart TD
    A[Attendee] --> B[Scan QR Code]
    B --> C[Camera Access]
    C --> D{Media Type}
    
    D -->|Photo| E[Take Photo]
    D -->|Video| F[Record Video]
    
    E --> G[Review]
    F --> G
    
    G --> H{Approval}
    H -->|Yes| I[Upload Process]
    H -->|No| D
    
    I --> J[Processing]
    J --> K[Gallery Update]
    K --> L[View in Gallery]
    
    L --> M[Media Actions]
    M --> N[Like/Comment]
    M --> O[Share]
    M --> P[Download]
```

## 🔐 **Security Flow** [Enhanced]

```mermaid
flowchart LR
    A[Request] --> B{Rate Limit}
    B -->|Passed| C{Auth Check}
    B -->|Failed| D[429 Error]
    C -->|Valid| E[Role Check]
    C -->|Invalid| F[Auth Page]
    E -->|Authorized| G[Permission Check]
    E -->|Unauthorized| H[403 Error]
    G -->|Has Permission| I[Protected Route]
    G -->|No Permission| J[403 Error]
    I --> K{Session Valid}
    K -->|Yes| L[Resource]
    K -->|No| F
```

## 📊 **Media Type Distribution**

```mermaid
pie
    title "Media Distribution by Type"
    "Photos" : 70
    "Videos" : 20
    "Mixed Albums" : 10
```

## 🔒 **Security-Enhanced Flow**  

### 🛡️ **Protected Routes**
- ✅ Rate limiting protection
- ✅ Method validation
- ✅ Dynamic pattern matching
- ✅ Session management
- ✅ Cookie security
- ✅ Role-based access control
- ✅ Permission-based access
- ✅ Row Level Security
- ✅ Error boundaries

### 🔐 **Authentication Layer**
- ✅ Secure session handling
- ✅ Cookie cleanup
- ✅ Rate limited endpoints
- ✅ Error boundaries
- ✅ Loading states
- ✅ Role verification
- ✅ Permission hooks
- ✅ Conditional UI rendering
- ✅ Resource ownership verification

## 📝 **Introduction**  
Cloud Burst is an **event media platform** designed to **seamlessly collect, filter, and organize event photos and videos**. The platform features comprehensive role-based access control, custom event URLs, and multiple gallery layouts to enhance the user experience.

📌 *This document outlines the complete user journey, from event creation to media engagement.*  

## 📈 **Feature Usage Distribution**

```mermaid
graph LR
    A[Features] --> B[Media Upload]
    A --> C[Gallery View]
    A --> D[Event Management]
    A --> E[Social Sharing]
    A --> F[Profile Settings]
    A --> G[Template Management]
    
    B --> H[40% Usage]
    C --> I[30% Usage]
    D --> J[15% Usage]
    E --> K[8% Usage]
    F --> L[4% Usage]
    G --> M[3% Usage]

    style H fill:#90EE90
    style I fill:#ADD8E6
    style J fill:#FFB6C1
    style K fill:#DDA0DD
    style L fill:#FFDAB9
    style M fill:#F0E68C
```

## 🏷️ **Pre-Event: Ticket Confirmation & QR Code**  

### 📩 **Email Components**
- `<AspectRatio>` for QR code display
- `<Card>` for email template
- `<Button>` for direct access
- `<TemplatePreview>` for email rendering
- ✅ Custom event URL integration
- ✅ Email template customization

✔️ Upon purchasing a ticket, users **receive an email** with:
  - Event details
  - Unique QR code for camera integration
  - Platform instructions
  - Custom event URL
  - Branding elements

## 🎉 **Event Arrival & Camera Integration**  

### 📱 **Access Components**
- `<Dialog>` for camera permission
- `<Tabs>` for auth options
- `<Form>` for guest info
- `<Button>` variants for social login
- `<Alert>` for authentication status
- `<CameraIntegration>` for direct device access
- `<MediaSelector>` for photo/video toggle
- ✅ Role-based access control
- ✅ Permission-based UI rendering

✔️ Users can:
  - Scan QR with smartphone
  - Use custom event URL
  - Grant camera access
  - Toggle between photo/video modes
  - Capture media directly within app
  - Set basic preferences

## 📸 **Media Management**  

### 📷 **Capture Components**
- `<CameraView>` for live preview
- `<MediaControls>` for photo/video toggle
- `<RecordButton>` for video capture
- `<CaptureButton>` for photos
- `<DropZone>` for manual uploads
- `<Progress>` for status
- `<Toast>` for notifications
- `<Carousel>` for media preview
- `<Skeleton>` for loading states
- ✅ Multiple file selection
- ✅ Direct camera integration
- ✅ Video recording with duration limits
- ✅ Drag-and-drop support
- ✅ Format validation
- ✅ Size optimization

✔️ Features include:
  - Direct camera integration
  - Video recording capabilities
  - Multiple file uploads
  - Progress indicators
  - Format validation
  - Error handling
  - Real-time processing

## 🖼️ **Gallery Experience**  

### 🎨 **Gallery Components**
- `<ScrollArea>` for gallery
- `<AspectRatio>` for images
- `<Dialog>` for previews
- `<VideoPlayer>` for video content
- `<MediaCard>` for unified display
- `<HoverCard>` for details
- `<Select>` for filter options
- ✅ Multiple gallery layouts (Grid, Masonry, Slideshow)
- ✅ Tag-based filtering
- ✅ Media type filtering
- ✅ Responsive design
- ✅ Video playback controls
- 🟡 Download options (70% complete)

✔️ Users can:
  - Browse real-time
  - Switch between layouts
  - Filter by tags or media type
  - Like and share
  - View full-screen
  - Play videos inline
  - Download favorites (in progress)

## 📧 **Email Template Management**

### 📝 **Template Components**
- `<TemplateList>` for template selection
- `<TemplateEditor>` for HTML editing
- `<TemplatePreview>` for visualization
- `<Button>` for synchronization
- `<Form>` for template settings
- ✅ Template versioning
- ✅ Role-based access
- ✅ Preview with sample data

✔️ Admin users can:
  - Edit email templates
  - Preview with sample data
  - Synchronize with Supabase Auth
  - Manage template variables
  - Track delivery analytics (in progress)
  - Set default templates

## 📩 **Post-Event Access**  

### 📊 **Download Components**
- `<Card>` for options
- `<Button>` for actions
- `<Alert>` for expiry
- `<Calendar>` for expiry countdown
- ✅ Custom event URL for sharing
- 🟡 Bulk download options (50% complete)

✔️ Features include:
  - Gallery link email
  - Custom event URL
  - Download options (in progress)
  - Expiration notices
  - Access countdown
  - Sharing capabilities

## 🔄 **Role-Based User Journeys**

### 👑 **Super Admin Journey**
1. Access admin dashboard
2. Manage users and roles
3. Configure system settings
4. Manage email templates
5. Monitor platform metrics
6. Oversee all events and galleries

### 🔑 **Admin Journey**
1. Access admin dashboard
2. Manage events and photos
3. Moderate content
4. Access email templates
5. View basic analytics
6. Support event organizers

### 📋 **Organizer Journey**
1. Create multiple events
2. Manage event details
3. Customize galleries
4. Manage attendees
5. Moderate photos
6. View event analytics

### 🎭 **Event Host Journey**
1. Create personal events
2. Basic event management
3. Manage attendee list
4. Access event gallery
5. Upload and moderate photos
6. Share event with guests

### 👤 **User Journey**
1. Access personal dashboard
2. Manage profile settings
3. View accessible events
4. Upload photos to galleries
5. Browse and interact with photos
6. Download favorites

### 👥 **Guest Journey**
1. Access event via QR code or URL
2. Optional quick registration
3. View event gallery
4. Upload photos (if permitted)
5. Interact with content
6. Receive post-event access

## 🔄 **Implementation Progress**

As we approach our April 1, 2025 launch date, the media management system is approximately 90% complete. Recent implementations include:

### Key Achievements:
- ✅ Comprehensive video support
- ✅ Direct camera integration for seamless capture
- ✅ Enhanced gallery layouts for mixed media
- ✅ Optimized video processing pipeline
- ✅ Improved mobile responsiveness

### Current Focus:
- 🟡 Optimizing video processing (80% complete)
- 🟡 Enhancing video playback controls (75% complete)
- 🟡 Implementing advanced sharing options (70% complete)
- 🟡 Finalizing download functionality (70% complete)

### Next Steps:
1. Complete video processing optimization
2. Enhance mobile video playback experience
3. Finalize download functionality for all media types
4. Implement advanced sharing options for galleries

## 🎯 **Conclusion**  
Cloud Burst ensures that event attendees can **easily capture, upload, and relive their event experience effortlessly** through both photos and videos. By integrating **role-based access control, direct camera integration, custom event URLs, multiple gallery layouts, and comprehensive video support**, Cloud Burst creates an **engaging and seamless user experience** that adapts to different user roles and media preferences. As we approach our April 1, 2025 launch date, the platform is well-positioned to deliver a polished, professional-grade solution for complete event media management.

---
