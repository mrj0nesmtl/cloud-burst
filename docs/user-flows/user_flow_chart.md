# 🔄 **User Flow Chart**  

## 📡 Cloud Capture
📅 *Feb 16, 2024*  

---

```mermaid
graph TD
    subgraph Authentication
        A[📧 User Arrives] -->|Next.js Route| B[🔐 Auth Page]
        B -->|Form Component| C{Authentication Choice}
        
        C -->|Email Form| D[📝 Email Sign In]
        C -->|Email Form| E[📝 Email Sign Up]
        
        D -->|Supabase Auth| F[🔑 Session Created]
        E -->|Supabase Auth| F
        
        F -->|Route Guard| G[🛡️ Protected Route]
    end

    subgraph Authorization
        G -->|Role Check| H{👥 Role Verification}
        H -->|Event Planner| I[📊 Planner Dashboard]
        H -->|Attendee| J[📱 Attendee Dashboard]
    end

    subgraph Features
        I -->|Auth Required| K[Event Management]
        J -->|Auth Required| L[Photo Gallery]
        
        K -->|Protected| M[📸 Photo Operations]
        L -->|Protected| M
    end
```

---

## 🎯 **Key Components**  

### 🔐 **Authentication**
- Email Sign In/Up Forms
- Session Management
- Protected Routes
- Loading States

### 👥 **Authorization**
- Role Assignment
- Permission Checks
- Access Control
- Security Rules

### 📊 **Dashboards**
- Role-Specific Views
- Protected Features
- Secure Operations
- Real-time Updates

---
