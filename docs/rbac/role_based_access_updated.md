# 👥 Role-Based Access Control [Beta v0.1.18]
📅 *Updated: March 3, 2025*

## 📌 Overview
Cloud Burst implements a comprehensive role-based access control (RBAC) system with clearly defined roles and capabilities.

## 🎭 User Roles

### Super Admin
- **Description**: Full system access - internal use only
- **Email**: joel.yaffe@gmail.com
- **Capabilities**:
  - System configuration
  - User management
  - Role assignment
  - Analytics access
  - Security controls
  - Template management
  - Event management
  - Photo moderation

### Admin
- **Description**: Administrative access - internal use only
- **Email**: joel.yaffe+admin@gmail.com
- **Capabilities**:
  - User management
  - Event management
  - Photo moderation
  - Analytics access
  - Template viewing

### Organizer
- **Description**: Event management access - can create and manage multiple events
- **Email**: joel.yaffe+organizer@gmail.com
- **Subscription**: Paid Only
- **Capabilities**:
  - Event creation
  - Event editing
  - Event deletion
  - Attendee management
  - Photo moderation
  - Analytics view

### Event Host
- **Description**: Can create and manage their own events - cannot delete events
- **Email**: joel.yaffe+eventhost@gmail.com
- **Subscription**: Free/Paid
- **Capabilities**:
  - Event creation
  - Event editing
  - Attendee management
  - Photo moderation
  - Limited analytics

### Invited User (Planned)
- **Description**: Invited attendee (QR) - can view own events and galleries
- **Email**: joel.yaffe+inviteduser@gmail.com
- **Subscription**: Free
- **Capabilities**:
  - Event access
  - Photo viewing
  - Photo upload
  - Basic interaction

### User
- **Description**: Standard user with basic platform access
- **Email**: joel.yaffe+user@gmail.com
- **Subscription**: Free
- **Capabilities**:
  - Gallery access
  - Photo upload
  - Profile management
  - Settings control

### Guest
- **Description**: Public access - can view public events and galleries
- **Email**: joel.yaffe+guest@gmail.com
- **Subscription**: Free
- **Capabilities**:
  - Event access
  - Photo viewing
  - Limited upload
  - Basic interaction

## 🔐 Access Control Implementation

### Database Structure
```sql
-- Roles table
CREATE TABLE public.roles (
  name TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role capabilities table
CREATE TABLE public.role_capabilities (
  role TEXT REFERENCES public.roles(name),
  capability TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role, capability)
);

-- Profiles table with role column
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  role TEXT REFERENCES public.roles(name),
  -- other fields
  CHECK (role = ANY (ARRAY['super_admin', 'admin', 'event_host', 'user', 'guest']))
);
```

### Middleware
```typescript
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const session = await supabase.auth.getSession()
  
  // Get user profile with role
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    const role = profile?.role || 'guest'
    
    // Route protection
    const protectedRoute = req.nextUrl.pathname.startsWith('/protected')
    const adminRoute = req.nextUrl.pathname.startsWith('/protected/admin')
    
    if (protectedRoute && !session?.data?.session) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
    
    // Admin route protection
    if (adminRoute && !['super_admin', 'admin'].includes(role)) {
      return NextResponse.redirect(new URL('/protected/dashboard', req.url))
    }
  }
  
  return res
}
```

### Permission Checks
```typescript
import { createClient } from '@/lib/supabase/client'

export async function checkPermission(
  action: string,
  resource: string
): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  // Get user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  const role = profile?.role || 'guest'
  
  // Check if role has capability
  const { data: capabilities } = await supabase
    .from('role_capabilities')
    .select('capability')
    .eq('role', role)
  
  const hasCapability = capabilities?.some(
    c => c.capability === `${action}:${resource}` || c.capability === 'manage:all'
  )
  
  return !!hasCapability
}

// Usage example
const canDeleteEvent = await checkPermission('delete', 'event')
```

### UI Conditional Rendering
```tsx
import { useUser } from '@/hooks/use-user'

export function EventActions({ event }) {
  const { user, profile } = useUser()
  
  // Check if user can edit this event
  const canEdit = 
    profile?.role === 'super_admin' || 
    profile?.role === 'admin' ||
    (event.organizer_id === user?.id && 
      ['organizer', 'event_host'].includes(profile?.role))
  
  // Check if user can delete this event
  const canDelete = 
    profile?.role === 'super_admin' || 
    profile?.role === 'admin' ||
    (event.organizer_id === user?.id && profile?.role === 'organizer')
  
  return (
    <div className="flex space-x-2">
      {canEdit && (
        <Button variant="outline" asChild>
          <Link href={`/protected/events/${event.id}/edit`}>
            Edit
          </Link>
        </Button>
      )}
      
      {canDelete && (
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      )}
    </div>
  )
}
```

### Subscription Tier Check
```tsx
import { useUser } from '@/hooks/use-user'

export function CreateEventButton() {
  const { profile } = useUser()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  
  const handleClick = () => {
    // Check if user is trying to create as organizer but doesn't have paid tier
    if (profile?.role === 'organizer' && profile?.subscription_tier !== 'pro') {
      setShowUpgradeModal(true)
      return
    }
    
    // Otherwise proceed to event creation
    router.push('/protected/events/create')
  }
  
  return (
    <>
      <Button onClick={handleClick}>
        Create Event
      </Button>
      
      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          feature="organizer"
        />
      )}
    </>
  )
}
```

## 🔄 Implementation Tasks

1. **Create Invited User Role**:
   ```sql
   -- Add invited_user to allowed roles
   ALTER TABLE public.profiles
   DROP CONSTRAINT profiles_role_check;
   
   ALTER TABLE public.profiles
   ADD CONSTRAINT profiles_role_check
   CHECK (role = ANY (ARRAY['super_admin', 'admin', 'organizer', 'event_host', 'invited_user', 'user', 'guest']));
   
   -- Add role to roles table
   INSERT INTO public.roles (name, description)
   VALUES ('invited_user', 'Invited attendee with QR code access');
   
   -- Define capabilities
   INSERT INTO public.role_capabilities (role, capability)
   VALUES 
     ('invited_user', 'view:events'),
     ('invited_user', 'view:event_photos'),
     ('invited_user', 'upload:event_photos');
   ```

2. **Update Event Host Permissions**:
   ```sql
   -- Remove delete capability from event_host
   DELETE FROM public.role_capabilities
   WHERE role = 'event_host' AND capability = 'delete:events';
   ```

3. **Update Organizer Subscription**:
   ```sql
   -- Update organizer to paid tier
   UPDATE public.profiles
   SET subscription_tier = 'pro'
   WHERE id IN (
     SELECT id FROM auth.users WHERE email = 'joel.yaffe+organizer@gmail.com'
   );
   ```

## 📊 Testing Matrix

| Test Case | super_admin | admin | organizer | event_host | user | guest |
|-----------|-------------|-------|-----------|------------|------|-------|
| View public event | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create event | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Edit own event | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete own event | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Edit any event | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Access admin | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Assign roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | 