# 🏛️ **System Architecture Flowchart (Beta v0.7.9)**  

## Cloud Burst  
📅 *Updated: March 18, 2025*  
📊 *Version: 0.7.9*

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
        Forms[📝 Form System]
        Invitations[📨 Invitation System]
        QRScanner[📱 QR Scanner]
        ErrorPages[❌ Error Pages]
        VerificationFlow[✅ Verification Flow]
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
        EmailTemplatesDB[📧 Email Templates]
        EmailAssetsDB[🖼️ Email Assets]
    end

    WebApp -->|1. Auth Request| AuthForms
    AuthForms -->|2. Credentials| SupaAuth
    SupaAuth -->|3. Validate| Session
    Session -->|4. Create| Roles
    Roles -->|5. Define| Permissions
    Permissions -->|6. Check| RBAC
    RBAC -->|7. Control| Protected
    Protected -->|8. Load| Dashboard
    Protected -->|8. Load| Gallery
    Protected -->|8. Load| Analytics
    Protected -->|8. Load| Invitations
    Roles -->|9. Access| Database
    Roles -->|9. Access| Storage
    TanStack -->|10. Cache| Data
    Zustand -->|11. State| Protected
    Templates -->|12. Manage| TemplateDB
    Templates -->|13. Sync| SupaAuth
    Events -->|14. Manage| EventsDB
    Events -->|15. Manage| AttendeeDB
    Gallery -->|16. Display| MediaDB
    Analytics -->|17. Visualize| AnalyticsDB
    Forms -->|18. Validate| Data
    Invitations -->|19. Manage| InvitationsDB
    QRScanner -->|20. Authenticate| InviteAuth
    InviteAuth -->|21. Validate| InvitationsDB
    ErrorPages -->|22. Handle| ErrorHandler
    VerificationFlow -->|23. Process| EmailAuth
    EmailAuth -->|24. Templates| EmailTemplatesDB
    EmailAuth -->|25. Assets| EmailAssetsDB
    TokenManager -->|26. Manage| Session
```

## 🛠️ **Beta Components (v0.7.9)**  

### 📱 **Client Layer**
- Next.js 14 App Router
- TypeScript + React
- Shadcn/ui Components
- TanStack Query Integration
- Protected Route System
- Dashboard Components
- Template Management UI
- Role-Based Access Control
- Event Management System
- Gallery Components (Photos & Videos)
- Analytics Components
- Invitation System UI
- QR Code Scanner
- React Hook Form + Zod Validation
- Error Pages
- Verification Flow UI
- Email Template Preview

### 🔑 **Authentication Layer**
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
- Role Capabilities Table
- Email Templates Database
- Email Assets Storage

---

## 📐 **Beta System Overview (v0.7.8)**  

```mermaid
graph TD
    Client["📱 Client Device"] -->|"🔗 HTTPS Request"| WebApp["🌐 Web App (Next.js)"]
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
    WebApp -->|"📱 QR Scanning"| QRScanner["📱 QR Scanner"]
    Dashboard -->|"🔄 Load"| Supabase
    Templates -->|"🔄 Sync"| Supabase
    Events -->|"🔄 CRUD"| Supabase
    Gallery -->|"🔄 CRUD"| Supabase
    Attendees -->|"🔄 CRUD"| Supabase
    Settings -->|"🔄 CRUD"| Supabase
    Analytics -->|"🔄 Query"| Supabase
    RBAC -->|"🔐 Verify"| Supabase
    Invitations -->|"🔄 CRUD"| Supabase
    QRScanner -->|"🔐 Authenticate"| Supabase
    Supabase --> Auth["🔑 Auth"]
    Supabase --> Database["💾 Database"]
    Supabase --> Storage["📦 Storage"]
    Supabase --> Email["📧 Email"]
