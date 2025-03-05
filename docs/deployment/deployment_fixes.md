# Cloud Burst Deployment Fixes

> **Version:** 0.7.0  
> **Last Updated:** March 2024  
> **Priority:** High

## Current Deployment Issues

We're currently facing three critical deployment issues that need to be resolved:

1. Dynamic server usage errors in pages using cookies and request.url
2. Prerendering failures for protected routes
3. Unsupported Server Component type errors

This document provides specific fixes for each issue.

## 1. Dynamic Server Usage Errors

### Problem

Pages using `cookies()` from 'next/headers' and `request.url` are causing dynamic server usage errors during build. This happens because these APIs require dynamic rendering, but our pages are being statically rendered by default.

### Files to Modify

1. **src/app/protected/dashboard/page.tsx**
2. **src/app/protected/admin/layout.tsx**
3. **src/app/protected/layout.tsx**
4. **src/app/lib/photos.server.ts**
5. **src/lib/event-customization-server.ts**
6. **src/app/lib/security-settings-server.ts**
7. Any other files using `cookies()` or `request.url`

### Fix

Add the following line at the top of each affected file:

```typescript
export const dynamic = 'force-dynamic';
```

Example:

```typescript
// src/app/protected/dashboard/page.tsx
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Add this line
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Dashboard | Cloud Burst',
  description: 'Manage your events and photos',
}

// Rest of the file...
```

## 2. Prerendering Failures for Protected Routes

### Problem

Protected routes that require authentication are failing during prerendering because they attempt to access authentication state that doesn't exist during build time.

### Files to Modify

1. **src/app/protected/layout.tsx**
2. **src/middleware.ts**
3. All protected route segments

### Fix

#### Step 1: Update Protected Route Segments

Add dynamic configuration to all protected route segments:

```typescript
// src/app/protected/layout.tsx
export const dynamic = 'force-dynamic';
```

#### Step 2: Update Middleware

Modify the middleware to handle build-time execution:

```typescript
// src/middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Skip middleware during static generation
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return NextResponse.next();
  }
  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // Rest of the middleware...
}
```

## 3. Server Component Type Errors

### Problem

Server components are causing type errors in production builds due to improper imports or component architecture.

### Areas to Fix

1. **Import Patterns**
2. **Type Definitions**
3. **Component Boundaries**

### Fix

#### Step 1: Fix Import Patterns

Ensure server components don't import client components:

```typescript
// Before (problematic)
import { ClientComponent } from '@/components/client-component'

// After (correct)
import dynamic from 'next/dynamic'
const ClientComponent = dynamic(() => import('@/components/client-component'), { ssr: false })
```

#### Step 2: Fix Type Definitions

Move shared types to separate files:

```typescript
// src/types/shared.ts
export interface SharedType {
  // Type definition
}

// In server component
import type { SharedType } from '@/types/shared'
```

#### Step 3: Implement Proper Component Boundaries

Create clear boundaries between server and client components:

```typescript
// Server component
export default async function ServerComponent() {
  // Fetch data
  const data = await fetchData()
  
  // Pass data to client component
  return <ClientComponentWrapper data={data} />
}

// Client component wrapper (separate file with 'use client' directive)
'use client'
export function ClientComponentWrapper({ data }) {
  // Client-side logic
  return <div>{/* Render data */}</div>
}
```

## Implementation Steps

1. **Fix Dynamic Server Usage**
   - Identify all pages using cookies() and request.url
   - Add dynamic export to these pages
   - Test locally to ensure they work correctly

2. **Fix Prerendering Issues**
   - Update protected route segments with dynamic configuration
   - Modify middleware to handle build-time execution
   - Test authentication flow locally

3. **Fix Server Component Type Errors**
   - Audit server components for improper imports
   - Fix type definitions and component boundaries
   - Test component rendering locally

4. **Deployment Testing**
   - Deploy to Replit with fixes
   - Monitor build logs for errors
   - Test all functionality in production environment

## Verification Checklist

- [ ] All pages load without errors
- [ ] Authentication flow works correctly
- [ ] Protected routes are accessible after login
- [ ] Admin routes are restricted to admin users
- [ ] Server components render correctly
- [ ] Client components function properly
- [ ] No type errors in production build

---

*For questions or support, please contact the Cloud Burst development team.* 