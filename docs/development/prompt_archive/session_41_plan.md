# Session 41 Implementation Plan

## Problem Analysis

Based on our investigation, we've identified the following key issues:

1. **RSVP Database Logging**
   - RSVPs are not being properly recorded in the database when guests confirm attendance
   - The invitation confirmation page does not actually create any database entries

2. **Token Persistence**
   - Invitation tokens are not being preserved throughout the guest journey
   - Token validation is inconsistent
   - Token is not properly passed between different pages

3. **Navigation Flow**
   - After completing profile setup, users are not properly navigated to the guest dashboard
   - No clear end-to-end flow from RSVP to dashboard

## Implementation Steps

### 1. Create Token Management Service (High Priority)

**Goal**: Create a robust service to manage invitation tokens throughout the user journey

- [ ] Create a new token utility at `src/lib/tokens/invitation-token.ts`
- [ ] Implement functions to:
  - Store tokens in localStorage/cookies
  - Retrieve tokens from multiple sources (URL, storage, etc.)
  - Validate tokens against the database
  - Generate new tokens when needed
- [ ] Add client-side wrapper for easy token access

```typescript
// Sample implementation
export const invitationTokenService = {
  // Store token in localStorage and cookies for redundancy
  storeToken: (token: string) => {
    localStorage.setItem('invitation_token', token);
    // Also set in cookie for server components
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
    // ...
    
    return null;
  },
  
  // Validate token with Supabase
  validateToken: async (token: string) => {
    // Query Supabase to check token is valid
  }
};
```

### 2. Fix RSVP Database Operations (Highest Priority)

**Goal**: Ensure RSVPs are properly recorded in the database when guests confirm attendance

- [ ] Debug and fix the RSVP confirmation process in `src/app/event/[slug]/confirmed/page.tsx`
- [ ] Create proper database operations in the confirmation page
- [ ] Add logging to track the RSVP creation process

```typescript
// Sample implementation for RSVP creation
async function createRsvpRecord(eventId: string, token: string) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
    // First get the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, email, name')
      .eq('token', token)
      .single();
      
    if (invitationError || !invitation) {
      console.error('Invalid invitation token:', invitationError);
      return { success: false, error: 'Invalid invitation token' };
    }
    
    // Then create the RSVP record
    const { data: rsvp, error: rsvpError } = await supabase
      .from('rsvps')
      .upsert({
        invitation_id: invitation.id,
        status: 'accepted',
        guest_count: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (rsvpError) {
      console.error('Failed to create RSVP record:', rsvpError);
      return { success: false, error: 'Failed to create RSVP record' };
    }
    
    // Update invitation status
    await supabase
      .from('invitations')
      .update({ 
        status: 'used',
        rsvp_status: 'accepted',
        rsvp_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);
      
    // Track analytics event
    await supabase
      .from('analytics_events')
      .insert({
        type: 'rsvp_response',
        invitation_id: invitation.id,
        properties: {
          status: 'accepted',
          timestamp: new Date().toISOString(),
          source: 'web',
          guestCount: 1
        }
      });
    
    return { success: true, rsvp };
  } catch (error) {
    console.error('Error in createRsvpRecord:', error);
    return { success: false, error: 'Failed to create RSVP record' };
  }
}
```

### 3. Fix Profile Page Token Handling (High Priority)

**Goal**: Ensure the profile page properly receives and uses the invitation token

- [ ] Update `src/app/guest/profile/page.tsx` to use the token management service
- [ ] Add better error handling for missing tokens
- [ ] Ensure the token is preserved when navigating between tabs
- [ ] Implement a form to request a token if one isn't available

```typescript
// Example updates to profile page
useEffect(() => {
  const loadGuestData = async () => {
    setIsLoading(true);
    setError(null);
    
    // Get token from URL or storage
    const token = invitationTokenService.getToken();
    
    if (token) {
      // Store token for future use
      invitationTokenService.storeToken(token);
      
      // Load data using token
      const result = await getGuestDataByToken(token);
      
      if (!result) {
        setError('Could not load profile data. Please check your invitation link.');
      }
    } else if (eventId) {
      // Fallback to eventId if available
      const result = await getGuestDataByEventId(eventId);
      
      if (!result) {
        setError('Could not find your invitation. Please check the event ID or get a new invitation.');
      }
    } else {
      setError('No invitation token or event ID provided. Please check your invitation link.');
    }
    
    setIsLoading(false);
  };
  
  loadGuestData();
}, []);
```

### 4. Implement Navigation to Guest Dashboard (Medium Priority)

**Goal**: Create a seamless flow from profile setup to guest dashboard

- [ ] Create new `/src/app/guest/dashboard/page.tsx` if it doesn't exist
- [ ] Update the profile submission to properly navigate to the dashboard
- [ ] Pass necessary context (event, token) to the dashboard
- [ ] Add authentication check on the dashboard page

```typescript
// In profile submission handler
const onSubmit = async (values: GuestProfileFormValues) => {
  try {
    setIsSubmitting(true);
    
    // Save profile data...
    
    // Navigate to dashboard with token
    const token = invitationTokenService.getToken();
    router.push(`/guest/dashboard?token=${token}&event=${event.id}`);
    
  } catch (error) {
    console.error('Error saving profile:', error);
    toast({
      title: 'Error',
      description: 'Failed to save your profile. Please try again.',
      variant: 'destructive',
    });
  } finally {
    setIsSubmitting(false);
  }
};
```

### 5. Create Enhanced Invitation System (Medium Priority)

**Goal**: Build a more robust invitation system with improved token handling

- [ ] Create or update the invitation creation form
- [ ] Implement improved token generation and validation
- [ ] Add tracking and analytics for invitations
- [ ] Create proper messaging for different invitation states

### 6. Integration Testing (Low Priority)

**Goal**: Verify the entire flow works end-to-end

- [ ] Create test cases for the complete guest journey
- [ ] Test on multiple devices and browsers
- [ ] Test with different edge cases (expired tokens, missing tokens, etc.)

## Database Fixes

### 1. RSVP Table Operations

- [ ] Ensure proper relationships between `rsvps` and `invitations` tables
- [ ] Add missing indexes for RSVP queries
- [ ] Update RLS policies to ensure proper access

### 2. Event Counter Updates

- [ ] Fix event attendee counting to include RSVPs
- [ ] Update dashboard statistics to reflect RSVPs

## Implementation Schedule

### Day 1: Token Management and RSVP Fixes
- Create token management service
- Fix RSVP database operations
- Add logging for debugging

### Day 2: Profile and Navigation
- Update profile page to use token service
- Implement proper navigation to dashboard
- Fix token persistence issues

### Day 3: Invitation System and Testing
- Create enhanced invitation system
- Implement comprehensive testing
- Fix any remaining issues

## Success Criteria

1. Guest can RSVP and see confirmation
2. RSVP is properly recorded in database
3. Guest can complete profile with token preserved
4. Guest is properly navigated to dashboard
5. Dashboard shows proper event context
6. Analytics properly track the guest journey 