```

## 🔒 **Security (v0.7.9)**  
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

## 🎯 **Next Steps (v0.8.0)**  
1. 🖼️ Complete Gallery masonry layout and advanced filtering
2. 📊 Finalize Analytics dashboard with real-time metrics
3. 📤 Implement bulk upload functionality
4. 🚀 Optimize performance and image loading
5. 📱 Polish mobile experience and responsive design
6. 📚 Update technical documentation

## 📊 **Analytics Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        EngagementPage[📊 Engagement Metrics Page]
        EventsAnalyticsPage[📈 Events Analytics Page]
        MetricsCards[📊 Metrics Cards]
        TrendsCharts[📈 Trends Charts]
        OverviewDashboard[🔍 Overview Dashboard]
        ComparisonViews[⚖️ Comparison Views]
    end

    subgraph API[🔌 API Layer]
        AnalyticsAPI[📊 Analytics API]
        DataAggregationAPI[📊 Data Aggregation API]
        FilteringAPI[🔍 Filtering API]
        ExportAPI[📤 Export API]
    end

    subgraph Data[💾 Data Layer]
        EngagementDB[📊 Engagement Metrics]
        EventsDB[📅 Events Data]
        PhotosDB[📸 Photos Data]
        UserInteractionsDB[👤 User Interactions]
    end

    subgraph Processing[⚙️ Processing Layer]
        DataTransformation[🔄 Data Transformation]
        MetricsCalculation[🧮 Metrics Calculation]
        TrendAnalysis[📈 Trend Analysis]
        AggregationEngine[📊 Aggregation Engine]
    end

    EngagementPage -->|Display| MetricsCards
    EngagementPage -->|Display| TrendsCharts
    EngagementPage -->|Display| OverviewDashboard
    EventsAnalyticsPage -->|Display| MetricsCards
    EventsAnalyticsPage -->|Display| TrendsCharts
    EventsAnalyticsPage -->|Display| ComparisonViews
    
    MetricsCards -->|Fetch| AnalyticsAPI
    TrendsCharts -->|Fetch| AnalyticsAPI
    OverviewDashboard -->|Fetch| AnalyticsAPI
    ComparisonViews -->|Fetch| AnalyticsAPI
    
    AnalyticsAPI -->|Request| DataAggregationAPI
    AnalyticsAPI -->|Filter| FilteringAPI
    AnalyticsAPI -->|Export| ExportAPI
    
    DataAggregationAPI -->|Process| Processing
    FilteringAPI -->|Query| Data
    ExportAPI -->|Retrieve| Data
    
    Processing -->|Transform| DataTransformation
    Processing -->|Calculate| MetricsCalculation
    Processing -->|Analyze| TrendAnalysis
    Processing -->|Aggregate| AggregationEngine
    
    DataTransformation -->|Read| Data
    MetricsCalculation -->|Read| Data
    TrendAnalysis -->|Read| Data
    AggregationEngine -->|Read| Data
```

## 🖼️ **Gallery System Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        UploadDropzone[📤 Upload Dropzone]
        GalleryGrid[🖼️ Gallery Grid]
        MasonryLayout[🧱 Masonry Layout]
        SlideshowView[🔄 Slideshow View]
        FilmstripView[🎞️ Filmstrip View]
        PhotoLightbox[🔍 Photo Lightbox]
        ModerationQueue[✅ Moderation Queue]
        AlbumManagement[📁 Album Management]
    end

    subgraph API[🔌 API Layer]
        UploadAPI[📤 Upload API]
        GalleryAPI[🖼️ Gallery API]
        ModerationAPI[✅ Moderation API]
        AlbumAPI[📁 Album API]
        PhotoTagAPI[🏷️ Photo Tag API]
    end

    subgraph Data[💾 Data Layer]
        PhotosDB[📸 Photos Table]
        AlbumsDB[📁 Albums Table]
        TagsDB[🏷️ Tags Table]
        ModerationLogsDB[📋 Moderation Logs]
        StorageBucket[📦 Storage Bucket]
    end

    subgraph Processing[⚙️ Processing Layer]
        ImageOptimization[🔧 Image Optimization]
        Thumbnails[🖼️ Thumbnail Generation]
        MetadataExtraction[📋 Metadata Extraction]
        AITagging[🤖 AI Tagging]
    end

    UploadDropzone -->|Upload| UploadAPI
    GalleryGrid -->|Fetch| GalleryAPI
    MasonryLayout -->|Fetch| GalleryAPI
    SlideshowView -->|Fetch| GalleryAPI
    FilmstripView -->|Fetch| GalleryAPI
    PhotoLightbox -->|View| GalleryAPI
    ModerationQueue -->|Review| ModerationAPI
    AlbumManagement -->|Manage| AlbumAPI
    
    UploadAPI -->|Process| Processing
    UploadAPI -->|Store| StorageBucket
    GalleryAPI -->|Fetch| PhotosDB
    GalleryAPI -->|Fetch| AlbumsDB
    GalleryAPI -->|Fetch| TagsDB
    ModerationAPI -->|Update| PhotosDB
    ModerationAPI -->|Log| ModerationLogsDB
    AlbumAPI -->|CRUD| AlbumsDB
    PhotoTagAPI -->|CRUD| TagsDB
    
    Processing -->|Optimize| ImageOptimization
    Processing -->|Generate| Thumbnails
    Processing -->|Extract| MetadataExtraction
    Processing -->|Tag| AITagging
    
    ImageOptimization -->|Save| StorageBucket
    Thumbnails -->|Save| StorageBucket
    MetadataExtraction -->|Save| PhotosDB
    AITagging -->|Save| TagsDB
