# Token Management System Documentation

> **Version:** 0.1.0  
> **Date:** April 25, 2025  
> **Status:** Planned for Session 45-B

## Overview

The Token Management System (TMS) is a secure, resilient authentication mechanism to manage guest access tokens throughout the Cloud Burst platform. It addresses critical flaws in the previous magic link implementation with a focus on reliable token persistence, validation, and error handling.

## Background: Previous Implementation Issues

The initial magic link implementation experienced several critical issues:

1. **Authentication Context Loss**: Tokens were not reliably persisted across page navigation, causing users to lose access after clicking links or refreshing pages.

2. **Inconsistent Token Validation**: The validation mechanism produced unpredictable results, sometimes rejecting valid tokens.

3. **Poor Error Handling**: When token validation failed, users received generic errors without clear recovery steps.

4. **Overlapping Data Models**: Token management spanned multiple tables (`guests`, `event_attendees`, `profiles`) with inconsistent relationships.

5. **Security Vulnerabilities**: The implementation lacked proper token expiration and renewal mechanisms.

## System Architecture

The new token management system consists of several specialized components:

### 1. Core Components

| Component | File Path | Purpose |
|-----------|-----------|---------|
| Token Constants | `/src/lib/tokens/token-constants.ts` | Defines token types, errors, and validation parameters |
| Token Utilities | `/src/lib/tokens/token-utils.ts` | Implements token operations (generation, validation, storage) |
| Token Service | `/src/lib/tokens/token-service.ts` | Provides the main service interface for components |
| Token Context | `/src/lib/tokens/token-context.tsx` | React context provider for token state |

### 2. Database Schema

The token system uses the `auth_tokens` table with the following structure:

```sql
CREATE TABLE auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL, -- 'magic_link', 'dashboard_access', etc.
  metadata JSONB,
  consumed_at TIMESTAMPTZ,
  is_valid BOOLEAN DEFAULT true
);

-- Automatically expire tokens
CREATE EXTENSION IF NOT EXISTS pg_cron;
SELECT cron.schedule('cleanup-expired-tokens', '0 */1 * * *', 
  $$UPDATE auth_tokens SET is_valid = false WHERE expires_at < now()$$);
```

## Token Lifecycle

### 1. Token Generation

Tokens are created through the following process:

1. User requests magic link or guest dashboard access
2. System generates a cryptographically secure token (HMAC-SHA256)
3. Token is stored in the `auth_tokens` table with appropriate metadata
4. Email is sent containing the token link

```typescript
// Example token generation
const token = await TokenService.generateToken({
  email: user.email,
  type: TOKEN_TYPES.MAGIC_LINK,
  metadata: { eventId, guestId },
  expiresIn: TOKEN_EXPIRY.MAGIC_LINK // 24 hours
});
```

### 2. Token Storage

Tokens are stored using a multi-layered persistence strategy:

