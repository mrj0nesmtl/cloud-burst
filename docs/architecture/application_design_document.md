# 🎨 **Application Design Document**  

## Cloud Burst
📅 *Updated: March 3, 2025, 12:40 PM*  
📊 *Version: 0.7.0*

## 📌 Situational Abstract

Cloud Burst has made remarkable progress since its inception on February 1, 2025, evolving from concept to a robust beta platform in just over a month. As of early March 2025, we have successfully implemented core architecture, authentication systems, and role-based access control, establishing a solid foundation for our event photography platform. The recent implementation of custom event URLs, advanced gallery layouts, and tag-based organization represents a critical milestone that fundamentally enhances how users interact with the platform.

With approximately 75% of our Enhanced Features phase complete and an overall project completion of approximately 70%, we are currently on track to meet our April 1, 2025 launch deadline. The development team has maintained an aggressive pace, completing the Foundation and Core Functionality phases ahead of schedule, which has provided additional buffer time for refining the Enhanced Features phase currently underway.

The platform's architecture now features a sophisticated role-based access control system, intuitive event management capabilities, and flexible gallery components that adapt to various devices and preferences. Our focus on TypeScript strict mode compliance has improved code quality and reliability, while our optimization strategies have ensured excellent performance within memory constraints.

As we enter the final month of development before launch, our priorities include completing the download functionality for gallery images, implementing the notification system, enhancing mobile responsiveness, and conducting comprehensive security audits and performance optimization. The team remains confident in our ability to deliver a polished, professional-grade event photography platform by our April 1 target date, transforming how photographers and clients collaborate around life's most precious moments.

## 📊 Implementation Status

| Component | Status | Priority | Dependencies | Progress |
|-----------|---------|-----------|--------------|-----------|
| 🏗️ Core Architecture | ✅ Done | P0 | None | 100% |
| 🎨 Project Structure | ✅ Done | P0 | None | 100% |
| 📚 Documentation | 🟢 Active | P0 | None | 95% |
| 🔐 Authentication | ✅ Done | P0 | Supabase | 100% |
| 📱 Public Pages | ✅ Done | P0 | Shadcn UI | 100% |
| 🎨 Brand Identity | ✅ Done | P0 | None | 100% |
| 📜 Legal Framework | ⏸️ On Hold | P2 | None | 100% |
| 💰 Pricing System | ⏸️ On Hold | P2 | None | 100% |
| 🖼️ Photo Upload | 🟢 Active | P1 | Storage | 40% |
| 🤖 AI Processing | ⏸️ On Hold | P3 | TensorFlow | 0% |
| ⚙️ User Settings | 🟢 Active | P0 | Auth | 80% |
| 👤 Profile Management | 🟢 Active | P0 | Auth | 70% |
| 🔔 Notifications | 🟢 Active | P1 | Settings | 80% |
| 📅 Event Management | 🟢 Active | P1 | Auth | 45% |
| 🔒 Role-Based Access | ✅ Done | P0 | Auth | 100% |

### 🎯 Sprint Progress

| Sprint | Focus | Status | Timeline | Progress |
|--------|-------|--------|----------|-----------|
| 1 | 🛠️ Setup & Structure | ✅ Done | Feb 2024 | 100% |
| 2 | 🎨 UI & Branding | ✅ Done | Feb 2024 | 100% |
| 3 | 🔐 Auth Reset | ✅ Done | Feb 2024 | 100% |
| 4 | ⚙️ Super Admin | ✅ Done | Feb 2024 | 100% |
| 5 | 📧 Notifications | 🟢 Active | Mar 2024 | 80% |
| 6 | 🖼️ Photo Features | 🟢 Active | Mar 2024 | 40% |
| 7 | 📅 Event Management | 🟢 Active | Mar 2024 | 45% |
| 8 | 🔒 RBAC System | ✅ Done | Mar 2024 | 100% |
| 9 | 🤖 AI Integration | ⏸️ On Hold | TBD | 0% |

---

## 🔍 Overview  
The **Cloud Burst** is a web-based solution designed to provide event organizers and participants with an intuitive, AI-enhanced photography platform. This document details the **design and architecture** of the application, covering:  
✔️ Specific pages  
✔️ UI components  
✔️ Role-based access control  
✔️ Proposed project structure  

---

## 🏗️ Application Architecture & Tech Stack  

### 🚀 Tech Stack  
- **Frontend**: ⚛️ Next.js 14, TypeScript, Tailwind CSS, Shadcn UI  
- **Backend**: 🖥️ Supabase (Auth, Storage, Database)  
- **Database**: 🗄️ PostgreSQL with Supabase (real-time updates)  
- **AI/ML**: 🤖 TensorFlow.js, OpenCV, DeepSeek (planned)  
- **Storage**: ☁️ Supabase Storage  
- **Authentication**: 🟢 Supabase Auth with JWT, Role-Based Access  
- **Deployment**: 🚀 Replit (production)  
- **State Management**: 🔄 Zustand for global state

---

