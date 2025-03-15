<div align="center">
  <img src="public/android-chrome-192x192.png" alt="Cloud Burst Logo" width="100" height="100" />

# Cloud Burst

## 📸 Event Media Platform

[![Version](https://img.shields.io/badge/version-0.7.8-blue.svg)](https://github.com/mrj0nesmtl/cloud-burst/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📌 Abstract
Cloud Burst represents the evolution of event media capture, bridging the gap between traditional charm and modern technology. With the implementation of role-based access control, custom event URLs, and enhanced gallery functionality, our platform now offers a comprehensive solution for event media management. Deployed in beta at https://cb-beta.replit.app, Cloud Burst maintains exceptional performance within memory constraints while delivering a seamless user experience across devices as we approach our April 1, 2025 launch date.

### 📹 Crowd-Powered 📹
No apps to download, no accounts to create. Just scan a QR code and start capturing memories. It's that simple.
Cloud Burst revolutionizes event media capture by bringing the charm of disposable cameras into the digital age. Our 
platform transforms every event into a collaborative media story, powered by AI and created by all attendees. With 
no apps to download and no accounts to create, guests simply scan a QR code to instantly start capturing and sharing 
photos and videos.

## 🎯 Pitch
Remember the magic of disposable cameras at wedding tables? We've reimagined that collaborative spirit for the digital age. Cloud Burst transforms every event into a living media story, powered by AI and created by everyone who matters – your guests. No apps to download, no accounts to create – just scan, snap, and share. With enterprise-grade security, AI-enhanced media, and real-time galleries, we're not just capturing moments; we're revolutionizing how memories are made.

### [Live Demo](https://cb-beta.replit.app) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md)

<div align="left">
### Media Management
- **Unified Media Gallery**: Support for both photos and videos in a seamless gallery experience
- **Direct Camera Integration**: Capture media directly through the platform with QR code access
- **Automated Processing**: Efficient handling of uploads with progress tracking and error handling
- **Content Moderation**: Review and approval workflow to ensure appropriate content

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

### Security
- **Role-Based Access Control**: Comprehensive permission system with clearly defined capabilities
- **Row Level Security**: Database-level protection for all resources
- **Authentication Options**: Multiple secure login methods including QR code scanning
- **Content Protection**: Ensure media is only accessible to authorized users

### Key Benefits
- **Instant Access**: One QR code connects all your guests
- **Real-Time Gallery**: Watch your event's story unfold live
- **AI-Powered**: Automatic media enhancement and organization
- **Universal**: Works on any modern device
- **Secure**: Enterprise-grade security and privacy
- **Analytics**: Gain valuable insights on engagement and interactions
- **Customizable**: Tailor the experience to match your event theme
- **Collaborative**: Everyone contributes to a shared visual story

## 🏗️ System Architecture (v0.7.8)

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

## 👥 User Roles

Cloud Burst implements a sophisticated role-based access control system:

- **Super Admin**: Full system access (internal use only)
- **Admin**: Administrative access (internal use only)
- **Organizer**: Event management access (paid tier only)
- **Event Host**: Create and manage own events (cannot delete)
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

## 📱 User Experience

### For Event Organizers
- Create and manage events
- Send invitations to attendees
- Monitor event analytics
- Review and approve media uploads
- Generate event QR codes

### For Photographers
- Upload and organize media
- Create albums and galleries
- Edit and enhance content
- Share with event participants
- Track engagement metrics

### For Invited Guests
- Receive personalized invitations
- Scan QR codes for instant access
- Capture media directly from the event
- View and download shared content
- Connect with other attendees

## 🔄 Current Status

Cloud Burst is currently in beta (v0.7.8) with approximately 85% of core features implemented:

- ✅ Event management system
- ✅ Media upload and gallery display (photos and videos)
- ✅ Role-based access control
- ✅ QR code generation and scanning
- ✅ Direct camera integration
- 🟡 Invitation system (75% complete)
- 🟡 Media moderation (65% complete)
- 🟡 Analytics integration (60% complete)

We're targeting Beta 0.9.0 for internal testing by April 1, 2025, with public launch (v1.0.0) planned for April 15, 2025.

## 🚀 Getting Started

### Prerequisites
- Node.js 18.0+
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

## 📄 Documentation

For complete documentation, including API references, component guidelines, and development workflows, see the [docs](./docs) directory.

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./docs/CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

Built with ❤️ by the Cloud Burst Team