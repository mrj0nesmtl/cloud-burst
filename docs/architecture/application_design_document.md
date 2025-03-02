# 🎨 **Application Design Document**  

## Cloud Burst
📅 *Updated: Mar 1, 2025*  

## 📊 Implementation Status

| Component | Status | Priority | Dependencies | Progress |
|-----------|---------|-----------|--------------|-----------|
| 🏗️ Core Architecture | ✅ Done | P0 | None | 100% |
| 🎨 Project Structure | ✅ Done | P0 | None | 100% |
| 📚 Documentation | 🟢 Active | P0 | None | 90% |
| 🔐 Authentication | ✅ Done | P0 | Supabase | 100% |
| 📱 Public Pages | ✅ Done | P0 | Shadcn UI | 100% |
| 🎨 Brand Identity | ✅ Done | P0 | None | 100% |
| 📜 Legal Framework | ⏸️ On Hold | P2 | None | 100% |
| 💰 Pricing System | ⏸️ On Hold | P2 | None | 100% |
| 🖼️ Photo Upload | 🟡 Starting | P1 | Storage | 20% |
| 🤖 AI Processing | ⏸️ On Hold | P3 | TensorFlow | 0% |
| ⚙️ User Settings | 🟢 Active | P0 | Auth | 75% |
| 👤 Profile Management | 🟡 Active | P0 | Auth | 65% |
| 🔔 Notifications | 🟢 Active | P1 | Settings | 75% |
| 📅 Event Management | 🟡 Starting | P1 | Auth | 15% |

### 🎯 Sprint Progress

| Sprint | Focus | Status | Timeline | Progress |
|--------|-------|--------|----------|-----------|
| 1 | 🛠️ Setup & Structure | ✅ Done | Feb 2024 | 100% |
| 2 | 🎨 UI & Branding | ✅ Done | Feb 2024 | 100% |
| 3 | 🔐 Auth Reset | ✅ Done | Feb 2024 | 100% |
| 4 | ⚙️ Super Admin | ✅ Done | Feb 2024 | 100% |
| 5 | 📧 Notifications | 🟢 Active | Mar 2024 | 75% |
| 6 | 🖼️ Photo Features | 🟡 Starting | Mar 2024 | 20% |
| 7 | 📅 Event Management | 🟡 Starting | Mar 2024 | 15% |
| 8 | 🤖 AI Integration | ⏸️ On Hold | TBD | 0% |

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

---

## 👥 User Roles & Access Levels  
### 🎟️ **Event Organizer**  
- 🔹 Full dashboard access  
- 🔹 Manage events & settings  
- 🔹 Moderate and approve uploaded content  

### 📷 **Event Participant/Guest**  
- 🔹 Upload and share photos  
- 🔹 Browse the event gallery  
- 🔹 Download images  

### 🛠️ **Administrator**  
- 🔹 Manage all users  
- 🔹 Oversee platform operations  
- 🔹 Configure system templates and notifications

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
- 🟡 Event Management [In Progress]
- ⏸️ Photo Moderation [Post-Beta]
- ⏸️ Analytics [Post-Beta]

### 🎛️ **Event Pages**  
📍 *Status: Starting*
- 🟡 Photo Upload
- 🟡 Gallery View
- ⚪ QR Access

### ⚙️ User Settings
📍 *Status: In Progress*
- 🟡 Profile Management
- 🟡 Basic Preferences
- 🟢 Notifications Management
- ⏸️ Advanced Features [Post-Beta]

### 📧 **Notifications System**
📍 *Status: Active*
- ✅ Email Template Management
- ✅ Template Preview & Editing
- ✅ Supabase Auth Integration
- 🟡 Template Analytics
- ⏸️ Push Notifications [Post-Beta]
- ⏸️ SMS Notifications [Post-Beta]

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
│   └── middleware.ts
├── components/
│   ├── ui/
│   ├── auth/
│   │   ├── auth-form.tsx
│   │   └── auth-provider.tsx
│   ├── forms/
│   │   ├── profile-form.tsx
│   │   ├── preferences-form.tsx
│   │   └── notifications-form.tsx
│   ├── notifications/
│   │   ├── template-preview.tsx
│   │   ├── template-editor.tsx
│   │   ├── full-preview.tsx
│   │   └── create-template.tsx
│   └── marketing/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   ├── auth-store.ts
│   │   ├── templates.ts
│   │   └── types.ts
│   └── utils/
└── types/
    └── supabase.ts
