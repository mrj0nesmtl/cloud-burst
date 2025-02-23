# 🏛️ **System Architecture Flowchart**  

## 📡 Cloud Burst  
📅 *Feb 23, 2025*  

---

```mermaid
flowchart TD
    subgraph Client[📱 Client Layer]
        WebApp[🌐 Next.js 14 App]
        AuthForms[🔐 Auth Forms]
        Protected[🛡️ Protected Routes]
        ErrorBoundary[🚧 Error Boundary]
    end

    subgraph Auth[🔑 Authentication Layer]
        SupaAuth[Supabase Auth]
        Session[📝 Session Management]
        Roles[👥 Role Management]
        Permissions[🔑 Permission System]
    end

    subgraph Data[💾 Data Layer]
        Database[🗄️ Supabase PostgreSQL]
        Storage[📦 Supabase Storage]
        RLS[🔒 Row Level Security]
        Capabilities[⚡ Role Capabilities]
    end

    subgraph Settings[⚙️ Settings Layer]
        Profile[👤 Profile Management]
        Prefs[🎛️ User Preferences]
        Notifs[🔔 Notifications]
    end

    subgraph Forms[📝 Form Layer]
        ProfileForm[Profile Form]
        PrefsForm[Preferences Form]
        NotifsForm[Notifications Form]
    end

    WebApp -->|1. Auth Request| AuthForms
    AuthForms -->|2. Credentials| SupaAuth
    SupaAuth -->|3. Validate| Session
    Session -->|4. Create| Roles
    Roles -->|5. Assign| Permissions
    Permissions -->|6. Check| Capabilities
    Capabilities -->|7. Enforce| RLS
    RLS -->|8. Secure| Database
    RLS -->|8. Secure| Storage
    
    Protected -->|Verify| Session
    Protected -->|Check| Permissions
    ErrorBoundary -->|Handle| WebApp

    Profile -->|Update| ProfileForm
    Prefs -->|Configure| PrefsForm
    Notifs -->|Manage| NotifsForm

    ProfileForm -->|Save| Database
    PrefsForm -->|Store| Database
    NotifsForm -->|Update| Database
```

---

## 🛠️ **System Components**  

### 📱 **Client Layer**
- Next.js 14 App Router
- TypeScript + React
- Shadcn/ui Components
- Protected Routes HOC
- Error Boundaries
- Loading States

### 🔑 **Authentication Layer**
- Supabase Auth
- JWT Sessions
- Role-Based Access
- Permission System
- Security Middleware
- Capability Checking

### 💾 **Data Layer**
- PostgreSQL Database
- Supabase Storage
- Row Level Security
- Real-time Subscriptions
- Role Capabilities
- User Profiles

### ⚙️ **Settings Layer**
- Profile Management
- User Preferences
- Notifications

### 📝 **Form Layer**
- Profile Form
- Preferences Form
- Notifications Form

---

## 📐 **Cloud Burst System Overview**  

This **System Architecture Diagram** illustrates the **interaction flow** between different components within Cloud Burst.  

---

```mermaid
flowchart TD

    Client[📱 Client Device] -->|🔗 HTTPS Request| WebApp[🌐 Web App (React/Next.js)]

    WebApp -->|🔌 API Calls| APIGateway[🖥️ API Gateway (Node.js/Express/GraphQL)]

    APIGateway --> Auth[🔑 Authentication Service (Supabase/OAuth)]
    APIGateway --> Database[🗄️ Supabase PostgreSQL Database]
    APIGateway --> CloudStorage[☁️ To be Determined]
    APIGateway --> AIService[🤖 AI Processing (OpenAI)]

    AIService --> CloudStorage
    CloudStorage --> CDN[🚀 Cloudflare CDN] (To Be Determined)
```

---

## 🔒 **Security & Performance Considerations**  
✔️ **JWT Authentication** – Secure login and API access.  
✔️ **End-to-End Encryption** – Protects all user data.  
✔️ **Global CDN Optimization** – Ensures low-latency content delivery.  

---

## 🎯 **Conclusion**  
This **System Architecture Flowchart** provides a **clear, structured overview** of Cloud Burst's backend, frontend, and AI-driven operations. Designed for **scalability, security, and real-time performance**, Cloud Burst **delivers a next-gen event photography experience**. 🚀  

---

```mermaid
sequenceDiagram
    participant Client
    participant Middleware
    participant Auth
    participant API
    participant Supabase

    Client->>Middleware: Request
    Middleware->>Middleware: Rate Limit Check
    Middleware->>Middleware: Security Headers
    Middleware->>Auth: Session Check
    Auth-->>Middleware: Session Status
    Middleware->>API: Forward Request
    API->>Supabase: Database Query
    Supabase-->>API: Response
    API-->>Client: Protected Data
```

### 🔒 Security Layer
- Rate limiting protection
- Security headers
- Session validation
- Route protection
- RBAC enforcement

---

## 🆕 New Components
- Profile Management System
- User Preferences
- Notification Settings
- Form Validation
- Real-time Updates

## 🔄 Next Steps
1. Complete API routes for settings
2. Add database migrations
3. Implement real-time updates
4. Add comprehensive testing
5. Update documentation

```mermaid
flowchart TD
    subgraph Deployment[🚀 Deployment Layer]
        Build[📦 Build Process]
        Config[⚙️ Configuration]
        Security[🔒 Security Layer]
        Monitor[📊 Monitoring]
    end

    subgraph Platform[💻 Replit Platform]
        Node[Node.js 20.x]
        Memory[Memory: 512MB]
        Storage[Storage Layer]
        Network[Network Layer]
    end

    subgraph Process[🔄 Deployment Process]
        Install[📥 Install]
        Compile[🔨 Compile]
        Optimize[⚡ Optimize]
        Deploy[🚀 Deploy]
    end

    Build -->|Configure| Config
    Config -->|Secure| Security
    Security -->|Monitor| Monitor

    Install -->|Dependencies| Node
    Compile -->|TypeScript| Node
    Optimize -->|Assets| Storage
    Deploy -->|Release| Network

    Monitor -->|Health| Platform
    Security -->|Headers| Platform
    Config -->|Settings| Platform
```

## 🔄 Updated Deployment Flow
- Enhanced build pipeline
- Strict security measures
- Comprehensive monitoring
- Resource optimization
- Error handling
- Health checks
- Performance metrics
