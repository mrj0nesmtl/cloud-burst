# app Directory Structure
Generated: 2025-03-19T01:19:52.872Z

## Overview

This directory contains 76 route(s).

## Directory Tree
```
./src/app/
├── api/
│   ├── cron/
│   │   └── sync-templates/
│   │       └── route.ts
│   ├── db/
│   │   ├── functions/
│   │   │   └── route.ts
│   │   └── setup/
│   │       └── route.ts
│   ├── extract-colors/
│   │   └── route.ts
│   ├── invitations/
│   │   ├── bulk-create/
│   │   │   └── route.ts
│   │   └── create/
│   │       └── route.ts
│   ├── templates/
│   │   ├── [templateId]/
│   │   │   └── html/
│   │   │       └── route.ts
│   │   └── sync/
│   │       └── route.ts
│   └── test-email/
│       └── route.ts
├── auth/
│   ├── callback/
│   │   └── route.ts
│   ├── error/
│   │   └── page.tsx
│   ├── qr-scan/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   ├── resend-verification/
│   │   └── page.tsx
│   ├── signin/
│   │   └── page.tsx
│   ├── test-layout/
│   │   └── page.tsx
│   └── layout.tsx
├── dashboard/
│   ├── analytics/
│   │   └── page.tsx
│   └── page.tsx
├── dev/
│   └── setup/
│       └── route.ts
├── e/
│   └── [customUrl]/
│       ├── layout.tsx
│       └── page.tsx
├── events/
│   ├── [eventId]/
│   │   ├── gallery/
│   │   │   ├── moderation/
│   │   │   │   ├── moderation-content.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── event-gallery-content.tsx
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── [eventId].bak/
│   │   └── gallery/
│   │       ├── moderation/
│   │       │   ├── moderation-content.tsx
│   │       │   └── page.tsx
│   │       ├── event-gallery-content.tsx
│   │       └── page.tsx
│   ├── [id].bak/
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── create/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── invite/
│   └── [token]/
│       ├── upload/
│       │   └── page.tsx
│       └── page.tsx
├── legal/
│   ├── cookies/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   └── layout.tsx
├── lib/
│   ├── photos-client.ts
│   ├── photos.server.ts
│   ├── photos.ts
│   └── security-settings-server.ts
├── marketing/
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── layout.tsx
│   └── page.tsx
├── onboarding/
│   └── page.tsx
├── protected/
│   ├── admin/
│   │   ├── audit-logs/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── audit-log-columns.tsx
│   │   │   └── audit-log-viewer.tsx
│   │   ├── contacts/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   └── page.tsx
│   │   ├── newsletter/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── photos/
│   │   │   └── page.tsx
│   │   ├── roles/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── users/
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── analytics/
│   │   ├── engagement/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── events/
│   │       ├── loading.tsx
│   │       └── page.tsx
│   ├── attendees/
│   │   └── invitations/
│   │       ├── components/
│   │       │   └── invitations-table.tsx
│   │       ├── create/
│   │       │   └── page.tsx
│   │       ├── .page.tsx.swp
│   │       ├── columns.tsx
│   │       └── page.tsx
│   ├── dashboard/
│   │   ├── overview/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── events/
│   │   ├── [id]/
│   │   │   ├── attendees/
│   │   │   │   └── page.tsx
│   │   │   ├── edit/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── qr/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── create/
│   │   │   ├── .page.tsx.swp
│   │   │   ├── loading.tsx
│   │   │   ├── page.tsx
│   │   │   └── page_tsx.swp
│   │   ├── manage/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── migrations/
│   │   │   ├── README.md
│   │   │   └── add_event_fields.sql
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── gallery/
│   │   ├── albums/
│   │   │   └── page.tsx
│   │   ├── all/
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── [galleryId]/
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── moderate/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   ├── page.tsx
│   │   │   └── upload-content.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── notifications/
│   │   └── page.tsx
│   ├── overview/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── profile/
│   │   ├── settings/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── qr-codes/
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── settings/
│   │   ├── account/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── billing/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   ├── templates/
│   │   │   │   ├── change-email.html
│   │   │   │   ├── confirm-signup.html
│   │   │   │   ├── invite.html
│   │   │   │   ├── magic-link.html
│   │   │   │   └── reset-password.html
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── subscription/
│   │   └── page.tsx
│   ├── templates/
│   │   └── page.tsx
│   └── layout.tsx
├── verify/
│   └── page.tsx
├── components.css
├── error.tsx
├── globals.css
├── layout.tsx
├── loading.tsx
├── metadata.ts
├── not-found.tsx
└── page.tsx

107 directories, 155 files

```

## File Type Breakdown
- ts: 16 file(s)
- tsx: 127 file(s)
- md: 1 file(s)
- css: 2 file(s)

## Ignored Patterns
- node_modules
- .git
- .next
- dist
- coverage
- .vercel
- .env*
- *.log
