# Session 43 Resources Map

## Key Documentation

### Session Documentation
- `docs/development/session-43-kickoff-prompt.md` - Session narrative and goals
- `docs/development/session-43-checklist.md` - Task list and progress tracking (updated with PWA implementation)
- `docs/development/STATUS_NOTES.md` - Current status and progress notes

### Architecture & Technical Documents
- `docs/architecture/navigation-structure.md` - Current navigation structure
- `docs/architecture/user-journeys.md` - User flows and pathways
- `docs/development/dashboard-components.md` - Dashboard component standards
- `docs/development/progressive-web-app.md` - PWA implementation guide

### User Experience Documents
- `docs/ux/event-organizer-journey.md` - Organizer user journey map
- `docs/ux/guest-journey.md` - Guest user journey and touchpoints
- `docs/ux/admin-journey.md` - Super admin user journey

## Relevant Code Structure

### Dashboard & Navigation
```
src/
├── components/
│   ├── layout/
│   │   ├── protected-layout.tsx     # Main dashboard layout
│   │   ├── sidebar.tsx              # Main navigation sidebar
│   │   └── header.tsx               # Dashboard header
│   ├── dashboard/
│   │   ├── nav-items.tsx            # Navigation configuration
│   │   ├── organizer-dashboard.tsx  # Organizer home view
│   │   └── admin-dashboard.tsx      # Admin home view
│   └── ui/
│       ├── theme-toggle.tsx         # Theme switching component
│       └── mobile-nav.tsx           # Mobile navigation
```

### Guest Experience
```
src/
├── app/
│   ├── invitation/[token]/
│   │   ├── page.tsx                 # Invitation landing page
│   │   └── rsvp/                    # RSVP flow
│   ├── guest/
│   │   ├── dashboard/               # Guest dashboard
│   │   ├── upload/                  # Photo upload interface
│   │   ├── gallery/                 # Gallery viewing
│   │   └── profile/                 # Guest profile management
│   └── api/
│       └── guest/                   # Guest API endpoints
├── lib/
│   └── utils/
│       ├── token-management.ts      # Invitation token handling
│       └── pwa-utils.ts             # PWA helper functions (need to create)
└── public/
    ├── manifest.json                # PWA manifest file (✓ implemented)
    ├── service-worker.js            # Service worker (now renamed to sw.js, ✓ implemented)
    └── offline.html                 # Offline fallback page (✓ implemented)
```

### Admin Experience
```
src/
├── app/
│   └── protected/
│       ├── admin/
│       │   ├── dashboard/           # Admin dashboard
│       │   ├── users/               # User management
│       │   ├── events/              # Event oversight
│       │   ├── analytics/           # Platform analytics
│       │   └── settings/            # System settings
│       └── organizer/               # Organizer sections to refactor
└── components/
    └── admin/                       # Admin-specific components
```

### Public Pages
```
src/
├── app/
│   ├── page.tsx                     # Home page
│   ├── about/page.tsx               # About page
│   ├── pricing/page.tsx             # Pricing page
│   ├── contact/page.tsx             # Contact page
│   └── layout.tsx                   # Root layout with theme provider and PWA metadata
├── components/
│   ├── marketing/                   # Marketing components
│   └── theme/
│       └── theme-provider.tsx       # Theme context provider
└── lib/
    └── utils/
        └── theme-utils.ts           # Theme helper functions
```

## Database Resources

### User Management Tables
```
- users                 # User accounts
- profiles              # User profiles
- roles                 # User roles
- role_capabilities     # Role permissions
```

### Guest & Invitation Tables
```
- invitations           # Event invitations
- guests                # Guest profiles
- rsvps                 # RSVP responses
- gallery_permissions   # Gallery access permissions
```

### Content & Media Tables
```
- events                # Events data
- media                 # Media items (photos/videos)
- albums                # Media collections
- moderation_logs       # Media moderation history
```

## API Endpoints

### Guest Experience APIs
```
- /api/invitation/validate    # Validate invitation tokens
- /api/guest/profile          # Guest profile management
- /api/guest/upload           # Media upload for guests
- /api/media-proxy            # Media serving proxy
```

### Organizer APIs
```
- /api/events                 # Event management
- /api/invitations            # Invitation management
- /api/media                  # Media management
- /api/gallery                # Gallery configuration
```

### Admin APIs
```
- /api/admin/users            # User management
- /api/admin/events           # Event oversight
- /api/admin/analytics        # Analytics data
- /api/admin/system           # System configurations
```

## Progressive Web App Resources

### PWA Configuration Files (Status: April 20, 2025)
```
- public/manifest.json        # Web app manifest (✓ IMPLEMENTED)
- public/sw.js                # Service worker (✓ IMPLEMENTED)
- public/offline.html         # Offline fallback page (✓ IMPLEMENTED)
- public/icons/               # App icons in various sizes (➤ PENDING)
```

### PWA Integration Points
```
- src/app/layout.tsx          # PWA meta tags (✓ UPDATED)
- src/lib/utils/pwa-utils.ts  # PWA helper functions (➤ TO BE CREATED)
- src/components/pwa/         # PWA-specific components (➤ TO BE CREATED)
```

### PWA Testing Status
```
- Chrome/Android Installation   (➤ PENDING)
- Safari/iOS Installation       (➤ PENDING)
- Offline Functionality         (➤ PENDING)
- Push Notifications            (➤ PENDING)
- Background Sync               (➤ PENDING)
```

This resource map provides an overview of the key files and structures that will need to be modified during Session 43. It serves as a reference point for navigating the codebase efficiently during the session. 

## Implementation Notes (April 20, 2025)

### PWA Implementation Progress
- Created comprehensive manifest.json file with proper metadata, icons, and shortcuts
- Implemented service worker (sw.js) with caching strategies, offline support, and background sync
- Created offline.html fallback page with responsive design and reconnection functionality
- Updated root layout.tsx with proper meta tags and manifest links
- Next steps include testing PWA functionality and implementing "Add to Home Screen" prompting

### Pending PWA Tasks
- Create pwa-utils.ts for helper functions (service worker registration, etc.)
- Test installation flow across browsers and devices
- Verify offline functionality works as expected
- Create PWA-specific components for installation prompting
- Test background sync for uploads during intermittent connectivity
- Document PWA features for end users