1. **Server-side**: Database storage in the `auth_tokens` table
2. **Client-side**: Redundant storage in:
   - HTTP-only cookies (primary)
   - localStorage (fallback #1)
   - sessionStorage (fallback #2)
   - React Context (in-memory)

This redundancy ensures token persistence across different scenarios (page navigation, refreshes, tab closures).

### 3. Token Validation

Validation follows a robust process:

1. Extract token from URL query parameter or storage mechanisms
2. Verify token existence in the database
3. Check token expiration and validity flags
4. Verify token ownership against provided metadata
5. Mark token as consumed (for single-use tokens)
6. Create or refresh session

### 4. Error Handling

The system implements comprehensive error handling:

| Error Type | Code | Handling Strategy |
|------------|------|-------------------|
| Token Missing | `TOKEN_ERROR.MISSING` | Prompt for re-authentication |
| Token Expired | `TOKEN_ERROR.EXPIRED` | Offer token renewal option |
| Token Invalid | `TOKEN_ERROR.INVALID` | Show clear error with recovery steps |
| Server Error | `TOKEN_ERROR.SERVER` | Retry with exponential backoff |

## Integration with Guest Flow

The token management system integrates with the existing guest flow:

1. **RSVP Submission**: After RSVP, generate dashboard access token
2. **Email Delivery**: Send guest email containing dashboard access link
3. **Dashboard Access**: Validate token on access attempt
4. **Session Persistence**: Maintain guest session across device usage
5. **Token Renewal**: Allow token renewal for returning guests

## Security Considerations

The system implements several security measures:

1. **Expiration**: All tokens have a defined expiry period
2. **Single-use option**: Tokens can be configured for one-time use
3. **Revocation**: Ability to revoke tokens server-side
4. **HMAC Signatures**: Cryptographically secure token generation
5. **Rate limiting**: Protection against brute force attempts
6. **HTTP-only cookies**: Primary storage mechanism for security

## Usage Examples

### 1. Generating a Magic Link

```typescript
// In API route handler
import { TokenService } from '@/lib/tokens/token-service';
import { TOKEN_TYPES } from '@/lib/tokens/token-constants';

export async function POST(req: Request) {
  const { email, eventId } = await req.json();
  
  // Find guest in database
  const guest = await getGuestByEmail(email, eventId);
  
  if (!guest) {
    return Response.json({ error: 'Guest not found' }, { status: 404 });
  }
  
  // Generate token
  const token = await TokenService.generateToken({
    email,
    guestId: guest.id,
    type: TOKEN_TYPES.MAGIC_LINK,
    metadata: { eventId },
    expiresIn: 60 * 60 * 24 // 24 hours
  });
  
  // Send email with link
  await sendGuestMagicLinkEmail(email, token, eventId);
  
  return Response.json({ success: true });
}
```

### 2. Validating a Magic Link

```typescript
// In client component
import { useTokenValidation } from '@/lib/tokens/token-hooks';

export function MagicLinkValidator() {
  const { isValidating, isValid, error, user } = useTokenValidation();
  
  if (isValidating) {
    return <LoadingSpinner />;
  }
  
  if (error) {
    return <TokenError error={error} />;
  }
  
  if (isValid) {
    return <Navigate to={`/guest/dashboard/${user.eventId}`} />;
  }
  
  return <AccessDenied />;
}
```

### 3. Accessing Protected Routes

```typescript
// In protected route component
import { useToken } from '@/lib/tokens/token-context';

export function GuestDashboard() {
  const { token, isAuthenticated, user } = useToken();
  
  if (!isAuthenticated) {
    return <Navigate to="/guest-access" />;
  }
  
  return (
    <DashboardLayout>
      <WelcomeHeader name={user.name} />
      <GuestContent eventId={user.eventId} />
    </DashboardLayout>
  );
}
```

## Testing Strategy

The token management system requires thorough testing:

1. **Unit Tests**: Individual token functions and utilities
2. **Integration Tests**: Token generation, storage, and validation flow
3. **End-to-End Tests**: Complete guest journey with token authentication
4. **Cross-Browser Testing**: Verify token persistence across browsers
5. **Error Scenario Testing**: Validate all error handling paths

## Deployment Considerations

When deploying the token management system:

1. Ensure database migrations for `auth_tokens` table are applied
2. Verify cron job for token cleanup is active
3. Configure appropriate token expiry times for each environment
4. Set up monitoring for token validation failures
5. Create documentation for troubleshooting token issues

## Future Enhancements

Planned enhancements for post-Beta release:

1. **Token analytics**: Track token usage patterns
2. **Progressive token expiry**: Step-down access model
3. **Device fingerprinting**: Enhanced security for token validation
4. **QR code tokens**: Generate scannable tokens for in-person events
5. **Offline token validation**: Support for limited offline functionality

## Related Documentation

- [Authentication Security Improvements](./auth-security-improvements.md)
- [Guest Journey Documentation](../user-flows/guest-journey.md)
- [Email Flow Documentation](./email_flow.md) 