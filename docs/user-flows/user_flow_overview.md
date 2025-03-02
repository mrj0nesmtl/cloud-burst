# 📖 **User Flow Overview**  

## Cloud Burst  
📅 *Updated: March 1, 2025*  

## 📌 Situational Abstract
Following the successful implementation of Super Admin authentication and enhanced dashboard functionality, Cloud Burst's user flows have been streamlined and secured. With Zustand for state management and TanStack Query for data fetching, the platform now offers a more robust and performant experience while maintaining our beta focus on essential features.

## 🔄 **Core User Flows** [Updated]

```mermaid
flowchart TD
    A[User] --> B{Auth Check}
    B -->|No Auth| C[Landing Page]
    B -->|Has Auth| D[Dashboard]
    
    C --> |Sign Up| E[Auth Form]
    C --> |Sign In| E
    E --> |Success| D
    
    D --> F[Super Admin]
    D --> G[Event Manager]
    D --> H[Basic User]
    
    F --> I[Admin Dashboard]
    G --> J[Event Management]
    H --> K[Gallery Access]
    
    I --> L[User Management]
    J --> M[Photo Upload]
    K --> N[View & Share]
```

## 🔐 **Security Flow** [Enhanced]

```mermaid
flowchart LR
    A[Request] --> B{Rate Limit}
    B -->|Passed| C{Auth Check}
    B -->|Failed| D[429 Error]
    C -->|Valid| E[Role Check]
    C -->|Invalid| F[Auth Page]
    E -->|Authorized| G[Protected Route]
    E -->|Unauthorized| H[403 Error]
    G --> I{Session Valid}
    I -->|Yes| J[Resource]
    I -->|No| F
```

## 📊 **User Engagement Metrics**

```mermaid
pie
    title "User Interaction Distribution"
    "Photo Upload" : 40
    "Gallery Browsing" : 30
    "Social Sharing" : 20
    "Profile Management" : 10
```

## 🔒 **Security-Enhanced Flow**  

### 🛡️ **Protected Routes**
- Rate limiting protection
- Method validation
- Dynamic pattern matching
- Session management
- Cookie security

### 🔐 **Authentication Layer**
- Secure session handling
- Cookie cleanup
- Rate limited endpoints
- Error boundaries
- Loading states

## 📝 **Introduction**  
Cloud Burst is an **AI-powered event photography platform** designed to **seamlessly collect, filter, and organize event photos**.  

📌 *This document outlines the complete user journey, from ticket purchase to photo engagement.*  

## 📈 **Feature Usage Distribution**

```mermaid
graph LR
    A[Features] --> B[Photo Upload]
    A --> C[Gallery View]
    A --> D[Social Sharing]
    A --> E[AI Enhancement]
    
    B --> F[40% Usage]
    C --> G[30% Usage]
    D --> H[20% Usage]
    E --> I[10% Usage]

    style F fill:#90EE90
    style G fill:#ADD8E6
    style H fill:#FFB6C1
    style I fill:#DDA0DD
```

## 🏷️ **Pre-Event: Ticket Confirmation & QR Code**  

### 📩 **Email Components**
- `<AspectRatio>` for QR code display
- `<Card>` for email template
- `<Button>` for direct access
✔️ Upon purchasing a ticket, users **receive an email** with:
  - Event details
  - Unique QR code
  - Platform instructions

## 🎉 **Event Arrival & Authentication**  

### 📱 **Access Components**
- `<Dialog>` for camera permission
- `<Tabs>` for auth options
- `<Form>` for guest info
✔️ Users can:
  - Scan QR with smartphone
  - Choose auth method
  - Access gallery instantly

## 📸 **Photo Management**  

### 📷 **Upload Components**
- `<DropZone>` for uploads
- `<Progress>` for status
- `<Toast>` for notifications
✔️ Features include:
  - Direct camera access
  - File uploads
  - AI enhancement
  - Real-time processing

## 🖼️ **Gallery Experience**  

### 🎨 **Gallery Components**
- `<ScrollArea>` for gallery
- `<AspectRatio>` for images
- `<Dialog>` for previews
- `<HoverCard>` for details
✔️ Users can:
  - Browse real-time
  - Search by AI tags
  - Like and share
  - Download favorites

## 📩 **Post-Event Access**  

### 📊 **Download Components**
- `<Card>` for options
- `<Button>` for actions
- `<Alert>` for expiry
✔️ Features include:
  - Gallery link email
  - Download options
  - Print ordering
  - Access expiration

## 🎯 **Conclusion**  
Cloud Burst ensures that event attendees can **easily capture, upload, and relive their event experience effortlessly**. By integrating **AI-powered organization and real-time access**, Cloud Burst creates an **engaging and seamless user experience**. 🚀  

---