```

## 📊 **Dashboard Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        ActivityFeed[📋 Activity Feed]
        QuickActions[⚡ Quick Actions]
        DashboardStats[📊 Dashboard Stats]
        RecentEvents[🗓️ Recent Events]
        Navigation[🧭 Navigation]
    end

    subgraph Components[🧩 Component Layer]
        DashboardLayout[📐 Dashboard Layout]
        SideNav[📑 Side Navigation]
        TopNav[📌 Top Navigation]
        UserNav[👤 User Navigation]
        BreadcrumbNav[🧵 Breadcrumb Navigation]
    end

    subgraph Data[💾 Data Layer]
        EventsData[📅 Events Data]
        ProfileData[👤 Profile Data]
        ActivityData[📋 Activity Data]
        StatsData[📊 Stats Data]
    end

    Navigation -->|Structure| DashboardLayout
    DashboardLayout -->|Contains| SideNav
    DashboardLayout -->|Contains| TopNav
    DashboardLayout -->|Contains| UserNav
    DashboardLayout -->|Contains| BreadcrumbNav
    
    DashboardLayout -->|Displays| ActivityFeed
    DashboardLayout -->|Displays| QuickActions
    DashboardLayout -->|Displays| DashboardStats
    DashboardLayout -->|Displays| RecentEvents
    
    ActivityFeed -->|Loads| ActivityData
    DashboardStats -->|Loads| StatsData
    RecentEvents -->|Loads| EventsData
    UserNav -->|Loads| ProfileData
```

## 📧 **Template System Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        TemplateList[📋 Template List]
        Editor[✏️ Template Editor]
        Preview[👁️ Template Preview]
        AssetManager[🖼️ Asset Manager]
        DeliveryMetrics[📊 Delivery Metrics]
        SpamScore[📈 Spam Score]
    end

    subgraph API[🔌 API Layer]
        TemplateAPI[📡 Template API]
        SyncAPI[🔄 Sync API]
        CronAPI[⏱️ Cron API]
        AssetAPI[🖼️ Asset API]
        DeliveryAPI[📧 Delivery API]
    end

    subgraph Data[💾 Data Layer]
        TemplateDB[🗄️ Template Configurations]
        SupaAuth[🔑 Supabase Auth]
        FileSystem[📁 File System]
        AssetStorage[📦 Asset Storage]
        DeliveryStats[📊 Delivery Statistics]
    end

    TemplateList -->|View| TemplateDB
    Editor -->|Update| TemplateAPI
    Preview -->|Render| TemplateAPI
    AssetManager -->|Manage| AssetAPI
    DeliveryMetrics -->|Monitor| DeliveryAPI
    SpamScore -->|Check| DeliveryAPI
    
    TemplateAPI -->|CRUD| TemplateDB
    SyncAPI -->|Synchronize| SupaAuth
    CronAPI -->|Auto-Sync| SyncAPI
    AssetAPI -->|Store| AssetStorage
    DeliveryAPI -->|Track| DeliveryStats
    
    TemplateAPI -->|Fallback| FileSystem
```

## 📅 **Event Management Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        EventList[📋 Event List]
        EventDetail[📄 Event Detail]
        EventForm[📝 Event Form]
        BasicTab[🔍 Basic Information]
        AdvancedTab[⚙️ Advanced Settings]
        AttendeeManagement[👥 Attendee Management]
        QRCode[📱 QR Code Display]
        StatusSelector[🚦 Status Selector]
    end

    subgraph API[🔌 API Layer]
        EventAPI[📡 Event API]
        AttendeeAPI[👥 Attendee API]
        PhotoAPI[📸 Photo API]
        ValidationAPI[✅ Validation API]
        StatusAPI[🚦 Status API]
    end

    subgraph Data[💾 Data Layer]
        EventsDB[🗄️ Events Table]
        AttendeesDB[👥 Attendees Table]
        PhotosDB[📸 Photos Table]
        EventStatusDB[🚦 Event Status]
        RLS[🔒 Row Level Security]
    end

    EventList -->|View| EventAPI
    EventDetail -->|View| EventAPI
    EventForm -->|Contains| BasicTab
    EventForm -->|Contains| AdvancedTab
    EventForm -->|Validate| ValidationAPI
    EventForm -->|Create/Update| EventAPI
    AttendeeManagement -->|Manage| AttendeeAPI
    QRCode -->|Generate| EventAPI
    StatusSelector -->|Update| StatusAPI
    
    EventAPI -->|CRUD| EventsDB
    AttendeeAPI -->|CRUD| AttendeesDB
    PhotoAPI -->|CRUD| PhotosDB
    StatusAPI -->|Update| EventStatusDB
    ValidationAPI -->|Validate| EventAPI
```

