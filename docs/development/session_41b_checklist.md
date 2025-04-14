# Session 41-B Checklist
# April 15, 2025
# V 0.9.2 → 0.9.3
# Session 41-B - Token Management & Navigation Flow

## Timeline
- Session Start: April 15, 1:00 PM, 2025
- Session Completion Target: April 16, 1:00 AM, 2025
- Documentation: Concurrent with development
- Status: In Progress (15%)

## Completed Tasks
- [x] **Code Quality Improvements**
  - [x] Fixed TypeScript errors in create-invitation-form toast implementation
  - [x] Removed incompatible ID property from toast calls
  - [x] Updated toast usage to align with the API design
  - [x] Simplified toast notification management
  - [x] Improved error handling for notification feedback
  - [x] Successfully deployed with fixes confirmed in production

## Critical Priorities (MUST REVIEW AND FIX)
- [ ] **Token Management Service**
  - [ ] Create token management utility at `src/lib/tokens/invitation-token.ts`
  - [ ] Implement token storage in localStorage/cookies
  - [ ] Add token retrieval from multiple sources (URL, storage)
  - [ ] Implement token validation against database
  - [ ] Add proper error handling for missing/invalid tokens
  - [ ] Create fallback mechanisms for token recovery

- [ ] **Navigation Flow**
  - [ ] Fix navigation to guest dashboard after profile setup
  - [ ] Ensure token persistence throughout the guest journey
  - [ ] Implement proper state transfer between pages
  - [ ] Add loading states during navigation
  - [ ] Create seamless end-to-end user journey

## High Priority Tasks
- [ ] **Profile Page Enhancement**
  - [ ] Update to use token management service
  - [ ] Improve error handling for missing tokens
  - [ ] Add fallback form for token request if missing
  - [ ] Fix avatar upload with token context
  - [ ] Enhance form submission with proper state transition

- [ ] **Guest Dashboard Implementation**
  - [ ] Create or enhance dashboard landing page
  - [ ] Implement token-based authentication check
  - [ ] Display event context and details
  - [ ] Add navigation to gallery and camera features
  - [ ] Show personalized welcome message

## Medium Priority Tasks
- [ ] **Token Persistence Testing**
  - [ ] Test token persistence across page refreshes
  - [ ] Validate token storage in various browsers
  - [ ] Test token recovery mechanisms
  - [ ] Verify error handling for invalid tokens
  - [ ] Create integration tests for token flow

- [ ] **End-to-End Flow Testing**
  - [ ] Test complete flow from RSVP to dashboard
  - [ ] Verify profile data persistence
  - [ ] Test camera functionality with token auth
  - [ ] Validate gallery access with token
  - [ ] Document test results and edge cases

## Implementation Details

### 1. Token Management Service
```typescript
// src/lib/tokens/invitation-token.ts
export const invitationTokenService = {
  // Store token in localStorage and cookies for redundancy
  storeToken: (token: string) => {
    localStorage.setItem('invitation_token', token);
    // Also set cookie for server components
    document.cookie = `invitation_token=${token}; path=/; max-age=604800; SameSite=Lax`;
  },
  
  // Get token from multiple sources
  getToken: () => {
    // Check URL params first
    const urlToken = new URLSearchParams(window.location.search).get('token');
    if (urlToken) return urlToken;
    
    // Then localStorage
    const storedToken = localStorage.getItem('invitation_token');
    if (storedToken) return storedToken;
    
    // Then cookies
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('invitation_token='));
    if (tokenCookie) {
      return tokenCookie.split('=')[1];
    }
    
    return null;
  },
  
  // Validate token with Supabase
  validateToken: async (token: string) => {
    // Implementation will query Supabase
  },
  
  // Clear token (for logout/reset)
  clearToken: () => {
    localStorage.removeItem('invitation_token');
    document.cookie = 'invitation_token=; path=/; max-age=0';
  }
};
```

### 2. Profile Page Token Handling
```typescript
// src/app/guest/profile/page.tsx
useEffect(() => {
  const loadGuestData = async () => {
    setIsLoading(true);
    setError(null);
    
    // Get token from service
    const token = invitationTokenService.getToken();
    
    if (token) {
      // Store token for future use
      invitationTokenService.storeToken(token);
      
      // Validate token
      const isValid = await invitationTokenService.validateToken(token);
      
      if (!isValid) {
        setError('Invalid invitation token. Please check your invitation link.');
        return;
      }
      
      // Load guest data
      const result = await loadGuestDataByToken(token);
      if (!result.success) {
        setError(result.error || 'Failed to load guest data');
      } else {
        setFormData(result.data);
      }
    } else {
      setError('No invitation token found. Please use the link from your invitation email.');
      setShowTokenRequest(true);
    }
    
    setIsLoading(false);
  };
  
  loadGuestData();
}, []);
```

### 3. Navigation to Dashboard
```typescript
// In profile submission handler
const onSubmit = async (values: GuestProfileFormValues) => {
  try {
    setIsSubmitting(true);
    
    // Save profile data
    const token = invitationTokenService.getToken();
    const result = await saveGuestProfile(values, token);
    
    if (!result.success) {
      toast({
        title: 'Error',
        description: result.error || 'Failed to save profile',
        variant: 'destructive',
      });
      return;
    }
    
    // Navigate to dashboard with token
    router.push(`/guest/dashboard?token=${token}`);
  } catch (error) {
    console.error('Profile submission error:', error);
    toast({
      title: 'Error',
      description: 'An unexpected error occurred',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

## Success Criteria
- Token management service works correctly across browsers
- Profile page properly handles tokens and loads guest data
- Seamless navigation from profile to dashboard
- Dashboard displays personalized content based on token
- End-to-end flow from RSVP to dashboard works flawlessly
- Error states are handled gracefully with helpful messages

## Key Files to Modify
- `src/lib/tokens/invitation-token.ts` - Create token management service
- `src/app/guest/profile/page.tsx` - Update with token handling
- `src/app/guest/dashboard/page.tsx` - Enhance with token authentication
- `src/components/guest/GuestProfileForm.tsx` - Update form submission
- `src/lib/supabase/guests.ts` - Update guest data operations
- `src/lib/supabase/invitations.ts` - Enhance invitation validation

## Testing Notes
- Test with Safari, Chrome, and Firefox to ensure cross-browser compatibility
- Verify token retrieval in private browsing mode
- Test edge cases like expired tokens, invalid tokens, and missing tokens
- Verify that error handling provides clear guidance to users
- Document any browser-specific behaviors for future reference 