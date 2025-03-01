# 👥 Role-Based Access Control [Beta v0.1.16]
📅 *Updated: March 1, 2025*

## 📌 Overview
Cloud Burst implements a comprehensive role-based access control (RBAC) system.

## 🎭 User Roles

### Super Admin
- System configuration
- User management
- Role assignment
- Analytics access
- Security controls

### Event Manager
- Event creation
- Gallery management
- Guest access control
- Photo moderation
- Analytics view

### Basic User
- Gallery access
- Photo upload
- Basic interaction
- Profile management
- Settings control

### Guest User
- Event access
- Photo viewing
- Limited upload
- Basic interaction
- Temporary access

## 🔐 Access Control

### Middleware
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const session = await supabase.auth.getSession()
  
  // Role validation
  const user = session?.user
  const role = user?.role
  
  // Route protection
  const protectedRoute = req.nextUrl.pathname.startsWith('/protected')
  if (protectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }
  
  return res
}
```

### Permission Checks
```typescript
export const checkPermission = (
  user: User,
  action: Action,
  resource: Resource
): boolean => {
  const role = user.role
  const permissions = ROLE_PERMISSIONS[role]
  return permissions?.includes(`${action}:${resource}`) ?? false
}
```

## 🔄 Role Transitions
- Role assignment flow
- Permission updates
- Access revocation
- Temporary elevation
- Audit logging 