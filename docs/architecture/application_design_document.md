# 🎨 **Application Design Document**  

## Cloud Burst
📅 *Updated: Mar 1, 2025*  

## 📊 Implementation Status

| Component | Status | Priority | Dependencies | Progress |
|-----------|---------|-----------|--------------|-----------|
| 🏗️ Core Architecture | ✅ Done | P0 | None | 100% |
| 🎨 Project Structure | ✅ Done | P0 | None | 100% |
| 📚 Documentation | 🟢 Active | P0 | None | 85% |
| 🔐 Authentication | 🟢 Active | P0 | Supabase | 75% |
| 📱 Public Pages | ✅ Done | P0 | Shadcn UI | 100% |
| 🎨 Brand Identity | ✅ Done | P0 | None | 100% |
| 📜 Legal Framework | ⏸️ On Hold | P2 | None | 100% |
| 💰 Pricing System | ⏸️ On Hold | P2 | None | 100% |
| 🖼️ Photo Upload | 🟡 Starting | P1 | Storage | 10% |
| 🤖 AI Processing | ⏸️ On Hold | P3 | TensorFlow | 0% |
| ⚙️ User Settings | 🟡 Active | P0 | Auth | 65% |
| 👤 Profile Management | 🟡 Active | P0 | Auth | 65% |
| 🔔 Notifications | ⏸️ On Hold | P2 | Settings | 0% |

### 🎯 Sprint Progress

| Sprint | Focus | Status | Timeline | Progress |
|--------|-------|--------|----------|-----------|
| 1 | 🛠️ Setup & Structure | ✅ Done | Feb 2024 | 100% |
| 2 | 🎨 UI & Branding | ✅ Done | Feb 2024 | 100% |
| 3 | 🔐 Auth Reset | ✅ Done | Feb 2024 | 100% |
| 4 | ⚙️ Super Admin | 🟢 Active | Feb 2024 | 75% |
| 5 | 🖼️ Photo Features | 🟡 Starting | Mar 2024 | 10% |
| 6 | 🤖 AI Integration | ⏸️ On Hold | TBD | 0% |

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

---

## 🎨 UI & Page Layouts  

### 🏠 **Public Pages**  
📍 *Status: Complete*
- ✅ Landing Page
- ✅ About Page
- ✅ Pricing Page [Beta: Hidden]
- ✅ Contact Page

### 🔐 **Authentication Pages**  
📍 *Status: In Progress - Auth Reset*
- 🟡 Login
- 🟡 Register
- 🟡 Password Recovery

### 🎛️ **Dashboard**  
📍 *Status: Beta Focus*
- 🟡 Basic Layout
- ⏸️ Event Management [Post-Beta]
- ⏸️ Photo Moderation [Post-Beta]
- ⏸️ Analytics [Post-Beta]

### 🎛️ **Event Pages**  
📍 *Status: Planned*
- ⚪ Photo Upload
- ⚪ Gallery View
- ⚪ QR Access

### ⚙️ User Settings
📍 *Status: In Progress*
- 🟡 Profile Management
- 🟡 Basic Preferences
- ⏸️ Advanced Features [Post-Beta]

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
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── admin/
│   │   └── dashboard/
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
│   └── marketing/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils/
└── types/
    └── supabase.ts
├── hooks/
│   ├── use-profile.ts
│   ├── use-update-profile.ts
│   └── use-permissions.ts
└── app/
    └── protected/
        └── settings/
            └── page.tsx
```

---

## 🔒 Security Considerations  

### Authentication & Authorization [Beta Priority]
✔️ **Authentication System**: [RESET IN PROGRESS]
- 🟡 Basic Supabase Auth
- 🟡 Session management
- ⏸️ Advanced features [Post-Beta]

### Database Security [Beta Priority]
✔️ **Row Level Security (RLS)**:
- 🟡 Basic RLS policies
- 🟡 Essential access rules
- ⏸️ Advanced policies [Post-Beta]

### Session Management [Beta Priority]
- 🟡 Basic session validation
- 🟡 Essential cookie handling
- ⏸️ Advanced features [Post-Beta]

### Access Control
✔️ **Role-Based Access Control (RBAC)**:
- Granular permission system
- Role hierarchy
- Protected route middleware
- API route protection

## 🎯 Next Steps [Beta Focus] 
1. 🔄 Complete basic auth reset
2. 🔐 Implement core auth flow
3. 🛡️ Set up essential RLS
4. 📝 Update beta documentation
5. 🧪 Basic testing coverage

## 📝 Notes  
- Following Next.js 14 auth patterns
- Implementing strict TypeScript checks
- Using @supabase/auth-helpers-nextjs
- Following security best practices
- Maintaining comprehensive testing

## 🔒 Security Implementation

### Middleware Protection
- Rate limiting for API routes
- Security headers implementation
- New session management system
- Protected route patterns
- Method validation
- Role-based middleware
- Error boundary implementation

### New Authentication Flow
- PKCE auth flow
- Secure token management
- Server-side validation
- Protected routes
- Role-based access
- Error handling

---

## 🚀 Deployment Architecture [Beta Focus]

### Platform: Replit
- ✅ Node.js 20.x environment
- ✅ 512MB memory allocation
- 🟡 Basic configuration
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
   - 🟡 Core optimization

2. **Basic Security**
   - 🟡 Essential headers
   - 🟡 Basic CORS
   - ⏸️ Advanced features [Post-Beta]

3. **Simple Monitoring**
   - 🟡 Basic health check
   - ⏸️ Advanced tracking [Post-Beta]
   - ⏸️ Complex metrics [Post-Beta]

---

## 🎯 Implementation Priority (v0.1.13)

### Phase 1: Protected Routes & Dashboard
1. **Route Protection System**
   - Middleware implementation
   - Role-based access control
   - Session validation
   - Error boundaries

2. **Dashboard Layout**
   - Navigation structure
   - Role-specific views
   - Responsive design
   - Loading states

### Phase 2: Gallery System
1. **Upload Pipeline**
   - Supabase Storage integration
   - Image optimization
   - Progress tracking
   - Error handling

2. **Gallery Components**
   - Grid layout
   - Lightbox viewer
   - Lazy loading
   - Filter system

### Phase 3: QR System
1. **Code Generation**
   - Unique identifiers
   - Access validation
   - Expiry handling
   - Security measures

## 📊 Current Sprint (v0.1.13)
| Feature | Status | Timeline | Priority |
|---------|--------|----------|-----------|
| Route Protection | 🟡 Active | Week 1 | P0 |
| Dashboard Layout | 🟡 Active | Week 1-2 | P0 |
| Gallery System | 🟡 Starting | Week 2-3 | P1 |
| QR Integration | ⚪ Planned | Week 3-4 | P1 |

---
