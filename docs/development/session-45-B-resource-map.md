# Session 45-B Resource Map: Token Management System & Email Flow

> **Version:** 0.9.7  
> **Date:** April 26-28, 2025  
> **Focus:** Authentication & Email Flow Critical Fixes

## Overview
This resource map identifies the key files and directories we'll be focusing on during Session 45-B. It's organized by our two main focus areas: Token Management System Implementation and Email Flow Correction.

## Core Files Requiring Attention

### Token Management System Implementation
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Token Constants | `/src/lib/tokens/token-constants.ts` | Define token types and parameters | 🟣 To be created |
| Token Utilities | `/src/lib/tokens/token-utils.ts` | Core token operations | 🟣 To be created |
| Token Service | `/src/lib/tokens/token-service.ts` | Main service interface | 🟣 To be created |
| Token Context | `/src/lib/tokens/token-context.tsx` | React context provider | 🟡 Needs review |
| Token Hooks | `/src/lib/tokens/use-token.ts` | Custom hooks for token access | 🟣 To be created |
| Token Documentation | `/docs/development/token_management_system.md` | System documentation | 🟣 To be created |

### Email Flow Correction
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| RSVP Submit Handler | `/src/app/api/rsvp/submit/route.ts` | Processes RSVP submissions | 🔴 Triggering wrong emails |
| Guest Email Service | `/src/lib/email/guest-emails.ts` | Guest email template selection | 🔴 Template confusion |
| Auth Handler | `/src/lib/supabase/auth.ts` | Authentication logic | 🔴 Role confusion |
| Role Utilities | `/src/lib/utils/role-utils.ts` | Role checking utilities | 🟡 Needs enhancement |
| Email Templates | `/src/app/api/templates/sync/route.ts` | Email template syncing | 🟡 Needs review |
| Email Flow Docs | `/docs/development/email_flow.md` | Flow documentation | 🟣 To be created |

### Integration Points
| Component | File Path | Purpose | Status |
|-----------|-----------|---------|--------|
| Guest Profile | `/src/components/guest/GuestProfileForm.tsx` | Profile form using token | 🟡 Needs integration |
| Guest Dashboard | `/src/app/guest/dashboard/page.tsx` | Dashboard using token auth | 🟡 Needs integration |
| Camera Interface | `/src/app/guest/camera/page.tsx` | Camera using token auth | 🟡 Needs integration |
| Gallery View | `/src/app/guest/gallery/page.tsx` | Gallery using token auth | 🟡 Needs integration |
| Invitation Route | `/src/app/invitation/[token]/page.tsx` | Invitation using new token | 🟡 Needs integration |
| RSVP Form | `/src/components/rsvp/RsvpForm.tsx` | RSVP form with fixed email | 🟡 Needs integration |

## Token Management System Architecture

### Core Token Service
```typescript
// /src/lib/tokens/token-service.ts
export interface TokenService {
  getToken(): string | null;
  setToken(token: string): void;
  clearToken(): void;
  validateToken(token: string): boolean;
  refreshToken(): Promise<string | null>;
  getTokenFromMultipleSources(): string | null;
}
```

### Token Storage Strategy
The new token management system will implement a redundant storage strategy:

1. **Primary Storage**: HTTP-only cookies (secure)
2. **Secondary Storage**: LocalStorage (less secure, but persistent)
3. **Tertiary Storage**: React Context (in-memory, navigation-persistent)
4. **URL Parameters**: For initial token acquisition

This multi-layered approach ensures token persistence across various scenarios, including page reloads, navigation events, and browser sessions.

### Token Format & Validation
```
inv_[32-character-uuid]  // Invitation tokens
gst_[32-character-uuid]  // Guest access tokens
```

All tokens will be validated against expected formats, expiration times, and database records before granting access to protected resources.

## Email Flow Architecture

### Template Selection Logic
```typescript
// Conceptual logic for template selection
function selectEmailTemplate(user: User, action: EmailAction): EmailTemplate {
  // Check user role first
  if (user.role === 'guest') {
    // Guest-specific templates based on action
    switch (action) {
      case 'invitation': return templates.GUEST_INVITATION;
      case 'rsvp_confirmation': return templates.GUEST_RSVP_CONFIRMATION;
      case 'profile_created': return templates.GUEST_PROFILE_CREATED;
      // ...other guest actions
    }
  } else if (user.role === 'organizer') {
    // Organizer-specific templates
    // ...
  }
  
  // Fallback to default templates
  return templates.DEFAULT;
}
```

### RSVP Submit Flow
The RSVP submission process will be modified to explicitly check user roles and select appropriate email templates, preventing the current issue where guests inadvertently receive organizer invitation emails.

## Legend
- ✅ Working as expected / Ready for testing
- 🟡 Requires review / Potential issues
- 🔴 Not working / Critical issue
- 🟣 New file to be created

## Affected User Flows

### Guest Authentication Flow
```
Invitation Link → Validate Token → Store Token → RSVP → Profile Setup → Dashboard Access
```

### Token Persistence Flow
```
Receive Token → Store in Cookie → Store in LocalStorage → Store in Context → Use for API Calls → Refresh if Needed
```

### Email Selection Flow
```
User Action → Check User Role → Select Appropriate Template → Send Email → Track Delivery
```

## Testing Resources

### Test Accounts
- Super Admin: admin@cloudburst.test (password in secure note)
- Organizer: organizer@cloudburst.test (password in secure note)
- Event Staff: staff@cloudburst.test (password in secure note)
- Photographer: photographer@cloudburst.test (password in secure note)
- Standard User: user@cloudburst.test (password in secure note)

### Test Events & Tokens
```
- Test Event: 'Annual Company Retreat 2025' (ID: 607c49df-223f-465f-a4f9-03306658bf9f)
- Valid Invitation Token: inv_8ff2ee78-9ab1-4def-8123-456789abcdef
- Valid Guest Token: gst_5a7b9c3d-1e2f-3a4b-5c6d-7e8f9a0b1c2d
- Expired Token: inv_expired-9ab1-4def-8123-456789abcdef
- Invalid Format Token: invalid_token_format
```

## Documentation Resources

### Key Documentation Files
```
/docs/development/token_management_system.md  # To be created
/docs/development/email_flow.md              # To be created
/docs/troubleshooting/auth-issues.md        # To be updated
/docs/user-flows/guest-journey.md           # To be updated
```

### Technical References
- [JWT Best Practices](https://auth0.com/blog/jwt-security-101/)
- [HTTP-Only Cookies](https://owasp.org/www-community/HttpOnly)
- [React Context API](https://reactjs.org/docs/context.html)
- [Next.js Middleware](https://nextjs.org/docs/advanced-features/middleware)
- [Supabase Auth](https://supabase.io/docs/guides/auth)
- [SendGrid Templates](https://docs.sendgrid.com/ui/sending-email/create-and-edit-transactional-templates)

## Additional Notes

### Security Considerations
- All tokens should be generated with sufficient entropy
- Implement proper CSRF protection
- Use HTTP-only cookies where possible
- Establish appropriate token expiration times
- Implement token rotation for long-lived sessions
- Ensure tokens are invalidated on logout or password change
- Add rate limiting to token-related endpoints

### Performance Considerations
- Cache token validation results where appropriate
- Minimize token size for reduced payload
- Implement efficient token parsing algorithms
- Use appropriate indexing for token lookups in database

### User Experience Considerations
- Provide clear error messages for token failures
- Implement graceful redirection for expired tokens
- Add user-friendly token renewal prompts
- Ensure smooth transition between authenticated states
- Provide visual feedback during authentication processes 