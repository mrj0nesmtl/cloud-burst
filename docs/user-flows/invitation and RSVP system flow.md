# Cloud Burst: Invitation & RSVP System Flow

```mermaid
flowchart TD
    subgraph "1. Invitation Creation"
        A[Event Organizer] -->|Creates invitation| B[Cloud Burst Platform]
        B -->|Generates| C[Invitation Record in Database]
        C -->|Contains| D[Unique invitation token]
        B -->|Prepares email using| E[SendGrid Template]
        E -->|Includes event details and RSVP link| F[SendGrid Email Service]
    end

    subgraph "2. Invitation Delivery"
        F -->|Sends invitation email| G[Guest's Email Inbox]
        G -->|Contains| H[Event details & RSVP button]
        H -->|Links to| I[RSVP URL with token]
    end
    
    subgraph "3. RSVP Verification Flow"
        J[Guest clicks RSVP link/button] -->|Request sent to| K[Cloud Burst API]
        K -->|Calls| L[/api/invitations/verify endpoint]
        L -->|Validates token| M{Is token valid?}
        M -->|No| N[Error: Invalid invitation]
        M -->|Yes| O[Updates invitation status to opened]
        O -->|Calls| P[Supabase Auth signInWithOtp]
        P -->|Sends| Q[Magic Link Email]
        Q -->|Using| R[Supabase Magic Link Template]
    end

    subgraph "4. Authentication Flow"
        S[Guest receives Magic Link email] -->|Clicks link| T[Supabase Auth Service]
        T -->|Creates/updates user with| U[User record with metadata]
        U -->|Contains| U1[invitation_id]
        U -->|Contains| U2[event_id]
        U -->|Contains| U3[name]
        U -->|Contains| U4[role: guest]
        T -->|Establishes| V[Authenticated session]
        V -->|Redirects to| W[Event RSVP form page]
    end

    subgraph "5. RSVP Submission"
        W -->|Guest fills form| X[RSVP Form with status & details]
        X -->|Submits| Y[/api/rsvp/submit endpoint]
        Y -->|Creates/updates| Z[RSVP record in database]
        Z -->|Links to| C
        Y -->|Updates| AA[Invitation record with RSVP status]
        Y -->|Returns| AB[Confirmation to user]
    end

    %% Connection lines between subgraphs
    I -.-> J
    R -.-> S
```

## How Our Two Email Systems Work Together

| System | Purpose | When Used | Email Content | User State |
|--------|---------|-----------|--------------|------------|
| **SendGrid** | Marketing & Invitations | Initial invitation | Event details, RSVP button, branding | No user account yet |
| **Supabase Auth** | Authentication | After RSVP link click | Magic Link for secure access | Creates/updates user account |

## Key Points About This Flow

1. **Two-Step Authentication**:
   - First step: Verify invitation token (proves they were invited)
   - Second step: Magic Link authentication (provides secure access)

2. **User Creation Timing**:
   - User profile is created only after Magic Link is clicked
   - Not when invitation is sent or RSVP button is clicked

3. **Role Assignment**:
   - The role "guest" is assigned during Magic Link authentication
   - Stored in Supabase user metadata

4. **RSVP Status Updates**:
   - Invitation status → "opened" when RSVP link is clicked
   - Invitation RSVP status → "accepted/declined" when form is submitted
   - Separate RSVP record created in database with details