## 👥 **Attendee Management Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        InvitationForm[📝 Invitation Form]
        AttendeeList[👥 Attendee List]
        RoleAssignment[👑 Role Assignment]
        QRGenerator[📱 QR Generator]
        CheckIn[✅ Check-in System]
        AddAttendeeDialog[➕ Add Attendee Dialog]
        InvitationDashboard[📊 Invitation Dashboard]
        EmailTemplateEditor[✉️ Email Template Editor]
        BatchUpload[📁 Batch Upload]
        MetricsView[📈 Metrics View]
        QRScanner[📱 QR Scanner]
    end

    subgraph API[🔌 API Layer]
        AttendeeAPI[📡 Attendee API]
        InvitationAPI[📧 Invitation API]
        QrAPI[📱 QR API]
        EventAccessAPI[🔑 Event Access API]
        EmailAPI[📧 Email API]
        TokenAPI[🔑 Token API]
        TrackingAPI[📊 Tracking API]
    end

    subgraph Data[💾 Data Layer]
        AttendeesDB[👥 Attendees Table]
        InvitationsDB[📧 Invitations Table]
        EventsDB[📅 Events Table]
        AccessLogsDB[📋 Access Logs]
        EmailTemplatesDB[✉️ Email Templates]
        EmailLogsDB[📋 Email Logs]
        TokensDB[🔑 Security Tokens]
        RLS[🔒 Row Level Security]
    end

    InvitationForm -->|Create| InvitationAPI
    InvitationDashboard -->|Manage| InvitationAPI
    EmailTemplateEditor -->|Customize| EmailAPI
    BatchUpload -->|Bulk Create| InvitationAPI
    MetricsView -->|View| TrackingAPI
    AttendeeList -->|Manage| AttendeeAPI
    RoleAssignment -->|Update| AttendeeAPI
    QRGenerator -->|Generate| QrAPI
    QRScanner -->|Scan| QrAPI
    CheckIn -->|Validate| EventAccessAPI
    AddAttendeeDialog -->|Add| AttendeeAPI
    
    InvitationAPI -->|CRUD| InvitationsDB
    InvitationAPI -->|Send| EmailAPI
    EmailAPI -->|Use| EmailTemplatesDB
    EmailAPI -->|Log| EmailLogsDB
    AttendeeAPI -->|CRUD| AttendeesDB
    QrAPI -->|Generate| TokenAPI
    QrAPI -->|Read| EventsDB
    TokenAPI -->|Store| TokensDB
    EventAccessAPI -->|Validate| TokenAPI
    EventAccessAPI -->|Auth| AttendeesDB
    EventAccessAPI -->|Log| AccessLogsDB
    TrackingAPI -->|Query| EmailLogsDB
    TrackingAPI -->|Query| AccessLogsDB
    TrackingAPI -->|Query| InvitationsDB
    
    RLS -->|Secure| AttendeesDB
    RLS -->|Secure| InvitationsDB
    RLS -->|Secure| EventsDB
    RLS -->|Secure| AccessLogsDB
    RLS -->|Secure| EmailTemplatesDB
    RLS -->|Secure| EmailLogsDB
    RLS -->|Secure| TokensDB
