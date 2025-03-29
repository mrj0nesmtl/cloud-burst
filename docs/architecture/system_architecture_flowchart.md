# 🏛️ **System Architecture Flowchart (Beta v0.8.3)**  

## Cloud Burst  
📅 *Updated: March 29, 2025*  
📊 *Version: 0.8.3*

---

```mermaid
flowchart TD
    subgraph Client[📱 Client Layer]
        WebApp[🌐 Next.js 14 App]
        AuthForms[🔐 Auth Forms]
        Protected[🛡️ Protected Routes]
        TanStack[📊 TanStack Query]
        Dashboard[📊 Dashboard Components]
        Templates[📧 Template Management]
        RBAC[🔒 Role-Based Access]
        Events[📅 Event Management]
        Gallery[🖼️ Gallery Components]
        Analytics[📈 Analytics System]
        Charts[📊 Chart Components]
        Forms[📝 Form System]
        Invitations[📨 Invitation System]
        RSVP[📝 RSVP System]
        AIFeatures[🤖 AI Features]
        QRScanner[📱 QR Scanner]
        ErrorPages[❌ Error Pages]
        VerificationFlow[✅ Verification Flow]
        EmailDelivery[📧 Email Delivery]
        ClientComponents[👤 Client Components]
        ServerComponents[🖥️ Server Components]
    end

    subgraph Auth[🔑 Authentication Layer]
        SupaAuth[Supabase Auth]
        Session[📝 Session Management]
        Roles[👥 Role System]
        Zustand[🔄 Auth Store]
        Permissions[🔐 Permission System]
        InviteAuth[📨 Invitation Auth]
        EmailAuth[📧 Email Auth]
        ErrorHandler[❌ Error Handler]
        TokenManager[🔑 Token Manager]
        SendGrid[📨 SendGrid Integration]
        ClientSideAuth[👤 Client-side Auth]
        ServerSideAuth[🖥️ Server-side Auth]
    end

    subgraph Data[💾 Data Layer]
        Database[🗄️ Supabase PostgreSQL]
        Storage[📦 Supabase Storage]
        RLS[🔒 Enhanced RLS]
        TemplateDB[📋 Template Configurations]
        EventsDB[📅 Events Database]
        MediaDB[🎬 Media Database]
        AttendeeDB[👥 Attendees Database]
        AnalyticsDB[📊 Analytics Database]
        InvitationsDB[📨 Invitations Database]
        RSVPDB[📝 RSVP Database]
        AIProcessingDB[🤖 AI Processing]
        EmailTemplatesDB[📧 Email Templates]
        EmailAssetsDB[🖼️ Email Assets]
        EmailLogsDB[📋 Email Delivery Logs]
    end

    subgraph AILayer[🤖 AI Processing Layer]
        TensorFlow[TensorFlow.js]
        WebWorkers[🔄 Web Workers]
        ModelLoader[📦 Model Loader]
        FacialRecognition[👤 Facial Recognition]
        ImageEnhancement[✨ Image Enhancement]
        ObjectDetection[🔍 Object Detection]
        SmartTagging[🏷️ Smart Tagging]
        AIStudio[🎨 AI Studio]
    end

    WebApp -->|1. Renders| ServerComponents
    WebApp -->|2. Hydrates| ClientComponents
    ClientComponents -->|3. Auth Request| AuthForms
    AuthForms -->|4. Credentials| ClientSideAuth
    ClientSideAuth -->|5. Authenticate| SupaAuth
    ServerComponents -->|6. Auth Request| ServerSideAuth
    ServerSideAuth -->|7. Session| SupaAuth
    SupaAuth -->|8. Validate| Session
    Session -->|9. Create| Roles
    Roles -->|10. Define| Permissions
    Permissions -->|11. Check| RBAC
    RBAC -->|12. Control| Protected
    Protected -->|13. Load| Dashboard
    Protected -->|13. Load| Gallery
    Protected -->|13. Load| Analytics
    Protected -->|13. Load| Invitations
    Protected -->|13. Load| AIFeatures
    Protected -->|13. Load| RSVP
    AIFeatures -->|14. Process| AILayer
    TensorFlow -->|15. Load| ModelLoader
    FacialRecognition -->|16. Process| MediaDB
    ImageEnhancement -->|17. Process| MediaDB
    ObjectDetection -->|18. Process| MediaDB
    SmartTagging -->|19. Process| MediaDB
    Roles -->|20. Access| Database
    Roles -->|20. Access| Storage
    TanStack -->|21. Cache| Data
    Zustand -->|22. State| ClientComponents
    Analytics -->|23. Render| Charts
    Charts -->|24. Visualize| AnalyticsDB
    Templates -->|25. Manage| TemplateDB
    Templates -->|26. Sync| SupaAuth
    Events -->|27. Manage| EventsDB
    Events -->|28. Manage| AttendeeDB
    Gallery -->|29. Display| MediaDB
    Analytics -->|30. Visualize| AnalyticsDB
    Forms -->|31. Validate| Data
    Invitations -->|32. Manage| InvitationsDB
    RSVP -->|33. Manage| RSVPDB
    Invitations -->|34. Send| EmailDelivery
    EmailDelivery -->|35. Process| SendGrid
    SendGrid -->|36. Log| EmailLogsDB
    QRScanner -->|37. Authenticate| InviteAuth
    InviteAuth -->|38. Validate| InvitationsDB
    ErrorPages -->|39. Handle| ErrorHandler
    VerificationFlow -->|40. Process| EmailAuth
    EmailAuth -->|41. Templates| EmailTemplatesDB
    EmailAuth -->|42. Assets| EmailAssetsDB
    TokenManager -->|43. Manage| Session
```

