# Authentication System Debug Document

## Current State Analysis
Last Updated: 2024-02-19

### 1. Structural Issues

#### File Structure Conflicts
```
src/
├── lib/
│   ├── auth/
│   │   ├── auth-store.ts       # Potential conflict: Multiple session handlers
│   │   └── session.ts          # Potential conflict: Duplicate session logic
│   └── supabase/
│       ├── config.ts           # Issue: Duplicate client creation
│       └── server-config.ts     # Issue: Contains competing client methods
```

#### Component Duplication
```
src/components/auth/
├── auth-debug.tsx
├── email-auth-form.tsx         # Conflict with login-form.tsx
├── login-form.tsx             # Duplicate functionality
├── role-guard.tsx
└── social-auth-buttons.tsx
```

### 2. Identified Problems

#### Authentication Flow Issues
- Window/localStorage SSR conflicts
- Supabase client initialization problems
- Session management inconsistencies
- RLS policy configuration missing
- Connection testing failures

#### Type Safety Concerns
- Inconsistent typing across auth components
- Missing type definitions for auth store
- Improper error handling types

### 3. Current Configuration State

#### Environment Variables
```typescript
{
  "required": [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "SUPABASE_SERVICE_ROLE_KEY"
  ]
}
```

#### Supabase Auth Settings
```typescript
{
  auth: {
    flowType: 'pkce',
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'sb-auth-token',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined
  }
}
```

### 4. Required Fixes

#### 1. Configuration Consolidation
- [ ] Merge duplicate client creation methods
- [ ] Establish single source of truth for auth state
- [ ] Standardize session management

#### 2. Component Restructure
- [ ] Choose between login-form and email-auth-form
- [ ] Implement proper component hierarchy
- [ ] Add proper error boundaries

#### 3. Security Implementation
- [ ] Configure RLS policies
- [ ] Implement proper session handling
- [ ] Add request logging for debugging

### 5. Proposed New Structure

```typescript
src/
├── lib/
│   └── supabase/
│       ├── auth.ts           # Combined auth utilities
│       ├── client.ts         # Browser client
│       └── server.ts         # Server client
├── components/
│   └── auth/
│       ├── forms/
│       │   ├── login.tsx
│       │   └── register.tsx
│       └── providers/
│           └── auth-provider.tsx
```

### 6. Debug Steps

1. **Audit Current State**
   - [ ] Review all auth-related files
   - [ ] Document current auth flow
   - [ ] Identify all entry points

2. **Clean Up Structure**
   - [ ] Remove duplicate files
   - [ ] Consolidate auth logic
   - [ ] Update import paths

3. **Implement Core Auth**
   - [ ] Configure base Supabase client
   - [ ] Set up RLS policies
   - [ ] Implement session management

4. **Testing Plan**
   - [ ] Test auth flow end-to-end
   - [ ] Verify session persistence
   - [ ] Check role-based access

### 7. Current Auth Store Issues

```typescript
interface AuthState {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
}
```

Problems:
1. Multiple sources of truth
2. Inconsistent error handling
3. Missing type safety
4. Improper initialization flow

### 8. Required RLS Policies

```sql
-- Sessions Table
ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

-- Refresh Tokens Table
ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- Required Policies
CREATE POLICY "Enable read access for users" ON auth.sessions
    FOR SELECT USING ((auth.uid())::text = user_id::text);
```

### 9. Next Steps

1. Create new session focused solely on auth debugging
2. Implement fixes in priority order:
   - Core client configuration
   - Session management
   - RLS policies
   - Component restructure

### 10. Known Bugs

1. `TypeError: Cannot read properties of null (reading 'from')`
   - Location: `src/components/auth/email-auth-form.tsx`
   - Cause: Supabase client initialization timing
   - Status: Needs immediate fix

2. `ReferenceError: window is not defined`
   - Location: Multiple components
   - Cause: SSR conflicts
   - Status: Needs architectural solution

---

**Note**: This document should be updated as debugging progresses and new issues are discovered. 