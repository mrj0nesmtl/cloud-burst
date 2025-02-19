# 🔄 **User Flow Chart**  

## Cloud Capture V.1
📅 *Updated: Feb 17, 2024*  

---

```mermaid
graph TD
    subgraph Authentication [🔐 Enhanced Authentication]
        A[📧 User Arrives] -->|Protected Route| B[🔐 Auth Page]
        B -->|Validated Form| C{Authentication Choice}
        
        C -->|Rate Limited| D[📝 Email Sign In]
        C -->|Rate Limited| E[📝 Email Sign Up]
        
        D -->|Session Refresh| F[🔑 Session Created]
        E -->|Cookie Security| F
        
        F -->|Middleware Guard| G[🛡️ Protected Route]
    end

    subgraph Authorization [🛡️ Enhanced Authorization]
        G -->|Role Validation| H{👥 Role Check}
        H -->|Method Validation| I[📊 Planner Dashboard]
        H -->|Pattern Matching| J[📱 Guest Dashboard]
    end

    subgraph Features [✨ Secure Features]
        I -->|Protected API| K[Event Management]
        J -->|Protected API| L[Photo Gallery]
        
        K -->|Rate Limited| M[📸 Photo Operations]
        L -->|Rate Limited| M
    end
```

---

## 🎯 **Key Security Components**  

### 🔐 **Enhanced Authentication**
- Rate limiting protection
- Security headers
- Session management
- Cookie security
- Error handling

### 👥 **Robust Authorization**
- Dynamic route matching
- Method validation
- Role-based access
- Protected API routes

### 📊 **Secure Operations**
- Protected endpoints
- Rate limited APIs
- Session refresh
- Error boundaries

---