## 🛠️ **Beta Components (v0.8.3)**  

### 📱 **Client Layer**
- Next.js 14 App Router
- TypeScript + React
- Client/Server Component Architecture
- React Hooks in Client Components
- Server-Side Data Fetching
- Server Components for Static Content
- Client Components for Interactivity
- Shadcn/ui Components
- TanStack Query Integration
- Protected Route System
- Dashboard Components
- Template Management UI
- Role-Based Access Control
- Event Management System
- Gallery Components (Photos & Videos)
- Analytics Components
- Chart Components for Data Visualization
- Invitation System UI (Complete)
- RSVP System UI (In Progress)
- AI Features Framework (Complete)
- QR Code Scanner
- React Hook Form + Zod Validation
- Error Pages
- Verification Flow UI
- Email Template Preview
- SendGrid Email Integration

### 🔑 **Authentication Layer**
- Client-side Auth for Interactive Components
- Server-side Auth for Data Fetching
- Supabase Auth
- Enhanced Session Management
- Role-based Access Control
- Zustand Auth Store
- Template Synchronization
- Permission System
- Conditional UI Rendering
- Form Validation
- Invitation-based Authentication
- QR Code Authentication
- Error Handling System
- Email Authentication Flow
- Token Management
- Link Expiration Handling
- SendGrid Delivery System

### 💾 **Data Layer**
- PostgreSQL Database
- Storage Integration
- Enhanced RLS Policies
- Template Configurations Table
- Events Database
- Media Database (Photos & Videos)
- Attendees Database
- Analytics Database
- Invitations Database
- RSVP Database
- AI Processing Database
- Role Capabilities Table
- Email Templates Database
- Email Assets Storage
- Email Delivery Logs

### 🤖 **AI Processing Layer**
- TensorFlow.js Integration (In Progress)
- Web Workers for Background Processing
- Model Loading and Caching System
- Facial Recognition Pipeline
- Image Enhancement System
- Object Detection for Product Placement
- Smart Tagging for Organization
- AI Studio for Custom Transformations

---

## 📐 **Beta System Overview (v0.8.3)**  