```

---

## 🔒 Security Considerations  

### Authentication & Authorization [Complete]
✔️ **Authentication System**:
- ✅ Supabase Auth
- ✅ Session management
- ✅ Role-based access
- ⏸️ Advanced features [Post-Beta]

### Database Security [In Progress]
✔️ **Row Level Security (RLS)**:
- ✅ Basic RLS policies
- ✅ Template access rules
- 🟡 Enhanced access rules
- ⏸️ Advanced policies [Post-Beta]

### Session Management [Complete]
- ✅ Session validation
- ✅ Cookie handling
- ✅ Role verification
- ⏸️ Advanced features [Post-Beta]

### Access Control
✔️ **Role-Based Access Control (RBAC)**:
- ✅ Permission system
- ✅ Role hierarchy
- ✅ Protected route middleware
- ✅ API route protection

## 🎯 Next Steps [v0.1.18 Focus] 
1. 🖼️ Enhance gallery components
2. 📅 Complete event management system
3. 👤 Implement profile management
4. 📊 Add analytics for templates
5. 🎫 Design QR code system

## 📝 Notes  
- Email template system now functional
- Server/client component separation optimized
- React key warnings fixed in components
- Enhanced error handling in API routes
- Documentation aligned with v0.1.17

## 🔒 Security Implementation

### Middleware Protection
- ✅ Rate limiting for API routes
- ✅ Security headers implementation
- ✅ Session management system
- ✅ Protected route patterns
- ✅ Method validation
- ✅ Role-based middleware
- ✅ Error boundary implementation

### Authentication Flow
- ✅ Secure auth flow
- ✅ Token management
- ✅ Server-side validation
- ✅ Protected routes
- ✅ Role-based access
- ✅ Error handling

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
   - ⏸️ Advanced features [Post-Beta]

3. **Simple Monitoring**
   - ✅ Basic health check
   - ⏸️ Advanced tracking [Post-Beta]
   - ⏸️ Complex metrics [Post-Beta]

---

## 🎯 Implementation Priority (v0.1.17)

### Phase 1: Protected Routes & Dashboard [Complete]
1. **Route Protection System**
   - ✅ Middleware implementation
   - ✅ Role-based access control
   - ✅ Session validation
   - ✅ Error boundaries

2. **Dashboard Layout**
   - ✅ Navigation structure
   - ✅ Role-specific views
   - ✅ Responsive design
   - ✅ Loading states

### Phase 2: Notifications & Templates [Active]
1. **Email Template System**
   - ✅ Template configurations database
   - ✅ Template preview and editor
   - ✅ Supabase Auth synchronization
   - ✅ API routes for management

2. **Notifications Interface**
   - ✅ Email template management
   - 🟡 Template analytics
   - ⏸️ Push notifications [Post-Beta]
   - ⏸️ SMS notifications [Post-Beta]

### Phase 3: Gallery System [Starting]
1. **Upload Pipeline**
   - 🟡 Supabase Storage integration
   - 🟡 Image optimization
   - ⚪ Progress tracking
   - ⚪ Error handling

2. **Gallery Components**
   - 🟡 Grid layout
   - ⚪ Lightbox viewer
   - ⚪ Lazy loading
   - ⚪ Filter system

### Phase 4: Event Management [Starting]
1. **Event Creation**
   - 🟡 Basic form
   - 🟡 Event settings
   - ⚪ Advanced options
   - ⚪ Scheduling

2. **Event Management**
   - 🟡 Listing page
   - ⚪ Detail view
   - ⚪ Status management
   - ⚪ Guest management

### Phase 5: QR System [Planned]
1. **Code Generation**
   - ⚪ Unique identifiers
   - ⚪ Access validation
   - ⚪ Expiry handling
   - ⚪ Security measures

## 📊 Current Sprint (v0.1.17)
| Feature | Status | Timeline | Priority |
|---------|--------|----------|-----------|
| Email Templates | ✅ Complete | Week 1 | P0 |
| Gallery System | 🟡 Active | Week 1-2 | P0 |
| Event Management | 🟡 Active | Week 2-3 | P1 |
| Profile Management | 🟡 Planned | Week 3 | P1 |
| QR Integration | ⚪ Planned | Week 4 | P2 |

---