```

## 📨 **Invitation System Architecture**

```mermaid
flowchart TD
    subgraph UserInterface[📱 User Interface]
        InvitePage[📝 Invitation Management Page]
        EmailEditor[✉️ Email Template Editor]
        QRPreview[📱 QR Code Preview]
        BatchUploader[📁 Batch Upload Component]
        StatusDashboard[📊 Status Dashboard]
        InviteForm[📝 Invitation Form]
        QRScanner[📱 QR Code Scanner]
        GuestPortal[👤 Guest Portal]
    end

    subgraph API[🔌 API Layer]
        InviteAPI[📧 Invitation API]
        EmailAPI[✉️ Email API]
        QRCodeAPI[📱 QR Code API]
        TrackingAPI[📊 Tracking API]
        AuthAPI[🔑 Authentication API]
    end

    subgraph Services[⚙️ Service Layer]
        TokenGenerator[🔑 Token Generator]
        EmailSender[📧 Email Sender]
        QRGenerator[📱 QR Generator]
        InviteProcessor[📋 Invitation Processor]
        AuthValidator[✅ Auth Validator]
        MetricsCalculator[📊 Metrics Calculator]
    end

    subgraph Data[💾 Data Layer]
        InvitationsDB[📧 Invitations Table]
        EmailTemplatesDB[✉️ Email Templates]
        TokensDB[🔑 Security Tokens]
        EventsDB[📅 Events]
        AttendeesDB[👥 Attendees]
        TrackingDB[📊 Tracking Data]
    end

    InvitePage -->|Manage| InviteForm
    InvitePage -->|Display| StatusDashboard
    InviteForm -->|Create| InviteAPI
    EmailEditor -->|Design| EmailAPI
    QRPreview -->|Display| QRCodeAPI
    BatchUploader -->|Upload CSV| InviteAPI
    StatusDashboard -->|Fetch| TrackingAPI
    QRScanner -->|Scan| QRCodeAPI
    QRScanner -->|Authenticate| AuthAPI
    GuestPortal -->|Access| AuthAPI
    
    InviteAPI -->|Process| InviteProcessor
    InviteAPI -->|Generate| TokenGenerator
    EmailAPI -->|Send| EmailSender
    QRCodeAPI -->|Generate| QRGenerator
    QRCodeAPI -->|Validate| AuthValidator
    TrackingAPI -->|Calculate| MetricsCalculator
    AuthAPI -->|Validate| AuthValidator
    
    InviteProcessor -->|Store| InvitationsDB
    InviteProcessor -->|Associate| EventsDB
    TokenGenerator -->|Store| TokensDB
    EmailSender -->|Use| EmailTemplatesDB
    EmailSender -->|Update| InvitationsDB
    EmailSender -->|Track| TrackingDB
    QRGenerator -->|Read| TokensDB
    AuthValidator -->|Verify| TokensDB
    AuthValidator -->|Create| AttendeesDB
    MetricsCalculator -->|Read| TrackingDB
    MetricsCalculator -->|Read| InvitationsDB
```

## ⚙️ **Settings System Architecture**

```mermaid
flowchart TD
    subgraph UI[📱 User Interface]
        ProfileForm[👤 Profile Form]
        NotificationPrefs[🔔 Notification Preferences]
        SubscriptionManagement[💰 Subscription Management]
        SecuritySettings[🔒 Security Settings]
    end

    subgraph API[🔌 API Layer]
        ProfileAPI[👤 Profile API]
        NotificationAPI[🔔 Notification API]
        SubscriptionAPI[💰 Subscription API]
        SecurityAPI[🔒 Security API]
    end

    subgraph Data[💾 Data Layer]
        ProfilesDB[👤 Profiles Table]
        NotificationSettingsDB[🔔 Notification Settings Table]
        SubscriptionsDB[💰 Subscriptions Table]
        AuthTable[🔑 Auth Table]
    end

    ProfileForm -->|Update| ProfileAPI
    NotificationPrefs -->|Update| NotificationAPI
    SubscriptionManagement -->|Manage| SubscriptionAPI
    SecuritySettings -->|Update| SecurityAPI
    
    ProfileAPI -->|CRUD| ProfilesDB
    NotificationAPI -->|CRUD| NotificationSettingsDB
    SubscriptionAPI -->|CRUD| SubscriptionsDB
    SecurityAPI -->|Update| AuthTable