```mermaid
graph TD
    Client["📱 Client Device"] -->|"🔗 HTTPS Request"| WebApp["🌐 Web App (Next.js)"]
    WebApp -->|"📄 Server Components"| ServerComp["🖥️ Server Components"]
    WebApp -->|"📄 Client Components"| ClientComp["👤 Client Components"]
    WebApp -->|"🔌 API Calls"| Supabase["🗄️ Supabase"]
    WebApp -->|"📊 Dashboard"| Dashboard["📊 Dashboard System"]
    WebApp -->|"📧 Template Management"| Templates["📋 Template System"]
    WebApp -->|"📅 Event Management"| Events["📅 Event System"]
    WebApp -->|"🖼️ Gallery Management"| Gallery["🖼️ Gallery System"]
    WebApp -->|"👥 Attendee Management"| Attendees["👥 Attendee System"]
    WebApp -->|"⚙️ User Settings"| Settings["⚙️ Settings System"]
    WebApp -->|"📈 Analytics"| Analytics["📈 Analytics System"]
    WebApp -->|"🔒 Access Control"| RBAC["🔒 RBAC System"]
    WebApp -->|"📨 Invitation System"| Invitations["📨 Invitation System"]
    WebApp -->|"📝 RSVP System"| RSVP["📝 RSVP System"]
    WebApp -->|"🤖 AI Features"| AI["🤖 AI System"]
    WebApp -->|"📊 Data Visualization"| Charts["📊 Chart System"]
    WebApp -->|"📱 QR Scanning"| QRScanner["📱 QR Scanner"]
    ServerComp -->|"🔄 Data Fetch"| Supabase
    ClientComp -->|"🔄 State"| Supabase
    Dashboard -->|"🔄 Load"| Supabase
    Templates -->|"🔄 Sync"| Supabase
    Events -->|"🔄 CRUD"| Supabase
    Gallery -->|"🔄 CRUD"| Supabase
    Attendees -->|"🔄 CRUD"| Supabase
    Settings -->|"🔄 CRUD"| Supabase
    Analytics -->|"🔄 Query"| Supabase
    Analytics -->|"📊 Visualize"| Charts
    RBAC -->|"🔐 Verify"| Supabase
    Invitations -->|"🔄 CRUD"| Supabase
    RSVP -->|"🔄 CRUD"| Supabase
    AI -->|"🔄 Process"| Supabase
    AI -->|"🤖 Models"| TensorFlow["🤖 TensorFlow.js"]
    Invitations -->|"📧 Send"| SendGrid["📧 SendGrid"]
    SendGrid -->|"📊 Log"| Supabase
    QRScanner -->|"🔐 Authenticate"| Supabase
    Supabase --> Auth["🔑 Auth"]
    Supabase --> Database["💾 Database"]
    Supabase --> Storage["📦 Storage"]
    Supabase --> Email["📧 Email"]
    
    style AI fill:#9333ea,stroke:#333,color:#fff
    style TensorFlow fill:#6b21a8,stroke:#333,color:#fff
    style Charts fill:#0ea5e9,stroke:#333,color:#fff
    style RSVP fill:#0284c7,stroke:#333,color:#fff
```

## 🔒 **Security (v0.8.3)**  
✅ **Complete Auth** – Email/password & social login  
✅ **Enhanced RLS** – Role-based data protection  
✅ **Route Guards** – Protected routes with role verification  
✅ **Template Security** – RLS policies for template access  
✅ **API Protection** – Secured API routes  
✅ **RBAC System** – Comprehensive role-based access control  
✅ **Permission Gates** – Conditional UI rendering based on permissions  
✅ **Event Security** – Owner-based access control for events  
✅ **Gallery Security** – Content moderation and access controls  
✅ **Analytics Security** – Role-based access to metrics  
✅ **Invitation Security** – Secure invitation token generation and validation  
✅ **QR Security** – Encrypted QR code data with validation  
✅ **Form Validation** – Zod schema validation for all inputs  
✅ **Error Handling** – Comprehensive error states and recovery  
✅ **Email Delivery** – Secure SendGrid integration with tracking
✅ **Server/Client Auth** – Proper authentication for both contexts
✅ **AI Data Security** – Client-side processing for data privacy

## 🎯 **Next Steps (v0.9.0)**  
1. 📝 Complete RSVP system with magic link authentication for guests
2. 🤖 Implement TensorFlow.js integration for client-side AI processing
3. 🖼️ Enhance Gallery system with masonry layout and advanced filtering
4. 📊 Finalize Analytics dashboard with real-time metrics
5. 📱 Implement QR code scanning and camera integration for media capture
6. 📚 Complete user documentation and guides

