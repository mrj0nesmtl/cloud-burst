<div align="center">
  <img src="public/android-chrome-192x192.png" alt="Cloud Burst Logo" width="100" height="100" />

# Cloud Burst

## Capture Every Moment

[![Version](https://img.shields.io/badge/version-0.9.6-blue.svg)](https://github.com/mrj0nesmtl/cloud-burst/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

## Abstract 💡

Cloud Burst represents the evolution of event media capture, bridging the gap between traditional charm and modern technology. With our comprehensive moderation interface, enhanced security measures, and seamless user experience, we're now at 96% completion as we approach the Beta 1.0 RC1 release on April 30, 2025. The platform offers role-based access control, custom event URLs, enhanced gallery functionality, invitation system, RSVP capabilities, and a complete end-to-end guest experience. Our latest enhancements include batch moderation capabilities, real-time moderation statistics, and improved permission policies to ensure both efficiency and security. Deployed in beta at [https://cb-beta.replit.app](https://cb-beta.replit.app), Cloud Burst delivers exceptional performance while providing a seamless experience across all user roles and devices.

## Crowd-Powered 🤳

No apps to download, no accounts to create. Just scan a QR code and start capturing memories. It's that simple.
Cloud Burst revolutionizes event media capture by bringing the charm of disposable cameras into the digital age. Our 
platform transforms every event into a collaborative media story, powered by AI and created by all attendees. With 
no apps to download and no accounts to create, guests simply scan a QR code to instantly start capturing and sharing 
photos and videos.

## Our Pitch 🎙️

Remember the magic of disposable cameras 📸 on wedding tables? We've reimagined that collaborative spirit for the digital age. Cloud Burst transforms every event into a living media story, powered by AI and created by everyone who matters – your guests. No apps to download, no accounts to create – just scan, snap, and share. With enterprise-grade security, AI-enhanced media, and real-time galleries, we're not just capturing moments; **We're revolutionizing how memories are made.**

<div align="center">

### [Live Demo](https://cb-beta.replit.app) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md)

</div>

## Features

### Media Management

- **Unified Media Gallery**: Support for both photos and videos in a seamless gallery experience
- **Direct Camera Integration**: Capture media directly through the platform with QR code access
- **Automated Processing**: Efficient handling of uploads with progress tracking and error handling
- **Content Moderation**: Comprehensive batch approval/rejection workflow with statistics dashboard

### Event Management

- **Comprehensive Dashboard**: Create, manage, and track events from a single interface
- **Attendee Management**: Invite and manage event participants with role-based permissions
- **QR Code System**: Generate event-specific and personalized QR codes for streamlined access
- **Status Tracking**: Monitor event lifecycle from planning to completion

### Invitation System

- **Email Invitations**: Send personalized invitations with secure access links and QR codes
- **Attendee Tracking**: Monitor invitation status, RSVPs, and event participation
- **QR Code Access**: Scan event QR codes for immediate camera and gallery access
- **Guest Authentication**: Temporary access for invited users with streamlined registration
- **RSVP Management**: Comprehensive system for tracking responses with dietary preferences

### Security

- **Role-Based Access Control**: Comprehensive permission system with clearly defined capabilities
- **Row Level Security**: Database-level protection for all resources
- **Authentication Options**: Multiple secure login methods including QR code scanning
- **Content Protection**: Ensure media is only accessible to authorized users
- **Token-Based Authentication**: Secure access for guests without creating accounts
- **Permission Policies**: Verified enforcement for profile and gallery settings updates

### AI Features (Coming Soon)

- **Facial Recognition**: Intelligent face detection and recognition for easy photo organization and search
- **Photo Enhancements**: Automated photo and video enhancement with customizable styles
- **Product Placements**: Smart product placement and brand integration for event photos
- **Smart Tagging**: Automated content tagging and organization powered by AI
- **AI Studio**: Advanced workspace for custom photo and video transformations using cutting-edge models

### Key Benefits

- **Instant Access**: One QR code connects all your guests
- **Real-Time Gallery**: Watch your event's story unfold live
- **AI-Powered**: Automatic media enhancement and organization
- **Universal**: Works on any modern device
- **Secure**: Enterprise-grade security and privacy
- **Analytics**: Gain valuable insights on engagement and interactions
- **Customizable**: Tailor the experience to match your event theme
- **Collaborative**: Everyone contributes to a shared visual story

## 🏗️ System Architecture

```mermaid
graph TD
    Client["📱 Client Device"] -->|"HTTPS Request"| WebApp["🌐 Web App (Next.js)"]
    WebApp -->|"API Calls"| Supabase["🗄️ Supabase"]
    WebApp -->|"Dashboard"| Dashboard["📊 Dashboard System"]
    WebApp -->|"Template Management"| Templates["📋 Template System"]
    WebApp -->|"Event Management"| Events["📅 Event System"]
    WebApp -->|"Gallery Management"| Gallery["🖼️ Gallery System"]
    WebApp -->|"Moderation"| Moderation["👁️ Moderation System"]
    WebApp -->|"Attendee Management"| Attendees["👥 Attendee System"]
    WebApp -->|"User Settings"| Settings["⚙️ Settings System"]
    WebApp -->|"Analytics"| Analytics["📈 Analytics System"]
    WebApp -->|"Access Control"| RBAC["🔒 RBAC System"]
    WebApp -->|"AI Features"| AI["🧠 AI System"]
    
    Dashboard -->|"Load"| Supabase
    Templates -->|"Sync"| Supabase
    Events -->|"CRUD"| Supabase
    Gallery -->|"CRUD"| Supabase
    Moderation -->|"CRUD"| Supabase
    Attendees -->|"CRUD"| Supabase
    Settings -->|"CRUD"| Supabase
    Analytics -->|"Query"| Supabase
    RBAC -->|"Verify"| Supabase
    AI -->|"Process"| Supabase
    
    Supabase --> Auth["🔑 Auth"]
    Supabase --> Database["💾 Database"]
    Supabase --> Storage["📦 Storage"]
    Supabase --> Security["🛡️ Security Policies"]
    
    style WebApp fill:#2A2A2A,stroke:#333,color:#fff
    style Supabase fill:#3ECF8E,stroke:#333,color:#000
    style Auth fill:#1E3A8A,stroke:#333,color:#fff
    style Database fill:#065F46,stroke:#333,color:#fff
    style Storage fill:#7E22CE,stroke:#333,color:#fff
    style Analytics fill:#DC2626,stroke:#333,color:#fff
    style Gallery fill:#2563EB,stroke:#333,color:#fff
    style Moderation fill:#C026D3,stroke:#333,color:#fff
    style Security fill:#B91C1C,stroke:#333,color:#fff
    style AI fill:#6D28D9,stroke:#333,color:#fff
```

## 👥 User Roles

Cloud Burst implements a sophisticated role-based access control system:

- **Super Admin**: Full system access (internal use only)
- **Admin**: Administrative access (internal use only)
- **Organizer**: Event management access (paid tier only)
- **Event Host**: Create and manage own events (cannot delete)
- **Event Staff**: Upload content and assist with event management
- **Contractor**: External partner with limited event access
- **Photographer**: External photographer with photo upload capabilities
- **Technician**: Technical support with event setup permissions
- **Marketing**: External partner with analytics and content access
- **Invited User**: Invited attendee with QR code access
- **User**: Standard user with basic platform access
- **Guest**: Public access to view public events and galleries

```mermaid
graph LR
    A["👤 Event Guest"] --> B{"🔍 Has QR?"}
    B -->|"Yes"| C["📱 Scan QR"]
    B -->|"No"| D["✉️ Request Access"]
    C --> E["🖼️ Gallery Access"]
    D --> F["📲 Receive QR"]
    F --> C
    E --> G["📤 Upload Media"]
    E --> H["👁️ View Gallery"]
    G --> I["🤖 Processing"]
    I --> J["👨‍💼 Moderation"]
    J -->|"Approved"| H
    E --> K["📊 Engagement Analytics"]
    
    style A fill:#2A2A2A,stroke:#333,color:#fff
    style E fill:#1E3A8A,stroke:#333,color:#fff
    style G fill:#065F46,stroke:#333,color:#fff
    style H fill:#7E22CE,stroke:#333,color:#fff
    style I fill:#DC2626,stroke:#333,color:#fff
    style J fill:#C026D3,stroke:#333,color:#fff
    style K fill:#2563EB,stroke:#333,color:#fff
```

## 📅 Project Timeline

Cloud Burst has evolved from concept to robust beta platform since its inception. Here's our development roadmap:

```mermaid
gantt
    title Cloud Burst Development Timeline
    dateFormat  YYYY-MM-DD
    axisFormat %b %d
    
    section Foundation
    Project Setup           :done, f1, 2025-02-01, 7d
    Authentication          :done, f2, 2025-02-08, 7d
    Database Schema         :done, f3, 2025-02-15, 5d
    
    section Core Functionality
    Event Management        :done, c1, 2025-02-20, 7d
    Basic Media Upload      :done, c2, 2025-02-25, 5d
    User Roles & Permissions:done, c3, 2025-03-01, 5d
    
    section Enhanced Features
    Advanced Gallery Layouts:done, e1, 2025-03-05, 5d
    Navigation Recovery     :done, e2, 2025-03-07, 3d
    Authentication Repair   :done, e3, 2025-03-10, 3d
    Dashboard Implementation:done, e4, 2025-03-11, 4d
    Database Security Fixes :done, e5, 2025-03-15, 1d
    Invitation System       :done, e6, 2025-03-16, 7d
    RSVP Implementation     :done, e7, 2025-03-21, 5d
    Media Moderation        :done, e8, 2025-03-26, 3d
    Mobile Responsiveness   :done, e9, 2025-03-30, 4d
    Guest Reservation Flow  :done, e10, 2025-04-01, 5d
    Camera Integration      :done, e11, 2025-04-05, 4d
    Contractor Role Management :done, e12, 2025-04-09, 3d
    Profile Creation        :done, e13, 2025-04-10, 5d
    Camera Testing          :done, e14, 2025-04-15, 3d
    Guest Journey Completion:done, g1, 2025-04-16, 4d
    Gallery Enhancements    :done, g2, 2025-04-16, 4d
    
    section Final Preparations
    Moderation Interface    :done, m1, 2025-04-21, 5d
    Security Audit          :active, s1, 2025-04-23, 5d
    Super Admin Dashboard   :active, a1, 2025-04-23, 5d
    End-to-End Testing      :active, t1, 2025-04-25, 5d
    Beta v1.0 RC1 Release   :milestone, b1, 2025-04-30, 0d
    Beta Testing Phase      :p1, 2025-05-01, 15d
    Performance Tuning      :p2, 2025-05-16, 10d
    Public Launch (v1.0.0)  :milestone, l3, 2025-05-30, 0d
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20.0+
- npm or yarn

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/cloud-burst.git
   ```
2. Install dependencies
   ```bash
   cd cloud-burst
   npm install
   ```
3. Set up environment variables
   ```bash
   cp .env.example .env.local
   ```
4. Start the development server
   ```bash
   npm run dev
   ```

## 📚 Documentation

For complete documentation of the Cloud Burst platform, please visit our [Documentation Center](./docs/).

Our documentation includes:

- [Architecture Documentation](./docs/architecture/)
  - [Application Design](./docs/architecture/application_design_document.md)
  - [System Architecture Flowchart](./docs/architecture/system_architecture_flowchart.md)
  - [Security Architecture](./docs/architecture/security.md)

- [Deployment Guides](./docs/deployment/)
  - [Deployment Guides](./docs/deployment/deployment_guides.md)
  - [Deployment Fixes](./docs/deployment/deployment_fixes.md)
  - [Replit Deployment](./docs/deployment/replit_deployment.md)

- [Design Documentation](./docs/design/)
  - [UI Components](./docs/design/UI_components.md)
  - [Style Guide](./docs/design/style.md)
  - [Gallery Implementation](./docs/design/gallery_implementation.md)
  - [Moderation Interface](./docs/design/moderation-interface-enhancements.md)
  - [Layout Troubleshooting](./docs/design/layout-troubleshooting.md)

- [Development Documentation](./docs/development/)
  - [Status Notes](./docs/development/STATUS_NOTES.md)
  - [Version Control](./docs/development/VERSION_CONTROL.md)
  - [Contributing Guidelines](./docs/development/contributing.md)
  - [Session 44 Checklist](./docs/development/session-44-checklist.md)
  - [Session 44 Kickoff](./docs/development/session-44-kickoff-prompt.md)

- [Project Structure](./docs/project-structure/)
  - [Project Overview](./docs/project-structure/README.md)
  - [Full Project Tree](./docs/project-structure/FULL_TREE.md)
  - [App Structure](./docs/project-structure/app_tree.md)
  - [Component Structure](./docs/project-structure/components_tree.md)
  - [Gallery Components](./docs/project-structure/gallery_tree.md)

- [User Flows & RBAC](./docs/rbac/)
  - [Role-Based Access Control](./docs/rbac/role_based_access_control.md)
  - [User Flow Overview](./docs/user-flows/user_flow_overview.md)
  - [Invited User Flow](./docs/user-flows/invited_user_flow_design_document.md)
  - [RSVP System Design](./docs/user-flows/RSVP_IMPLEMENTATION_GUIDE.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by Joel@ArcanaConcepts and the Cloud Burst Team

</div>