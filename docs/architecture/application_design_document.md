# 🎨 **Application Design Document**  

## 📸 Cloud Burst
📅 *Updated: Feb 20, 2024*  

## 📊 Implementation Status

| Component | Status | Priority | Dependencies | Progress |
|-----------|---------|-----------|--------------|-----------|
| 🏗️ Core Architecture | ✅ Done | P0 | None | 100% |
| 🎨 Project Structure | ✅ Done | P0 | None | 100% |
| 📚 Documentation | 🟢 Active | P0 | None | 85% |
| 🔐 Authentication | 🔄 Reset | P0 | Supabase | 0% |
| 📱 Public Pages | ✅ Done | P0 | Shadcn UI | 100% |
| 🎨 Brand Identity | ✅ Done | P0 | None | 100% |
| 📜 Legal Framework | ✅ Done | P0 | None | 100% |
| 💰 Pricing System | ✅ Done | P0 | None | 100% |
| 🖼️ Photo Upload | ⏸️ On Hold | P1 | Storage | 0% |
| 🤖 AI Processing | ⏸️ On Hold | P1 | TensorFlow | 0% |

### 🎯 Sprint Progress

| Sprint | Focus | Status | Timeline | Progress |
|--------|-------|--------|----------|-----------|
| 1 | 🛠️ Setup & Structure | ✅ Done | Feb 2024 | 100% |
| 2 | 🎨 UI & Branding | ✅ Done | Feb 2024 | 100% |
| 3 | 🔐 Auth & Core | 🟢 Active | Feb 2024 | 75% |
| 4 | 🤖 AI Features | ⚪ Planned | Mar 2024 | 0% |

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
- **Deployment**: 🚀 Replit (development)  

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
- ✅ Pricing Page
- ✅ Contact Page

### 🔐 **Authentication Pages**  
📍 *Status: In Progress*
- 🟢 Login
- 🟢 Register
- ⚪ Password Recovery

### 🎛️ **Dashboard (Event Organizer)**  
📍 *Status: In Progress*
- 🟢 Basic Layout
- ⚪ Event Management
- ⚪ Photo Moderation
- ⚪ Analytics

### 🎛️ **Event Pages**  
📍 *Status: Planned*
- ⚪ Photo Upload
- ⚪ Gallery View
- ⚪ QR Access

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
│   └── marketing/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── types.ts
│   └── utils/
└── types/
    └── supabase.ts
```

---

## 🔒 Security Considerations  

### Authentication & Authorization
✔️ **Authentication System**: [RESET IN PROGRESS]
- Implementing new Supabase Auth with PKCE flow
- Single source of truth for auth state
- Server-side session management
- Proper token handling
- Secure cookie implementation

### Database Security
✔️ **Row Level Security (RLS)**:
- Fresh implementation of RLS policies
- Table-level security rules
- Role-based data access
- Proper schema isolation

### Session Management
✔️ **Enhanced Session Security**:
- Server-side session validation
- Secure cookie handling
- Token refresh mechanism
- Session timeout handling
- CSRF protection

### Access Control
✔️ **Role-Based Access Control (RBAC)**:
- Granular permission system
- Role hierarchy
- Protected route middleware
- API route protection

## 🎯 Next Steps  
1. 🔄 Complete authentication system reset
2. 🔐 Implement new auth flow
3. 🛡️ Set up RLS policies
4. 📝 Update documentation
5. 🧪 Comprehensive testing

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