## 📨 **Client/Server Component Architecture**

```mermaid
flowchart TD
    subgraph NextApp[Next.js 14 App Router]
        ServerComp[Server Components]
        ClientComp[Client Components]
    end

    subgraph ServerFeatures[Server Component Features]
        DataFetching[Initial Data Fetching]
        SEO[SEO & Metadata]
        StaticContent[Static Content Rendering]
        AuthContext[Server-side Auth Context]
        ComponentStructure[Page Structure]
    end

    subgraph ClientFeatures[Client Component Features]
        ReactHooks[React Hooks]
        StateManagement[Client-side State]
        Interactivity[User Interactivity]
        ClientSideAuth[Client-side Auth]
        EventHandlers[Event Handlers]
        AIProcessing[AI Model Processing]
        DataVisualization[Chart Rendering]
    end

    ServerComp -->|Renders| DataFetching
    ServerComp -->|Manages| SEO
    ServerComp -->|Provides| StaticContent
    ServerComp -->|Handles| AuthContext
    ServerComp -->|Defines| ComponentStructure
    
    ClientComp -->|Uses| ReactHooks
    ClientComp -->|Manages| StateManagement
    ClientComp -->|Enables| Interactivity
    ClientComp -->|Handles| ClientSideAuth
    ClientComp -->|Provides| EventHandlers
    ClientComp -->|Executes| AIProcessing
    ClientComp -->|Renders| DataVisualization
    
    ServerComp -->|Passes Props To| ClientComp
    ClientComp -->|Hydrates From| ServerComp
    
    NextApp -->|Routes| ServerComp
    NextApp -->|Hydrates| ClientComp
```

## 🤖 **AI Features Framework Architecture**

```mermaid
flowchart TD
    subgraph AISystem[AI Features System]
        AINavigation[AI Navigation Framework]
        FacialRecognition[Facial Recognition]
        Enhancements[Photo Enhancements]
        ProductPlacements[Product Placements]
        SmartTagging[Smart Tagging]
        AIStudio[AI Studio]
    end

    subgraph ProcessingPipeline[Processing Pipeline]
        TensorFlowJS[TensorFlow.js]
        WebWorkers[Web Workers]
        ModelLoader[Model Loader]
        ImageProcessor[Image Processor]
        ResultRendering[Result Rendering]
    end

    subgraph Components[UI Components]
        Tabs[Tab Navigation]
        AICards[Feature Cards]
        StatusBadges[Status Badges]
        ProcessingControls[Processing Controls]
        ResultPreview[Result Preview]
    end

    AINavigation -->|Navigate To| FacialRecognition
    AINavigation -->|Navigate To| Enhancements
    AINavigation -->|Navigate To| ProductPlacements
    AINavigation -->|Navigate To| SmartTagging
    AINavigation -->|Navigate To| AIStudio
    
    FacialRecognition -->|Process Using| TensorFlowJS
    Enhancements -->|Process Using| TensorFlowJS
    ProductPlacements -->|Process Using| TensorFlowJS
    SmartTagging -->|Process Using| TensorFlowJS
    AIStudio -->|Process Using| TensorFlowJS
    
    TensorFlowJS -->|Run In| WebWorkers
    WebWorkers -->|Load Models Via| ModelLoader
    ModelLoader -->|Process Images With| ImageProcessor
    ImageProcessor -->|Display Results In| ResultRendering
    
    FacialRecognition -->|Renders| Tabs
    FacialRecognition -->|Displays| AICards
    FacialRecognition -->|Shows| StatusBadges
    AIStudio -->|Provides| ProcessingControls
    ResultRendering -->|Updates| ResultPreview
    
    style AINavigation fill:#9333ea,stroke:#333,color:#fff
    style TensorFlowJS fill:#6b21a8,stroke:#333,color:#fff
    style WebWorkers fill:#7e22ce,stroke:#333,color:#fff
    style ModelLoader fill:#8b5cf6,stroke:#333,color:#fff
    style ImageProcessor fill:#a855f7,stroke:#333,color:#fff
```

