# protected Directory Structure
Generated: 2025-04-01T03:43:49.173Z

## Overview

This directory contains 52 route(s).

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
├── ai/
│   ├── enhancements/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── facial-recognition/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── product-placements/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── smart-tagging/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── studio/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   └── metadata.ts
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
│   │   ├── gallery/
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
│   │   ├── leaflet-map.tsx
│   │   ├── loading.tsx
│   │   ├── map-client-wrapper.tsx
│   │   ├── page.tsx
│   │   └── stats-map-wrapper.tsx
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
│   │   ├── page-metadata.tsx
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
│   ├── [id]/
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── create/
│   │   └── page.tsx
│   └── page.tsx
└── layout.tsx

60 directories, 109 files

```

## File Type Breakdown
- ts: 1 file(s)
- tsx: 99 file(s)
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
