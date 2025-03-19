# Permissions Analysis - Navigation Issue Investigation

> **Date:** March 18, 2024  
> **Issue:** Navigation to `/protected/events/manage` failing with 403 errors  
> **Status:** Under Investigation  
> **Priority:** High

## Current Implementation Analysis

### 1. Permission Structure

#### Role Hierarchy
```typescript
type UserRole = 'super_admin' | 'admin' | 'organizer' | 'event_host' | 'user' | 'guest'
```

#### Caching Strategy
- Capabilities are cached for 1 hour to reduce API calls
- Cache structure:
```typescript
const capabilitiesCache: Record<string, {
  data: string[],
  timestamp: number
}> = {}
```

### 2. Role Capabilities

#### Fallback Capabilities by Role
```typescript
{
  'super_admin': ['manage:all'],
  'admin': ['manage:events', 'manage:users', 'view:analytics'],
  'organizer': [
    'create:events',
    'manage:own_events',
    'manage:photos',
    'view:event_analytics'
  ],
  'event_host': [
    'create:events',
    'manage:own_events',
    'invite:guests'
  ],
  'user': [
    'view:events',
    'manage:own_profile',
    'upload:photos'
  ],
  'guest': ['view:public_events']
}
```

### 3. Middleware Protection

#### Route Protection Rules
```typescript
// Admin routes
const isAdminRoute = path.startsWith('/protected/admin/')
if (isAdminRoute && !['super_admin', 'admin'].includes(userRole)) {
  url.pathname = '/protected/dashboard'
  return NextResponse.redirect(url)
}

// Event routes
const isEventRoute = path.startsWith('/protected/events/')
if (isEventRoute && !['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole)) {
  url.pathname = '/protected/dashboard'
  return NextResponse.redirect(url)
}
```

#### Authentication Retry Mechanism
- Maximum 3 retry attempts
- Retry count tracked via `x-auth-retry-count` header
- Resets on successful authentication

## Identified Issues

### 1. Role Source Inconsistency
- Middleware uses: `user.user_metadata?.role`
- Permissions hook uses: `profile?.role`
- Potential for mismatch between sources

### 2. Cache Management
- 1-hour cache duration may be too long
- No cache invalidation on role changes
- No distributed cache consideration for multi-tab scenarios

### 3. Error Handling
- 403 errors indicate middleware blocking
- UI still shows links despite lack of access
- Insufficient error logging for debugging

### 4. Navigation Flow
- Client-side navigation attempts failing
- No user feedback on permission denial
- Potential race condition between auth check and navigation

## Debugging Strategy

### 1. Role Verification
```typescript
// Add to middleware
console.log({
  sessionRole: session.user.user_metadata?.role,
  path: req.nextUrl.pathname,
  isEventRoute: path.startsWith('/protected/events/'),
  hasAccess: ['super_admin', 'admin', 'organizer', 'event_host'].includes(userRole)
})

// Add to permissions hook
console.log({
  profileRole: profile?.role,
  capabilities,
  hasEventAccess: hasCapability('manage:own_events')
})
```

### 2. Route Analysis
```typescript
// Middleware logging
console.log({
  path,
  isProtectedRoute,
  isEventRoute,
  isAdminRoute,
  userRole,
  metadata: session.user.user_metadata
})
```

### 3. Capability Verification
```typescript
// Add to usePermissions hook
console.log({
  requestedCapability: 'manage:own_events',
  userCapabilities: capabilities,
  hasAccess: hasCapability('manage:own_events'),
  role: profile?.role
})
```

## Proposed Solutions

### 1. Role Management
```typescript
// Single source of truth for roles
const getUserRole = async (userId: string): Promise<UserRole> => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()
  
  return profile?.role || 'guest'
}
```

### 2. Enhanced Error Handling
```typescript
// Middleware enhancement
if (isEventRoute && !hasAccess) {
  console.warn({
    type: 'access_denied',
    path,
    userRole,
    requiredRoles: ['super_admin', 'admin', 'organizer', 'event_host'],
    userId: session.user.id
  })
  
  return new NextResponse(
    JSON.stringify({
      error: 'access_denied',
      message: 'Insufficient permissions'
    }),
    { status: 403 }
  )
}
```

### 3. Improved Cache Management
```typescript
// Add version tracking to cache
const capabilitiesCache: Record<string, {
  data: string[],
  timestamp: number,
  version: number
}> = {}

// Invalidate cache on role changes
const invalidateCapabilitiesCache = (userId: string) => {
  Object.keys(capabilitiesCache).forEach(key => {
    if (key.startsWith(userId)) {
      delete capabilitiesCache[key]
    }
  })
}
```

## Discussion Points for Tomorrow

### 1. Role Management
- [ ] Decide on single source of truth for roles
- [ ] Review role synchronization strategy
- [ ] Consider real-time role updates

### 2. Permission Granularity
- [ ] Review current role-based access control
- [ ] Consider adding capability-based checks
- [ ] Discuss resource-level permissions

### 3. Error Handling
- [ ] Improve error messages and logging
- [ ] Add user feedback for permission issues
- [ ] Implement graceful fallbacks

### 4. Caching Strategy
- [ ] Review cache duration
- [ ] Implement cache invalidation
- [ ] Consider distributed caching

### 5. UI/UX Improvements
- [ ] Hide unauthorized navigation items
- [ ] Add permission-aware components
- [ ] Improve error messaging

## Next Steps

1. **Immediate Actions**
   - [ ] Add comprehensive logging
   - [ ] Verify role consistency
   - [ ] Test navigation flow

2. **Short-term Fixes**
   - [ ] Align role sources
   - [ ] Improve error handling
   - [ ] Update cache management

3. **Long-term Improvements**
   - [ ] Implement capability-based access control
   - [ ] Add real-time role updates
   - [ ] Enhance permission management UI

## References

- [Next.js Middleware Documentation](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Role-Based Access Control Best Practices](https://auth0.com/blog/role-based-access-control-rbac-and-react-apps/) 