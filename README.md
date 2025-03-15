<div align="center">
  <img src="public/android-chrome-192x192.png" alt="Cloud Burst Logo" width="100" height="100" />

# Cloud Burst

## 📸 Comprehensive Event Media Platform

Cloud Burst is a next-generation event media platform that seamlessly connects event organizers, photographers, and attendees through an intuitive, secure, and feature-rich interface. Our platform enables the capture, management, and sharing of both photos and videos from events, with powerful QR code integration for instant camera access.

## 🚀 Key Features

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

## 🛠️ Technology Stack

```typescript
{
  frontend: {
    framework: 'Next.js 14',
    language: 'TypeScript 5.0',
    state: 'Zustand',
    styling: 'Tailwind CSS',
    ui: 'Shadcn/ui',
    routing: 'App Router',
    auth: 'Supabase Auth',
    forms: 'react-hook-form + zod',
    query: 'TanStack Query v5'
  },
  backend: {
    database: 'Supabase',
    api: 'REST + WebSocket',
    analytics: 'Custom + Recharts',
    caching: 'Redis',
    search: 'PostgreSQL + PostGIS',
    ai: ['TensorFlow.js', 'OpenCV', 'DeepSeek', 'OpenAI']
  },
  infrastructure: {
    hosting: 'Replit',
    ci_cd: 'GitHub Actions',
    monitoring: 'Sentry',
    performance: 'Lighthouse',
    security: 'Supabase RLS + Custom RBAC',
    storage: 'Supabase Storage'
  }
}
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