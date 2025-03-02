# 👥 Role-Based Access Control [Beta v0.1.17]
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
- Template management

### Event Manager
- Event creation
- Gallery management
- Guest access control
- Photo moderation
- Analytics view
- Template viewing

### Basic User
- Gallery access
- Photo upload
- Basic interaction
- Profile management
- Settings control
- Email preferences

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
  const user = session?.data?.session?.user
  const role = user?.app_metadata?.role
  
  // Route protection
  const protectedRoute = req.nextUrl.pathname.startsWith('/protected')
  const adminRoute = req.nextUrl.pathname.startsWith('/protected/admin')
  
  if (protectedRoute && !session?.data?.session) {
    return NextResponse.redirect(new URL('/auth/login', req.url))
  }
  
  // Admin route protection
  if (adminRoute && role !== 'super_admin') {
    return NextResponse.redirect(new URL('/protected/dashboard', req.url))
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
  const role = user?.app_metadata?.role || 'basic_user'
  const permissions = ROLE_PERMISSIONS[role]
  return permissions?.includes(`${action}:${resource}`) ?? false
}
```

### Template Permissions
```typescript
export const TEMPLATE_PERMISSIONS: Record<string, string[]> = {
  super_admin: [
    'create:template',
    'read:template',
    'update:template',
    'delete:template',
    'sync:template'
  ],
  event_manager: [
    'read:template'
  ],
  basic_user: [],
  guest: []
}

// Usage example
const canEditTemplate = checkPermission(
  user,
  'update',
  'template'
)
```

## 🔄 Role Transitions
- Role assignment flow
- Permission updates
- Access revocation
- Temporary elevation
- Audit logging

## 📧 Template Access Control

### Database RLS Policies
```sql
-- Only super_admins can modify templates
CREATE POLICY "Super admins can manage template configurations"
ON template_configurations
FOR ALL
TO authenticated
USING (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'super_admin'
))
WITH CHECK (auth.uid() IN (
  SELECT id FROM profiles WHERE role = 'super_admin'
));

-- All authenticated users can read templates
CREATE POLICY "Authenticated users can read template configurations"
ON template_configurations
FOR SELECT
TO authenticated
USING (true);
```

### API Route Protection
```typescript
// Template API route protection
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient<Database>({ cookies })
  const session = await supabase.auth.getSession()
  
  if (!session?.data?.session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  const user = session.data.session.user
  const role = user?.app_metadata?.role
  
  if (role !== 'super_admin') {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  }
  
  // Process template update
  // ...
}
``` 