```

## 📱 **Responsive Application Structure**

```mermaid
flowchart TD
    subgraph Core[🧠 Core Application]
        Routes[🛣️ App Router Routes]
        Components[🧩 Shared Components]
        Hooks[🪝 Custom Hooks]
        Stores[🏪 Zustand Stores]
    end

    subgraph Layout[📐 Layout System]
        DashboardLayout[📊 Dashboard Layout]
        MarketingLayout[🏪 Marketing Layout]
        AuthLayout[🔐 Auth Layout]
        MobileNav[📱 Mobile Navigation]
        SideNav[📊 Sidebar Navigation]
    end

    subgraph Form[📝 Form System]
        ReactHookForm[📝 React Hook Form]
        ZodValidation[✅ Zod Validation]
        ErrorHandling[❌ Error Handling]
        FormComponents[🧩 Form Components]
    end

    subgraph State[🔄 State Management]
        AuthStore[🔐 Auth Store]
        EventsStore[📅 Events Store]
        UIStore[🎨 UI Store]
        PhotosStore[📸 Photos Store]
        NotificationStore[🔔 Notification Store]
        AnalyticsStore[📊 Analytics Store]
    end

    Routes -->|Use| Components
    Routes -->|Use| Hooks
    Components -->|Use| Hooks
    Hooks -->|Use| Stores
    
    Routes -->|Use| Layout
    Layout -->|Responsive| MobileNav
    Layout -->|Desktop| SideNav
    
    Components -->|Use| Form
    Form -->|Validation| ZodValidation
    Form -->|Management| ReactHookForm
    Form -->|Handling| ErrorHandling
    
    Hooks -->|Access| State
    State -->|Auth| AuthStore
    State -->|Events| EventsStore
    State -->|UI| UIStore
    State -->|Photos| PhotosStore
    State -->|Notifications| NotificationStore
    State -->|Analytics| AnalyticsStore
```

## 💻 **Session 27 Implementation Focus**

```mermaid
flowchart TD
    subgraph Gallery[🖼️ Gallery Implementation]
        MasonryLayout[🧱 Masonry Layout]
        AdvancedFiltering[🔍 Advanced Filtering]
        BulkUpload[📤 Bulk Upload]
        ProgressiveLoading[🔄 Progressive Loading]
    end

    subgraph Analytics[📊 Analytics Implementation]
        RealTimeMetrics[⚡ Real-time Metrics]
        EventAnalytics[📈 Event Analytics]
        ExportSystem[📤 Export System]
        DataVisualization[📊 Data Visualization]
    end

    subgraph Mobile[📱 Mobile Optimization]
        ProgressiveEnhancement[📱 Progressive Enhancement]
        OfflineSupport[💾 Offline Support]
        TouchInteractions[👆 Touch Interactions]
        PerformanceOptimization[⚡ Performance]
    end

    subgraph QA[✅ Quality Assurance]
        Testing[🧪 Testing]
        Performance[⚡ Performance]
        Security[🔒 Security]
        Accessibility[♿ Accessibility]
        Documentation[📚 Documentation]
    end

    Gallery -->|Implement| MasonryLayout
    Gallery -->|Implement| AdvancedFiltering
    Gallery -->|Implement| BulkUpload
    Gallery -->|Implement| ProgressiveLoading
    
    Analytics -->|Implement| RealTimeMetrics
    Analytics -->|Implement| EventAnalytics
    Analytics -->|Implement| ExportSystem
    Analytics -->|Implement| DataVisualization
    
    Mobile -->|Optimize| ProgressiveEnhancement
    Mobile -->|Implement| OfflineSupport
    Mobile -->|Enhance| TouchInteractions
    Mobile -->|Optimize| PerformanceOptimization
    
    QA -->|Conduct| Testing
    QA -->|Measure| Performance
    QA -->|Verify| Security
    QA -->|Validate| Accessibility
    QA -->|Update| Documentation
```

## 4. CHANGELOG Update

```markdown
# Changelog
All notable changes to Cloud Burst will be documented in this file.

## [0.7.7] - 2025-03-19
### Added
- New Analytics section with Engagement Metrics page
- Events Analytics page (currently disabled with "Coming Soon" badge)
- Gallery management system with tabs for All Media, Events, Moderation, and Albums
- Enhanced organizer dashboard navigation structure
- Top-level section headers in sidebar for better organization
- Improved tooltip support for collapsed sidebar items

### Changed
- Increased sidebar width to properly accommodate badges and longer text
- Reordered Analytics menu items with Engagement Metrics at the top
- Enhanced responsive design for all new pages
- Improved layout consistency across protected routes
- Standardized page header padding for better visual hierarchy
- Updated navigation patterns with improved disabled state handling

### Fixed
- Added proper top padding to Gallery layout pages
- Fixed horizontal scrollbar in sidebar when using badges
- Improved accessibility for disabled navigation items
- Enhanced responsive behavior for analytics cards
- Optimized loading states for analytics pages
- Resolved padding inconsistencies across dashboard pages

### Technical Debt
- Event Analytics page requires completion in future sessions
- Chart components need implementation for proper data visualization
- Data fetching for analytics needs integration with actual database
- Additional testing required for responsive behavior across devices