## 👥 User Roles & Access Levels  
### 🔑 **Super Admin**
- 🔹 Full system access (internal use only)
- 🔹 User management and role assignment
- 🔹 System configuration and security controls
- 🔹 Analytics access and template management

### 🛡️ **Admin**
- 🔹 Administrative access (internal use only)
- 🔹 User management (cannot assign roles)
- 🔹 Event management and photo moderation
- 🔹 Analytics access and template viewing

### 🎟️ **Organizer**  
- 🔹 Event management access (paid tier only)
- 🔹 Create and manage multiple events
- 🔹 Moderate and approve uploaded content
- 🔹 Analytics view and attendee management

### 📷 **Event Host**  
- 🔹 Create and manage own events (cannot delete)
- 🔹 Attendee management for own events
- 🔹 Photo moderation for own events
- 🔹 Limited analytics

### 👤 **User**
- 🔹 Standard user with basic platform access
- 🔹 Gallery access and photo upload
- 🔹 Profile management and settings control
- 🔹 View public events and galleries

### 👻 **Guest**
- 🔹 Public access to view public events and galleries
- 🔹 Limited upload capabilities
- 🔹 Basic interaction with platform
- 🔹 No account required

---

## 🎨 UI & Page Layouts  

### 🏠 **Public Pages**  
📍 *Status: Complete*
- ✅ Landing Page
- ✅ About Page
- ✅ Pricing Page [Beta: Hidden]
- ✅ Contact Page

### 🔐 **Authentication Pages**  
📍 *Status: Complete*
- ✅ Login
- ✅ Register
- ✅ Password Recovery

### 🎛️ **Dashboard**  
📍 *Status: In Progress*
- ✅ Basic Layout
- 🟢 Event Management [Active]
- ⏸️ Photo Moderation [Post-Beta]
- ⏸️ Analytics [Post-Beta]

### 🎛️ **Event Pages**  
📍 *Status: Active*
- 🟢 Photo Upload
- 🟢 Gallery View
- 🟢 QR Access
- 🟢 Attendee Management

### ⚙️ User Settings
📍 *Status: In Progress*
- 🟢 Profile Management
- 🟢 Basic Preferences
- 🟢 Notifications Management
- ⏸️ Advanced Features [Post-Beta]

### 📧 **Notifications System**
📍 *Status: Active*
- ✅ Email Template Management
- ✅ Template Preview & Editing
- ✅ Supabase Auth Integration
- 🟢 Template Analytics
- ⏸️ Push Notifications [Post-Beta]
- ⏸️ SMS Notifications [Post-Beta]

### 🔒 **Role-Based Access Control**
📍 *Status: Complete*
- ✅ Role definitions and hierarchy
- ✅ Permission hooks and components
- ✅ Conditional UI rendering
- ✅ Route protection middleware
- ✅ Database RLS policies

---

## 📂 Project Structure  

```typescript
src/
├── app/
│   ├── (marketing)/
│   │   ├── page.tsx
│   │   ├── about/
│   │   ├── pricing/
│   │   └── contact/
│   ├── api/
│   │   ├── templates/
│   │   │   └── sync/
│   │   └── cron/
│   │       └── sync-templates/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── protected/
│   │   ├── admin/
│   │   ├── settings/
│   │   │   └── notifications/
│   │   └── events/
│   │       ├── [id]/
│   │       │   ├── page.tsx
│   │       │   ├── edit/
│   │       │   ├── qr/
│   │       │   └── attendees/
│   │       ├── create/
│   │       └── page.tsx
│   └── middleware.ts
├── components/
│   ├── ui/
│   ├── auth/
│   │   ├── auth-form.tsx
│   │   ├── auth-provider.tsx
│   │   └── permission-gate.tsx
│   ├── events/
│   │   ├── event-actions.tsx
│   │   ├── attendee-management.tsx
│   │   └── qr-code-display.tsx
│   ├── gallery/
│   │   ├── gallery-grid.tsx
│   │   ├── upload-dropzone.tsx
│   │   └── photo-lightbox.tsx
│   ├── forms/
│   │   ├── profile-form.tsx
│   │   ├── preferences-form.tsx
│   │   ├── notifications-form.tsx
│   │   └── event-form.tsx
│   ├── layout/
│   │   ├── main-nav.tsx
│   │   └── site-header.tsx
│   ├── notifications/
│   │   ├── template-preview.tsx
│   │   ├── template-editor.tsx
│   │   ├── full-preview.tsx
│   │   └── create-template.tsx
│   └── marketing/
├── hooks/
│   ├── use-auth.ts
│   ├── use-permissions.ts
│   ├── use-toast.ts
│   └── use-profile.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── auth-store.ts
│   │   ├── templates.ts
│   │   ├── events.ts
│   │   ├── photos.ts
│   │   └── types.ts
│   └── utils/
├── store/
│   ├── events-store.ts
│   └── photos-store.ts
└── types/
    ├── supabase.ts
    └── events.ts
```

---

