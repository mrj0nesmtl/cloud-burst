# protected Directory Structure
Generated: 2025-03-25T22:22:20.818Z

## Overview

This directory contains 44 route(s).

## Directory Tree
```
./src/app/protected/
├── admin/
│   ├── audit-logs/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── audit-log-columns.tsx
│   │   └── audit-log-viewer.tsx
│   ├── contacts/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── events/
│   │   └── page.tsx
│   ├── newsletter/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── photos/
│   │   └── page.tsx
│   ├── roles/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── settings/
│   │   └── page.tsx
│   ├── users/
│   │   ├── [id]/
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── analytics/
│   ├── engagement/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── events/
│       ├── loading.tsx
│       └── page.tsx
├── attendees/
│   └── invitations/
│       ├── components/
│       │   └── invitations-table.tsx
│       ├── create/
│       │   ├── layout.tsx
│       │   └── page.tsx
│       ├── columns.tsx
│       └── page.tsx
├── dashboard/
│   ├── overview/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── loading.tsx
│   └── page.tsx
├── events/
│   ├── [id]/
│   │   ├── attendees/
│   │   │   └── page.tsx
│   │   ├── edit/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── qr/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── create/
│   │   ├── .page.tsx.swp
│   │   ├── loading.tsx
│   │   ├── page.tsx
│   │   └── page_tsx.swp
│   ├── manage/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── migrations/
│   │   ├── README.md
│   │   └── add_event_fields.sql
│   ├── layout.tsx
│   ├── loading.tsx
│   └── page.tsx
├── gallery/
│   ├── albums/
│   │   └── page.tsx
│   ├── all/
│   │   └── page.tsx
│   ├── events/
│   │   ├── [galleryId]/
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── moderate/
│   │   └── page.tsx
│   ├── upload/
│   │   ├── page.tsx
│   │   └── upload-content.tsx
│   ├── layout.tsx
│   └── page.tsx
├── notifications/
│   └── page.tsx
├── overview/
│   ├── loading.tsx
│   └── page.tsx
├── profile/
│   ├── settings/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── page.tsx
├── qr-codes/
│   ├── loading.tsx
│   └── page.tsx
├── settings/
│   ├── account/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── billing/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── notifications/
│   │   ├── templates/
│   │   │   ├── change-email.html
│   │   │   ├── confirm-signup.html
│   │   │   ├── invite.html
│   │   │   ├── magic-link.html
│   │   │   └── reset-password.html
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── profile/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── loading.tsx
│   └── page.tsx
├── subscription/
│   └── page.tsx
├── templates/
│   └── page.tsx
└── layout.tsx

51 directories, 87 files

```

## File Type Breakdown
- tsx: 78 file(s)
- md: 1 file(s)

## Ignored Patterns
- node_modules
- .git
- .next
- dist
- coverage
- .vercel
- .env*
- *.log

## Protected Routes
This directory contains authenticated routes that require user login, including:
- Dashboard views
- User management interfaces
- Event management for organizers
- Photo management interfaces