## 📊 **Chart Components Architecture**

```mermaid
flowchart TD
    subgraph ChartSystem[Chart Component System]
        ChartContainer[Chart Container]
        ChartTooltip[Chart Tooltip]
        ChartLegend[Chart Legend]
        ChartConfig[Chart Config Interface]
    end

    subgraph ChartTypes[Chart Types]
        AreaChart[Area Chart]
        BarChart[Bar Chart]
        LineChart[Line Chart]
        PieChart[Pie Chart]
    end

    subgraph Features[Chart Features]
        Responsiveness[Responsive Design]
        Theming[Theme Support]
        Tooltips[Interactive Tooltips]
        ClientSide[Client-side Rendering]
        TypeSafety[TypeScript Support]
    end

    ChartContainer -->|Renders| AreaChart
    ChartContainer -->|Renders| BarChart
    ChartContainer -->|Renders| LineChart
    ChartContainer -->|Renders| PieChart
    
    ChartContainer -->|Provides| Responsiveness
    ChartContainer -->|Applies| Theming
    ChartTooltip -->|Enables| Tooltips
    ChartConfig -->|Ensures| TypeSafety
    ChartContainer -->|Uses| ClientSide
    
    AreaChart -->|Displays| ChartTooltip
    BarChart -->|Displays| ChartTooltip
    LineChart -->|Displays| ChartTooltip
    PieChart -->|Displays| ChartTooltip
    
    AreaChart -->|Shows| ChartLegend
    BarChart -->|Shows| ChartLegend
    LineChart -->|Shows| ChartLegend
    PieChart -->|Shows| ChartLegend
    
    style ChartContainer fill:#0ea5e9,stroke:#333,color:#fff
    style ChartTooltip fill:#0284c7,stroke:#333,color:#fff
    style ChartLegend fill:#0369a1,stroke:#333,color:#fff
    style ChartConfig fill:#0891b2,stroke:#333,color:#fff
```

## 4. CHANGELOG Update

```markdown
# Changelog

## [0.8.3] - 2025-04-17
### Added in Session 33
- **AI Features Framework**:
  - Added AI Features section to sidebar navigation with appropriate icons
  - Created layout structure for AI features section with tab navigation
  - Implemented placeholder pages for five key AI features:
    - Facial Recognition with feature overview and privacy information
    - Enhancements with feature overview and enhancement options
    - Product Placements with feature overview and placement options
    - Smart Tagging with feature overview and tag categories
    - AI Studio with feature overview and available models
  - Added "Coming Soon" and "Beta" badges to indicate feature status
  - Created consistent UI structure across all AI feature pages

### Fixed in Session 33
- **Chart Component Implementation**:
  - Created chart components for data visualization
  - Implemented chart container, tooltip, and legend components
  - Fixed TypeScript errors in chart implementation
  - Added string type annotation for labelFormatter parameter
  - Enhanced area chart interactive component with proper typing
  - Ensured compatibility with client components using 'use client' directive
  - Created reusable chart config interface for consistent styling

## [0.8.2] - 2025-03-27
### Fixed in Session 30
- **Next.js App Router Architecture Fixes**:
  - Added `'use client'` directives to interactive components using React hooks
  - Fixed components: `GalleryHeader.tsx`, `MasonryGrid.tsx`, and `MediaViewer.tsx`
  - Ensured proper client-side hydration for components with state management
  - Fixed gallery page authentication by switching from client-side to server-side data fetching
  - Replaced `getUserGalleries()` with `getUserGalleriesServer()` in gallery event pages
  - Ensured proper access to user authentication context in server components
- **Gallery Page Implementation**:
  - Fixed media item mapping to properly display photos in MasonryGrid
  - Added event data to media items for better context
  - Improved error handling in gallery pages
  - Enhanced type safety throughout gallery implementation
  - Created proper mapping between database types and component types

### Added in Session 30
- **Development Documentation**:
  - Created SESSION_30_CLOSING.md with detailed documentation of fixes
  - Documented key architectural patterns for Next.js App Router
  - Added lessons learned about client/server component separation
  - Documented authentication handling in Next.js server components