## 🔒 Security Considerations  

### Authentication & Authorization [Complete]
✔️ **Authentication System**:
- ✅ Supabase Auth
- ✅ Session management
- ✅ Role-based access
- ✅ Permission hooks
- ⏸️ Advanced features [Post-Beta]

### Database Security [Complete]
✔️ **Row Level Security (RLS)**:
- ✅ Basic RLS policies
- ✅ Template access rules
- ✅ Event access policies
- ✅ Role-based policies
- ⏸️ Advanced policies [Post-Beta]

### Session Management [Complete]
- ✅ Session validation
- ✅ Cookie handling
- ✅ Role verification
- ✅ Permission checking
- ⏸️ Advanced features [Post-Beta]

### Access Control [Complete]
✔️ **Role-Based Access Control (RBAC)**:
- ✅ Permission system
- ✅ Role hierarchy
- ✅ Protected route middleware
- ✅ API route protection
- ✅ Conditional UI rendering

## 🎯 Next Steps [v0.1.18 Focus] 
1. 🖼️ Complete gallery components and lightbox
2. 📅 Enhance event management system
3. 👤 Implement profile management
4. 📊 Add analytics for templates
5. 🎫 Enhance QR code system
6. 🔒 Implement invited user role

## 📝 Notes  
- Role-based access control system now fully implemented
- Event management system foundation in place
- Gallery components started
- QR code display implemented
- Permission gates for conditional UI rendering
- Documentation updated to reflect v0.1.18

## 🔒 Security Implementation

### Middleware Protection
- ✅ Rate limiting for API routes
- ✅ Security headers implementation
- ✅ Session management system
- ✅ Protected route patterns
- ✅ Method validation
- ✅ Role-based middleware
- ✅ Error boundary implementation
- ✅ Permission-based route protection

### Authentication Flow
- ✅ Secure auth flow
- ✅ Token management
- ✅ Server-side validation
- ✅ Protected routes
- ✅ Role-based access
- ✅ Error handling
- ✅ Permission checking

---

## 🚀 Deployment Architecture [Beta Focus]

### Platform: Replit
- ✅ Node.js 20.x environment
- ✅ 512MB memory allocation
- ✅ Basic configuration
- ⏸️ Advanced features [Post-Beta]

### Configuration Files
```typescript
├── .replit                 // Basic configuration
├── replit.nix             // Essential dependencies
└── next.config.js         // Core settings
```

### Deployment Process [Beta]
1. **Essential Build**
   - ✅ Dependencies installation
   - ✅ Basic compilation
   - ✅ Core optimization

2. **Basic Security**
   - ✅ Essential headers
   - ✅ Basic CORS
   - ✅ Role-based access control
   - ⏸️ Advanced features [Post-Beta]

3. **Simple Monitoring**
   - ✅ Basic health check
   - ⏸️ Advanced tracking [Post-Beta]
   - ⏸️ Complex metrics [Post-Beta]

---

## 🎯 Implementation Priority (v0.1.18)

### Phase 1: Role-Based Access Control [Complete]
1. **RBAC System**
   - ✅ Role definitions and hierarchy
   - ✅ Permission hooks and components
   - ✅ Conditional UI rendering
   - ✅ Route protection middleware
   - ✅ Database RLS policies

2. **Permission Components**
   - ✅ Permission gate component
   - ✅ Role gate component
   - ✅ Subscription gate component
   - ✅ Conditional navigation
   - ✅ Protected actions

### Phase 2: Event Management [Active]
1. **Event Creation and Editing**
   - ✅ Event form component
   - ✅ Event detail page
   - ✅ Event actions with permissions
   - 🟢 Event settings
   - 🟢 Advanced options

2. **Event Features**
   - ✅ Attendee management
   - ✅ QR code display
   - 🟢 Gallery integration
   - 🟢 Event sharing
   - 🟢 Event analytics

### Phase 3: Gallery System [Active]
1. **Upload Pipeline**
   - 🟢 Supabase Storage integration
   - 🟢 Image optimization
   - 🟢 Progress tracking
   - 🟢 Error handling

2. **Gallery Components**
   - 🟢 Grid layout
   - 🟢 Lightbox viewer
   - 🟢 Lazy loading
   - 🟢 Filter system

### Phase 4: Profile Management [Planned]
1. **Profile Features**
   - 🟡 Profile editing
   - 🟡 Avatar management
   - 🟡 Subscription management
   - 🟡 Notification preferences

## 📊 Current Sprint (v0.1.18)
| Feature | Status | Timeline | Priority |
|---------|--------|----------|-----------|
| Role-Based Access Control | ✅ Complete | Week 1 | P0 |
| Event Management | 🟢 Active | Week 1-2 | P0 |
| Gallery System | 🟢 Active | Week 2 | P1 |
| Profile Management | 🟡 Planned | Week 3 | P1 |
| QR Enhancement | 🟡 Planned | Week 3 | P2 |
| Invited User Role | 🟡 Planned | Week 4 | P2 |

---
