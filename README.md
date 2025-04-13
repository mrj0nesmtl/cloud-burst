<div align="center">
  <img src="public/android-chrome-192x192.png" alt="Cloud Burst Logo" width="100" height="100" />

# Cloud Burst

## Capture Every Moment

[![Version](https://img.shields.io/badge/version-0.9.2-blue.svg)](https://github.com/mrj0nesmtl/cloud-burst/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
</div>

## Abstract 💡

Cloud Burst represents the evolution of event media capture, bridging the gap between traditional charm and modern technology. With the implementation of role-based access control, custom event URLs, enhanced gallery functionality, invitation system, RSVP capabilities, and AI-powered features, our platform now offers a comprehensive solution for event media management. The latest enhancements include a sophisticated contractor management system with visual role indicators and specialized permissions, providing event organizers with powerful tools to collaborate with external professionals. Deployed in beta at [https://cb-beta.replit.app](https://cb-beta.replit.app), Cloud Burst maintains exceptional performance while delivering a seamless user experience across devices as we approach our April 30, 2025 beta release date.

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
- **RSVP Management**: Comprehensive system for tracking responses with dietary preferences

### Security

- **Role-Based Access Control**: Comprehensive permission system with clearly defined capabilities
- **Row Level Security**: Database-level protection for all resources
- **Authentication Options**: Multiple secure login methods including QR code scanning
- **Content Protection**: Ensure media is only accessible to authorized users
- **Token-Based Authentication**: Secure access for guests without creating accounts

### AI Features

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

<div align="center">
  <img src="docs/assets/architecture-diagram.png" alt="Cloud Burst System Architecture" width="100%" />
</div>

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

<div align="center">
  <img src="docs/assets/user-flow-diagram.png" alt="Cloud Burst User Flow" width="100%" />
</div>

## 📱 User Experience

### For Event Organizers
- Create and manage events
- Send invitations to attendees
- Monitor event analytics
- Review and approve media uploads
- Generate event QR codes
- Access AI features for media enhancement

### For Photographers
- Upload and organize media
- Create albums and galleries
- Edit and enhance content with AI tools
- Share with event participants
- Track engagement metrics
- Apply automated tagging and organization

### For Invited Guests
- Receive personalized invitations
- Scan QR codes for instant access
- Capture media directly from the event
- View and download shared content
- Connect with other attendees
- Respond to invitations with RSVP
- Enjoy AI-enhanced photos and videos

## 🔄 Current Status

Cloud Burst is currently in beta (v0.9.2) with approximately 90% of core features implemented:

- ✅ Event management system
- ✅ Role-based access control
- ✅ QR code generation and scanning
- ✅ Direct camera integration
- ✅ Media upload and gallery foundation
- ✅ Event card navigation and interactivity
- ✅ Mobile navigation and responsive design
- ✅ Enhanced modal dialogs and UI components
- ✅ RSVP system foundation
- ✅ Public gallery access
- ✅ Invitation management enhancements
- ✅ Beta partner integration
- ✅ Email system improvements
- ✅ Profile management
- ✅ Mobile responsiveness optimization
- ✅ Chart components for data visualization
- ✅ AI Features framework
- ✅ Guest reservation onboarding
- ✅ Camera functionality implementation
- ✅ Staff management with contractor roles
- ✅ Role badge visualization system
- ✅ Profile avatar upload functionality
- ✅ Camera testing with flashlight control
- 🟡 Guest dashboard navigation (60% complete)
- 🟡 Gallery layouts for guests (45% complete)
- 🟡 AI integration with media processing (30% complete)
- 🟡 Analytics dashboard (70% complete)

### Technical Debt (Session 40)
- Fix navigation issues to guest dashboard after setup completion
- Improve token handling and persistence for guest authentication
- Enhance gallery layouts and browsing experience for guests
- Integration of AI features with TensorFlow.js
- Analytics dashboard enhancements
- Enhanced error handling for profile and camera components

We're targeting Beta 1.0 RC1 for internal testing by April 30, 2025, with public launch (v1.0.0) planned for May 25, 2025.

## 📅 Project Timeline

Cloud Burst has evolved from concept to robust beta platform since its inception. Here's our development roadmap:

<div align="center">
  <img src="docs/assets/project-timeline.png" alt="Cloud Burst Project Timeline" width="100%" />
</div>

### Key Development Phases

1. **Foundation Phase** (Feb 1-15, 2025): Project setup, authentication system, database schema design
2. **Core Functionality Phase** (Feb 16-Mar 1, 2025): Event management, basic media upload, user roles
3. **Enhanced Features Phase** (Mar 2-Apr 15, 2025): Advanced gallery, navigation, authentication refinements, invitation system, RSVP functionality, guest reservation, camera integration, contractor role management, profile creation
4. **Final Preparations Phase** (Apr 16-Apr 30, 2025): Guest dashboard navigation, gallery enhancements, AI features, performance tuning, security audit, public launch preparations

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
  - [Website Overview](./docs/design/website_overview.md)
  - [Consistent Layout](./docs/design/consistent-layout.md)
  - [Layout Troubleshooting](./docs/design/layout-troubleshooting.md)

- [Development Documentation](./docs/development/)
  - [Status Notes](./docs/development/STATUS_NOTES.md)
  - [Version Control](./docs/development/VERSION_CONTROL.md)
  - [Contributing Guidelines](./docs/development/contributing.md)
  - [Session 40 Checklist](./docs/session_notes/session_40_checklist.md)
  - [Session 41 Checklist](./docs/development/session_41_checklist.md)

- [Project Structure](./docs/project-structure/)
  - [Project Overview](./docs/project-structure/README.md)
  - [Full Project Tree](./docs/project-structure/FULL_TREE.md)
  - [App Structure](./docs/project-structure/app_tree.md)
  - [Component Structure](./docs/project-structure/components_tree.md)
  - [Camera Components](./docs/project-structure/camera_tree.md)
  - [Gallery Components](./docs/project-structure/gallery_tree.md)

- [User Flows & RBAC](./docs/rbac/)
  - [Role-Based Access Control](./docs/rbac/role_based_access_control.md)
  - [User Flow Overview](./docs/user-flows/user_flow_overview.md)
  - [Invited User Flow](./docs/user-flows/invited_user_flow_design_document.md)
  - [Invitation System Documentation](./docs/user-flows/invitation_system_development_plan.md)
  - [RSVP System Design](./docs/user-flows/RSVP_IMPLEMENTATION_GUIDE.md)

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guide](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📝 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">

Built with ❤️ by Joel and the Cloud Burst Team

</div>