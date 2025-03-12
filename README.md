<div align="center">
  <img src="public/android-chrome-192x192.png" alt="Cloud Burst Logo" width="100" height="100" />

# Cloud Burst

## *Elevating Event Photography*

[![Version](https://img.shields.io/badge/version-0.7.6-blue.svg)](https://github.com/mrj0nesmtl/cloud-burst/releases)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-green)](https://supabase.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38B2AC)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

## 📌 Abstract
Cloud Burst represents the evolution of event photography, bridging the gap between traditional charm and modern technology. With the implementation of role-based access control, custom event URLs, and enhanced gallery functionality, our platform now offers a comprehensive solution for event photography management. Deployed in beta at https://cb-beta.replit.app, Cloud Burst maintains exceptional performance within memory constraints while delivering a seamless user experience across devices as we approach our April 1, 2025 launch date.

## 🎯 Pitch
Remember the magic of disposable cameras at wedding tables? We've reimagined that collaborative spirit for the digital age. Cloud Burst transforms every event into a living photo story, powered by AI and created by everyone who matters – your guests. No apps to download, no accounts to create – just scan, snap, and share. With enterprise-grade security, AI-enhanced photos, and real-time galleries, we're not just capturing moments; we're revolutionizing how memories are made.

### [Live Demo](https://cb-beta.replit.app) • [Documentation](docs/) • [Contributing](CONTRIBUTING.md)

<div align="left">

## 📸 Overview

### 📸 Capture Every Moment 📸
No apps to download, no accounts to create. Just scan a QR code and start capturing memories. It's that simple.
Cloud Burst revolutionizes event photography by bringing the charm of disposable cameras into the digital age. Our platform transforms every event into a collaborative photo story, powered by AI and created by all attendees. With no apps to download and no accounts to create, guests simply scan a QR code to instantly start capturing and sharing memories.

### Key Benefits
- **Instant Access**: One QR code connects all your guests
- **Real-Time Gallery**: Watch your event's story unfold live
- **AI-Powered**: Automatic photo enhancement and organization
- **Universal**: Works on any modern device
- **Secure**: Enterprise-grade security and privacy


## 🏗️ System Architecture

```mermaid
graph TD
    A[Client] --> B[Next.js App]
    B --> C[Authentication]
    B --> D[Photo Upload]
    B --> E[Gallery View]
    B --> T[Template Management]
    
    C --> F[Supabase Auth]
    D --> G[Image Processing]
    G --> H[AI Enhancement]
    G --> I[Storage]
    
    E --> J[Real-time Updates]
    J --> K[Gallery DB]
    
    T --> S[Template Editor]
    S --> R[Supabase Auth]
```

## 🔄 User Flow

```mermaid
flowchart LR
    A[Event Guest] --> B{Has QR?}
    B -->|Yes| C[Scan QR]
    B -->|No| D[Request Access]
    C --> E[Gallery Access]
    D --> F[Receive QR]
    F --> C
    E --> G[Upload Photos]
    E --> H[View Gallery]
    G --> I[AI Processing]
    I --> H
```

## 🛠️ Tech Stack

```mermaid
graph TD
    CB[Cloud Burst Platform] --> FE[Frontend]
    CB --> BE[Backend]
    CB --> INFRA[Infrastructure]

    %% Frontend Stack
    FE --> F1[Next.js 14]
    FE --> F2[TypeScript 5.0]
    FE --> F3[UI Layer]
    FE --> F4[State Management]
    FE --> F5[Forms & Validation]

    F3 --> F3A[Shadcn/ui]
    F3 --> F3B[TailwindCSS]
    F3 --> F3C[Responsive Design]
    
    F4 --> F4A[Zustand]
    F4 --> F4B[TanStack Query]
    
    F5 --> F5A[React Hook Form]
    F5 --> F5B[Zod Schema]

    %% Backend Stack
    BE --> B1[Supabase]
    BE --> B2[AI Processing]
    BE --> B3[Storage]
    BE --> B4[Real-time]

    B1 --> B1A[PostgreSQL]
    B1 --> B1B[Auth]
    B1 --> B1C[RLS]

    B2 --> B2A[TensorFlow.js]
    B2 --> B2B[OpenCV]
    B2 --> B2C[OpenAI]

    B3 --> B3A[Image Storage]
    B3 --> B3B[CDN]
    B3 --> B3C[Optimization]

    %% Infrastructure
    INFRA --> I1[Replit]
    INFRA --> I2[CI/CD]
    INFRA --> I3[Monitoring]

    I1 --> I1A[Node 20.x]
    I2 --> I2A[GitHub Actions]
    I3 --> I3A[Sentry]

    style CB fill:#2A2A2A,stroke:#333,color:#fff
    style FE fill:#1E3A8A,stroke:#333,color:#fff
    style BE fill:#065F46,stroke:#333,color:#fff
    style INFRA fill:#7E22CE,stroke:#333,color:#fff
```

## 🤖 AI Capabilities

```mermaid
graph TD
    A[Photo Upload] --> B{AI Processing}
    B --> C[Enhancement]
    B --> D[Face Detection]
    B --> E[Duplicate Check]
    C --> F[Final Image]
    D --> F
    E --> F
    F --> G[Gallery]
    
    style A fill:#2A2A2A,stroke:#333,color:#fff
    style B fill:#1E3A8A,stroke:#333,color:#fff
    style F fill:#065F46,stroke:#333,color:#fff
```

## 🔐 Security Architecture

```mermaid
sequenceDiagram
    participant User
    participant App
    participant Auth
    participant Storage
    
    User->>App: Access Request
    App->>Auth: Verify Access
    Auth-->>App: Token
    App->>Storage: Fetch Photos
    Storage-->>App: Gallery Data
    App-->>User: Display Gallery
```

## ✨ Feature Sets

### 🎯 Essential Features
- **Event Gallery**: Instant photo sharing and organization
- **AI Organization**: Smart photo categorization and enhancement
- **24/7 Access**: Continuous platform availability
- **Social Sharing**: Integrated social media connectivity
- **Standard Support**: Reliable customer assistance

### 💫 Advanced Capabilities
- **Custom Branding**: White-label solution options
- **Analytics Dashboard**: Comprehensive event insights
- **Extended Storage**: Flexible storage solutions
- **Priority Support**: Enhanced customer care
- **Advanced AI**: Premium photo organization

### 🚀 Enterprise Solutions
- **Unlimited Photos**: No storage restrictions
- **Premium AI Tools**: Advanced image processing
- **24/7 Priority Support**: Dedicated assistance
- **API Access**: Custom integration capabilities
- **Advanced Analytics**: Detailed performance metrics

### ⚡ Custom Features
- **Custom AI Models**: Tailored AI solutions
- **Dedicated Support**: Personal support team
- **Custom Integration**: Enterprise system integration
- **Advanced Security**: Enhanced protection measures
- **SLA Guarantee**: Performance guarantees

## 📊 System Performance

- **Response Time**: < 100ms
- **Image Processing**: < 2s
- **Availability**: 99.9%
- **Storage**: Unlimited
- **Concurrent Users**: 10,000+
- **Data Protection**: GDPR Compliant


## 📫 Connect With Us

- Email: joel@arcanaconcept.com
- Deployed: [Beta Platform](https://cb-beta.replit.app)

---

<div align="center">

Made with ❤️ by [Arcana Concept](https://github.com/mrj0nesmtl)

</div>