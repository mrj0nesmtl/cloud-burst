# app Directory Structure
Generated: 2025-04-09T21:52:27.819Z

## Overview

This directory contains 101 route(s).


## Directory Tree
```
./src/app/
├── (auth)/
│   └── events/
│       └── [eventId]/
│           ├── invitations/
│           │   └── qr/
│           │       └── page.tsx
│           ├── media/
│           │   ├── albums/
│           │   │   ├── [albumId]/
│           │   │   │   └── page.tsx
│           │   │   ├── create/
│           │   │   │   └── page.tsx
│           │   │   └── page.tsx
│           │   ├── moderation/
│           │   │   ├── moderation-content.tsx
│           │   │   └── page.tsx
│           │   ├── upload/
│           │   │   └── page.tsx
│           │   └── page.tsx
│           └── qr-scan/
│               └── page.tsx
├── api/
│   ├── analytics/
│   │   └── rsvp/
│   │       └── route.ts
│   ├── auth/
│   │   └── magic-link/
│   │       └── route.ts
│   ├── cron/
│   │   └── sync-templates/
│   │       └── route.ts
│   ├── db/
│   │   ├── functions/
│   │   │   └── route.ts
│   │   └── setup/
│   │       └── route.ts
│   ├── events/
│   │   ├── qr-code/
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── extract-colors/
│   │   └── route.ts
│   ├── galleries/
│   │   └── events/
│   │       └── route.ts
│   ├── gallery/
│   │   └── check-access/
│   │       └── route.ts
│   ├── guests/
│   │   └── reserve/
│   │       └── route.ts
│   ├── invitation/
│   │   └── lookup/
│   │       └── route.ts
│   ├── invitations/
│   │   ├── [token]/
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   ├── accept/
│   │   │   └── route.ts
│   │   ├── bulk-create/
│   │   │   └── route.ts
│   │   ├── create/
│   │   │   └── route.ts
│   │   ├── resend/
│   │   │   └── route.ts
│   │   ├── send/
│   │   │   └── route.ts
│   │   ├── staff/
│   │   │   └── route.ts
│   │   ├── stats/
│   │   │   └── route.ts
│   │   ├── validate/
│   │   │   └── route.ts
│   │   ├── verify/
│   │   │   └── route.ts
│   │   └── route.ts
│   ├── rpc/
│   │   └── get-invitation-stats/
│   │       └── route.ts
│   ├── rsvp/
│   │   ├── status/
│   │   │   └── route.ts
│   │   └── submit/
│   │       └── route.ts
│   ├── templates/
│   │   ├── [templateId]/
│   │   │   └── html/
│   │   │       └── route.ts
│   │   ├── invitees-template/
│   │   │   └── route.ts
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
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── staff/
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
├── gallery/
│   └── [eventId]/
│       └── page.tsx
├── invitation/
│   ├── [token]/
│   │   ├── confirmation/
│   │   │   ├── accepted/
│   │   │   │   ├── add-to-calendar-button.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── share-event-button.tsx
│   │   │   └── declined/
│   │   │       └── page.tsx
│   │   ├── details/
│   │   │   └── page.tsx
│   │   ├── page.tsx
│   │   ├── rsvp-details.tsx
│   │   └── rsvp-form.tsx
│   ├── expired/
│   │   └── page.tsx
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
│   ├── ai/
│   │   ├── enhancements/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── facial-recognition/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── product-placements/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── smart-tagging/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── studio/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── metadata.ts
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
│   │       │   ├── layout.tsx
│   │       │   └── page.tsx
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
│   │   │   ├── gallery/
│   │   │   │   └── page.tsx
│   │   │   ├── invitations/
│   │   │   │   ├── invitation-form.tsx
│   │   │   │   ├── invitation-stats.tsx
│   │   │   │   ├── invitations-list.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── qr/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── rsvps/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── create/
│   │   │   ├── .page.tsx.swp
│   │   │   ├── loading.tsx
│   │   │   ├── page.tsx
│   │   │   └── page_tsx.swp
│   │   ├── manage/
│   │   │   ├── leaflet-map.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── map-client-wrapper.tsx
│   │   │   ├── page.tsx
│   │   │   └── stats-map-wrapper.tsx
│   │   ├── migrations/
│   │   │   ├── README.md
│   │   │   └── add_event_fields.sql
│   │   ├── new/
│   │   │   └── invitations/
│   │   │       ├── layout.tsx
│   │   │       └── page.tsx
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
│   │   │   ├── page-metadata.tsx
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
│   │   ├── [id]/
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   └── layout.tsx
├── scan/
│   └── page.tsx
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

168 directories, 220 files

```

## File Type Breakdown
- ts: 38 file(s)
- tsx: 171 file(s)
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
