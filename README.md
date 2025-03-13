<div align="center">
  <img src="public/android-chrome-192x192.png" alt="Cloud Burst Logo" width="100" height="100" />

# Cloud Burst

## *Elevating Event Photography*

[![Version](https://img.shields.io/badge/version-0.7.7-blue.svg)](https://github.com/mrj0nesmtl/cloud-burst/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📌 Abstract
Cloud Burst represents the evolution of event photography, bridging the gap between traditional charm and modern technology. With the implementation of role-based access control, custom event URLs, and enhanced gallery functionality, our platform now offers a comprehensive solution for event photography management. Deployed in beta at https://cb-beta.replit.app, Cloud Burst maintains exceptional performance within memory constraints while delivering a seamless user experience across devices as we approach our April 1, 2025 launch date.

## 🎯 Pitch
Remember the magic of disposable cameras at wedding tables? We've reimagined that collaborative spirit for the digital age. Cloud Burst transforms every event into a living photo story, powered by AI and created by everyone who matters – your guests. No apps to download, no accounts to create – just scan, snap, and share. With enterprise-grade security, AI-enhanced photos, and real-time galleries, we're not just capturing moments; we're revolutionizing how memories are made.

### [Live Demo](https://cb-beta.replit.app) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md)

<div align="left">

## 📸 Overview

### 📸 Capture Every Moment 📸
No apps to download, no accounts to create. Just scan a QR code and start capturing memories. It's that simple.
Cloud Burst revolutionizes event photography by bringing the charm of disposable cameras into the digital age. Our platform transforms every event into a collaborative photo story, powered by AI and created by all attendees. With no apps to download and no accounts to create, guests simply scan a QR code to instantly start capturing and sharing memories.

### Key Benefits
- **Instant Access**: One QR code connects all your guests
- **Real-Time Gallery**: Watch your event's story unfold live
- **AI-Powered**: Automatic photo enhancement and organization
- **Universal**: Works on any modern device
- **Secure**: Enterprise-grade security and privacy
- **Analytics**: Gain valuable insights on engagement and interactions
- **Customizable**: Tailor the experience to match your event theme
- **Collaborative**: Everyone contributes to a shared visual story

## 🏗️ System Architecture (v0.7.7)

```mermaid
graph TD
    Client["📱 Client Device"] -->|"HTTPS Request"| WebApp["🌐 Web App (Next.js)"]
    WebApp -->|"API Calls"| Supabase["🗄️ Supabase"]
    WebApp -->|"Dashboard"| Dashboard["📊 Dashboard System"]
    WebApp -->|"Template Management"| Templates["📋 Template System"]
    WebApp -->|"Event Management"| Events["📅 Event System"]
    WebApp -->|"Gallery Management"| Gallery["🖼️ Gallery System"]
    WebApp -->|"Attendee Management"| Attendees["👥 Attendee System"]
    WebApp -->|"User Settings"| Settings["⚙️ Settings System"]
    WebApp -->|"Analytics"| Analytics["📈 Analytics System"]
    WebApp -->|"Access Control"| RBAC["🔒 RBAC System"]
    
    Dashboard -->|"Load"| Supabase
    Templates -->|"Sync"| Supabase
    Events -->|"CRUD"| Supabase
    Gallery -->|"CRUD"| Supabase
    Attendees -->|"CRUD"| Supabase
    Settings -->|"CRUD"| Supabase
    Analytics -->|"Query"| Supabase
    RBAC -->|"Verify"| Supabase
    
    Supabase --> Auth["🔑 Auth"]
    Supabase --> Database["💾 Database"]
    Supabase --> Storage["📦 Storage"]
    
    style WebApp fill:#2A2A2A,stroke:#333,color:#fff
    style Supabase fill:#3ECF8E,stroke:#333,color:#000
    style Auth fill:#1E3A8A,stroke:#333,color:#fff
    style Database fill:#065F46,stroke:#333,color:#fff
    style Storage fill:#7E22CE,stroke:#333,color:#fff
    style Analytics fill:#DC2626,stroke:#333,color:#fff
    style Gallery fill:#2563EB,stroke:#333,color:#fff
```

## 🔄 User Flow

```mermaid
graph LR
    A["👤 Event Guest"] --> B{"🔍 Has QR?"}
    B -->|"Yes"| C["📱 Scan QR"]
    B -->|"No"| D["✉️ Request Access"]
    C --> E["🖼️ Gallery Access"]
    D --> F["📲 Receive QR"]
    F --> C
    E --> G["📤 Upload Photos"]
    E --> H["👁️ View Gallery"]
    G --> I["🤖 AI Processing"]
    I --> H
    E --> J["📊 Engagement Analytics"]
    
    style A fill:#2A2A2A,stroke:#333,color:#fff
    style E fill:#1E3A8A,stroke:#333,color:#fff
    style G fill:#065F46,stroke:#333,color:#fff
    style H fill:#7E22CE,stroke:#333,color:#fff
    style I fill:#DC2626,stroke:#333,color:#fff
    style J fill:#2563EB,stroke:#333,color:#fff
```

## 🛠️ Tech Stack

```mermaid
graph TD
    CB["☁️ Cloud Burst Platform"] --> FE["🖥️ Frontend"]
    CB --> BE["🔌 Backend"]
    CB --> INFRA["🏗️ Infrastructure"]

    %% Frontend Stack
    FE --> F1["⚛️ Next.js 14"]
    FE --> F2["🔷 TypeScript 5.0"]
    FE --> F3["🎨 UI Layer"]
    FE --> F4["🔄 State Management"]
    FE --> F5["📝 Forms & Validation"]

    F3 --> F3A["🧩 Shadcn/ui"]
    F3 --> F3B["💨 TailwindCSS"]
    F3 --> F3C["📱 Responsive Design"]
    
    F4 --> F4A["🐻 Zustand"]
    F4 --> F4B["🔍 TanStack Query"]
    
    F5 --> F5A["🪝 React Hook Form"]
    F5 --> F5B["✅ Zod Schema"]

    %% Backend Stack
    BE --> B1["🗃️ Supabase"]
    BE --> B2["🤖 AI Processing"]
    BE --> B3["📦 Storage"]
    BE --> B4["⚡ Real-time"]

    B1 --> B1A["🐘 PostgreSQL"]
    B1 --> B1B["🔐 Auth"]
    B1 --> B1C["🔒 RLS"]

    B2 --> B2A["🧠 TensorFlow.js"]
    B2 --> B2B["👁️ OpenCV"]
    B2 --> B2C["🔮 OpenAI"]

    B3 --> B3A["🖼️ Image Storage"]
    B3 --> B3B["🌐 CDN"]
    B3 --> B3C["🔧 Optimization"]

    %% Infrastructure
    INFRA --> I1["🚀 Replit"]
    INFRA --> I2["🔄 CI/CD"]
    INFRA --> I3["📊 Monitoring"]

    I1 --> I1A["📌 Node 20.x"]
    I2 --> I2A["🔄 GitHub Actions"]
    I3 --> I3A["📈 Sentry"]

    style CB fill:#2A2A2A,stroke:#333,color:#fff
    style FE fill:#1E3A8A,stroke:#333,color:#fff
    style BE fill:#065F46,stroke:#333,color:#fff
    style INFRA fill:#7E22CE,stroke:#333,color:#fff
```

## 📊 Analytics Architecture

```mermaid
graph TD
    UI["📱 User Interface"] --> MetricsCards["📊 Metrics Cards"]
    UI --> TrendsCharts["📈 Trends Charts"]
    UI --> ComparisonViews["⚖️ Comparison Views"]
    
    MetricsCards --> AnalyticsAPI["🔌 Analytics API"]
    TrendsCharts --> AnalyticsAPI
    ComparisonViews --> AnalyticsAPI
    
    AnalyticsAPI --> DataAggregation["📊 Data Aggregation"]
    AnalyticsAPI --> Filtering["🔍 Filtering"]
    AnalyticsAPI --> Export["📤 Export"]
    
    DataAggregation --> Processing["⚙️ Processing Layer"]
    Filtering --> Data["💾 Data Layer"]
    Export --> Data
    
    Processing --> Data
    
    Data --> EngagementDB["📊 Engagement Metrics"]
    Data --> EventsDB["📅 Events Data"]
    Data --> PhotosDB["📸 Photos Data"]
    Data --> UserInteractionsDB["👤 User Interactions"]
    
    style UI fill:#2A2A2A,stroke:#333,color:#fff
    style AnalyticsAPI fill:#1E3A8A,stroke:#333,color:#fff
    style Processing fill:#065F46,stroke:#333,color:#fff
    style Data fill:#7E22CE,stroke:#333,color:#fff
```

## 🖼️ Gallery System

```mermaid
graph TD
    UI["📱 User Interface"] --> UploadSystem["📤 Upload System"]
    UI --> ViewOptions["👁️ View Options"]
    UI --> Organization["📁 Organization"]
    UI --> Moderation["✅ Moderation"]
    
    UploadSystem --> UploadAPI["🔌 Upload API"]
    ViewOptions --> GalleryAPI["🔌 Gallery API"]
    Organization --> AlbumAPI["🔌 Album API"]
    Moderation --> ModerationAPI["🔌 Moderation API"]
    
    UploadAPI --> Processing["⚙️ Processing"]
    UploadAPI --> Storage["📦 Storage"]
    GalleryAPI --> DBAccess["🗃️ Database Access"]
    AlbumAPI --> DBAccess
    ModerationAPI --> DBAccess
    
    Processing --> Optimization["🔧 Optimization"]
    Processing --> Thumbnails["🖼️ Thumbnails"]
    Processing --> Metadata["📋 Metadata"]
    Processing --> AITagging["🤖 AI Tagging"]
    
    DBAccess --> PhotosDB["📸 Photos"]
    DBAccess --> AlbumsDB["📁 Albums"]
    DBAccess --> TagsDB["🏷️ Tags"]
    
    style UI fill:#2A2A2A,stroke:#333,color:#fff
    style Processing fill:#1E3A8A,stroke:#333,color:#fff
    style DBAccess fill:#065F46,stroke:#333,color:#fff
    style Storage fill:#7E22CE,stroke:#333,color:#fff
```

## 🔐 Security Architecture

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant App as 🖥️ App
    participant Auth as 🔐 Auth
    participant RBAC as 🔒 RBAC
    participant Storage as 📦 Storage
    participant Database as 🗃️ Database
    
    User->>App: Access Request
    App->>Auth: Verify Credentials
    Auth-->>App: Authentication Token
    App->>RBAC: Check Permissions
    RBAC->>Database: Verify Role & Access
    Database-->>RBAC: Permission Status
    RBAC-->>App: Access Decision
    
    alt Allowed Access
        App->>Storage: Fetch Photos
        Storage-->>App: Media Data
        App->>Database: Log Activity
        App-->>User: Display Gallery
    else Denied Access
        App-->>User: Access Denied
        App->>Database: Log Access Attempt
    end
```

## ✨ Feature Sets

### 🎯 Essential Features (Current)
- **Event Gallery**: Instant photo sharing and organization
- **AI Organization**: Smart photo categorization and enhancement
- **24/7 Access**: Continuous platform availability
- **Social Sharing**: Integrated social media connectivity
- **Role-Based Access**: Comprehensive permission system
- **Analytics Dashboard**: Engagement metrics visualization
- **Responsive Design**: Seamless experience across devices
- **Gallery Layouts**: Multiple viewing options for photos

### 💫 Advanced Capabilities (v0.8.0)
- **Custom Branding**: White-label solution options
- **Extended Storage**: Flexible storage solutions
- **Priority Support**: Enhanced customer care
- **Advanced AI**: Premium photo organization
- **Event Comparison**: Benchmark performance across events
- **Custom Galleries**: Personalized viewing experiences
- **Batch Operations**: Efficient photo management
- **Advanced Search**: Intelligent photo discovery

### 🚀 Enterprise Solutions (v1.0)
- **Unlimited Photos**: No storage restrictions
- **Premium AI Tools**: Advanced image processing
- **24/7 Priority Support**: Dedicated assistance
- **API Access**: Custom integration capabilities
- **Advanced Analytics**: Detailed performance metrics
- **White-Label Deployment**: Complete branding control
- **Custom AI Models**: Domain-specific image processing
- **SLA Guarantees**: Performance and uptime commitments

### ⚡ Custom Features (Post-Launch)
- **Custom AI Models**: Tailored AI solutions
- **Dedicated Support**: Personal support team
- **Custom Integration**: Enterprise system integration
- **Advanced Security**: Enhanced protection measures
- **SLA Guarantee**: Performance guarantees
- **On-Premise Option**: Local deployment capability
- **Custom Workflows**: Tailored business processes
- **Dedicated Infrastructure**: Isolated environment

## 📊 System Performance (v0.7.7)

| Metric | Performance |
|--------|-------------|
| **Response Time** | < 100ms |
| **Image Processing** | < 2s |
| **Availability** | 99.9% |
| **Storage** | Unlimited |
| **Concurrent Users** | 10,000+ |
| **Data Protection** | GDPR Compliant |
| **Load Time (Mobile)** | < 1.5s |
| **Load Time (Desktop)** | < 0.8s |
| **Memory Usage** | < 512MB |
| **Analytics Generation** | < 3s |

## 📋 Implementation Timeline

| Phase | Focus | Timeline | Status |
|-------|-------|----------|--------|
| **v0.7.7** | Analytics Implementation | March 2025 | ✅ Complete |
| **v0.7.8** | Gallery System | April 2025 | 🟢 Active |
| **v0.8.0** | Performance Optimization | May 2025 | 🟡 Planned |
| **v0.9.0** | Pre-Launch QA | May 2025 | 🟡 Planned |
| **v1.0.0** | Public Launch | June 2025 | 🟡 Planned |

## 📫 Connect With Us

- Email: joel@arcanaconcept.com
- Deployed: [Beta Platform](https://cb-beta.replit.app)
- GitHub: [Repository](https://github.com/mrj0nesmtl/cloud-burst)
- Documentation: [Technical Docs](docs/architecture/)

---

<div align="center">

Made with ❤️ by [Arcana Concept](https://github.com/mrj0nesmtl)

</div>