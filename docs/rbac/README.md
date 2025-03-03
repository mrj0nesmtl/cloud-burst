# Role-Based Access Control (RBAC) System

## Overview

The Cloud Burst platform implements a comprehensive role-based access control (RBAC) system to manage user permissions and access to various features and resources. This document provides an overview of the RBAC implementation, including roles, capabilities, and how to use the permission system in the application.

## Roles

The system defines the following user roles:

| Role | Description | Subscription |
|------|-------------|-------------|
| `super_admin` | Full system access - internal use only | N/A |
| `admin` | Administrative access - internal use only | N/A |
| `organizer` | Event management access - can create and manage multiple events | Paid Only |
| `event_host` | Can create and manage their own events - cannot delete events | Free/Paid |
| `user` | Standard user with basic platform access | Free |
| `guest` | Public access - can view public events and galleries | Free |

## Database Schema

The RBAC system is implemented using the following database tables:

### `roles` Table

Stores the available roles in the system.

```sql
CREATE TABLE public.roles (
  name TEXT PRIMARY KEY,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### `role_capabilities` Table

Maps roles to their capabilities.

```sql
CREATE TABLE public.role_capabilities (
  role TEXT REFERENCES public.roles(name) ON DELETE CASCADE,
  capability TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (role, capability)
);
```

### `profiles` Table

User profiles with role and subscription information.

```sql
ALTER TABLE public.profiles 
ADD COLUMN role TEXT DEFAULT 'user',
ADD COLUMN subscription_tier TEXT DEFAULT 'free',
ADD COLUMN subscription_status TEXT DEFAULT 'active';

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_fkey
FOREIGN KEY (role) REFERENCES public.roles(name);

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_role_check
CHECK (role = ANY (ARRAY['super_admin', 'admin', 'organizer', 'event_host', 'user', 'guest']));
```

## Capabilities

Capabilities are defined as string values in the format `action:resource`. For example:

- `create:events` - Ability to create events
- `read:events` - Ability to view events
- `update:events` - Ability to update any event
- `update:own_events` - Ability to update only events created by the user
- `delete:events` - Ability to delete any event
- `delete:own_events` - Ability to delete only events created by the user

## Row-Level Security (RLS)

The system uses Supabase Row-Level Security policies to enforce permissions at the database level. For example:

```sql
-- Policy: Organizers can delete their own events
CREATE POLICY events_delete_own ON public.events
  FOR DELETE
  USING (
    organizer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'organizer')
    )
  );
```

## Frontend Implementation

### Permission Hook

The `usePermissions` hook provides functions to check user permissions:

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function EventPage() {
  const { can, hasRole, hasPaidSubscription } = usePermissions();
  
  // Check if user can delete an event
  const canDeleteEvent = can('delete', 'event', eventOrganizerId);
  
  // Check if user has admin role
  const isAdmin = hasRole(['super_admin', 'admin']);
  
  // Check if user has paid subscription
  const isPaidUser = hasPaidSubscription();
  
  // ...
}
```

### Permission Gate Component

The `PermissionGate` component conditionally renders content based on user permissions:

```tsx
import { PermissionGate } from '@/components/auth/permission-gate';

function EventActions({ eventId, organizerId }) {
  return (
    <div>
      {/* Only render delete button if user can delete this event */}
      <PermissionGate 
        action="delete" 
        resource="event" 
        ownerId={organizerId}
      >
        <Button onClick={handleDelete}>Delete</Button>
      </PermissionGate>
    </div>
  );
}
```

### Role Gate Component

The `RoleGate` component conditionally renders content based on user roles:

```tsx
import { RoleGate } from '@/components/auth/permission-gate';

function AdminLink() {
  return (
    <RoleGate roles={['super_admin', 'admin']}>
      <Link href="/protected/admin">Admin Dashboard</Link>
    </RoleGate>
  );
}
```

### Subscription Gate Component

The `SubscriptionGate` component conditionally renders content based on user subscription:

```tsx
import { SubscriptionGate } from '@/components/auth/permission-gate';

function PremiumFeature() {
  return (
    <SubscriptionGate fallback={<UpgradePrompt />}>
      <PremiumContent />
    </SubscriptionGate>
  );
}
```

## Middleware

The application uses Next.js middleware to protect routes based on user roles:

```tsx
// src/middleware.ts
export async function middleware(req: NextRequest) {
  // ...
  
  // Admin routes are only accessible by super_admin and admin
  if (isAdminRoute && !['super_admin', 'admin'].includes(role)) {
    url.pathname = '/protected/dashboard';
    return NextResponse.redirect(url);
  }
  
  // ...
}
```

## Testing

To test the RBAC system, you can use the following test users:

| Email | Password | Role | Subscription |
|-------|----------|------|-------------|
| joel.yaffe@gmail.com | password123 | super_admin | N/A |
| joel.yaffe+admin@gmail.com | password123 | admin | N/A |
| joel.yaffe+organizer@gmail.com | password123 | organizer | pro |
| joel.yaffe+eventhost@gmail.com | password123 | event_host | free |
| joel.yaffe+user@gmail.com | password123 | user | free |
| joel.yaffe+guest@gmail.com | password123 | guest | free |

## Implementation Tasks

1. Create the `invited_user` role
2. Update the organizer subscription tier to paid
3. Remove the delete capability from event hosts
4. Test all roles to ensure correct access

## Resources

- [Supabase Row-Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [React Hooks Documentation](https://reactjs.org/docs/hooks-intro.html) 