# Session 35: Resources & References

## 🗂️ Relevant Directory Structures

### RSVP & Invitation Related Components

```
src/
├── app/
│   ├── invitation/
│   │   ├── [token]/
│   │   │   ├── page.tsx                    # Invitation landing page
│   │   │   ├── confirmation/
│   │   │   │   ├── [status]/
│   │   │   │   │   ├── page.tsx            # RSVP confirmation page
│   │   │   ├── loading.tsx                 # Loading state for invitation page
│   │   │   └── error.tsx                   # Error state for invalid tokens
│   │   └── layout.tsx                      # Layout for invitation routes
│   └── api/
│       ├── rsvp/
│       │   ├── submit/
│       │   │   └── route.ts                # RSVP submission endpoint
│       │   ├── [token]/
│       │   │   ├── status/
│       │   │   │   └── route.ts            # RSVP status check/update
│       │   │   └── route.ts                # RSVP details endpoint
│       │   └── validate/
│       │       └── route.ts                # Token validation endpoint
│       └── invitation/
│           └── [id]/
│               └── route.ts                # Invitation details endpoint
├── components/
│   ├── invitation/
│   │   ├── event-preview.tsx               # Event preview for invitation page
│   │   ├── invitation-header.tsx           # Header for invitation page
│   │   ├── rsvp-form.tsx                   # RSVP form component
│   │   ├── plus-one-form.tsx               # Plus-one details form
│   │   ├── dietary-restrictions.tsx        # Dietary restrictions input
│   │   ├── confirmation-card.tsx           # RSVP confirmation display
│   │   └── qr-scanner.tsx                  # QR code scanner component
│   └── camera/
│       ├── camera-capture.tsx              # Camera capture component
│       ├── camera-permission.tsx           # Camera permission handling
│       └── capture-button.tsx              # Photo capture button
├── hooks/
│   ├── useCamera.ts                        # Camera access hook
│   ├── useRsvp.ts                          # RSVP form submission hook
│   ├── useInvitation.ts                    # Invitation data fetching hook
│   └── useQrScanner.ts                     # QR code scanning hook
├── lib/
│   ├── validation/
│   │   └── rsvp-schema.ts                  # Zod schema for RSVP form
│   └── utils/
│       ├── invitation-helpers.ts           # Helper functions for invitations
│       ├── camera-helpers.ts               # Camera utility functions
│       └── token-validation.ts             # Token validation utilities
└── types/
    ├── invitation.ts                       # Invitation type definitions
    ├── rsvp.ts                             # RSVP type definitions
    └── camera.ts                           # Camera-related type definitions
```

### Email Templates & Notification Components

```
src/
├── emails/
│   ├── rsvp-confirmation.tsx               # RSVP confirmation email template
│   ├── rsvp-reminder.tsx                   # RSVP reminder email template
│   └── components/
│       ├── email-button.tsx                # Button component for emails
│       ├── email-header.tsx                # Header component for emails
│       └── email-footer.tsx                # Footer component for emails
└── lib/
    └── email/
        ├── send-rsvp-confirmation.ts       # Function to send confirmation email
        ├── send-rsvp-reminder.ts           # Function to send reminder email
        └── tracking-pixel.ts               # Email open tracking implementation
```

## 📚 Relevant Documentation References

### Technical Documentation

- [RSVP System Architecture](../../docs/architecture/RSVP_SYSTEM.md)
- [Invitation Flow Diagram](../../docs/architecture/INVITATION_FLOW.md)
- [Email Template System](../../docs/architecture/EMAIL_TEMPLATES.md)
- [Camera Integration Guide](../../docs/implementation/CAMERA_INTEGRATION.md)
- [QR Code Scanner Implementation](../../docs/implementation/QR_SCANNER.md)
- [Token Security Guidelines](../../docs/security/TOKEN_SECURITY.md)

### API Documentation

- [RSVP API Endpoints](../../docs/api/RSVP_API.md)
- [Invitation API Endpoints](../../docs/api/INVITATION_API.md)
- [Email API Integration](../../docs/api/EMAIL_API.md)

### Component Documentation

- [RSVP Form Implementation](../../docs/components/RSVP_FORM.md)
- [Camera Component Usage](../../docs/components/CAMERA_USAGE.md)
- [Invitation Components](../../docs/components/INVITATION_COMPONENTS.md)

### User Guides

- [Guest RSVP Flow](../../docs/user-guides/GUEST_RSVP.md)
- [QR Code Scanner Usage](../../docs/user-guides/QR_SCANNER.md)
- [Managing RSVPs as an Organizer](../../docs/user-guides/MANAGING_RSVPS.md)

## 🧩 Key Components & Integration Points

### Core Components to Implement

1. **EventPreview Component**
   - Displays event details on invitation page
   - Integrates with event branding settings
   - Responsive design for all device sizes

2. **RsvpForm Component**
   - Form with validation for guest responses
   - Handles plus-one information
   - Manages dietary restrictions and notes
   - Provides clear feedback on submission

3. **QrScanner Component**
   - Camera access and QR code detection
   - Secure token extraction and validation
   - Clear feedback and error handling

4. **ConfirmationCard Component**
   - Status-specific confirmation display
   - Sharing options for accepted RSVPs
   - Clear next steps for guests

### Database Schema References

```sql
-- Relevant tables for RSVP system
CREATE TABLE rsvps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invitation_id UUID NOT NULL REFERENCES invitations(id),
  status TEXT NOT NULL CHECK (status IN ('accepted', 'declined', 'pending')),
  plus_one BOOLEAN DEFAULT FALSE,
  plus_one_name TEXT,
  dietary_restrictions TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL REFERENCES events(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🛠️ Development Tools & Libraries

- **Form Handling**: react-hook-form with Zod validation
- **Camera Access**: MediaDevices API with camera permissions
- **QR Code Scanning**: jsQR library for detection
- **Email Templates**: React Email for component-based templates
- **State Management**: Zustand for invitation and form state
- **API Integration**: TanStack Query for data fetching

## 📊 Testing Resources

- **E2E Testing**: Playwright for full RSVP flow
- **Component Testing**: Vitest with React Testing Library
- **API Testing**: Supertest for endpoint validation
- **Visual Testing**: Storybook for UI components
- **Accessibility Testing**: axe-core for WCAG compliance 