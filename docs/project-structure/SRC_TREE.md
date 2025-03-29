# src Directory Structure
Generated: 2025-03-29T23:29:42.364Z

## Overview



## Directory Tree
```
./src/
├── _backup/
│   ├── [eventId].bak/
│   │   └── gallery/
│   │       ├── moderation/
│   │       │   ├── moderation-content.tsx
│   │       │   └── page.tsx
│   │       ├── event-gallery-content.tsx
│   │       └── page.tsx
│   └── [id].bak/
│       ├── gallery/
│       │   └── page.tsx
│       ├── upload/
│       │   └── page.tsx
│       ├── layout.tsx
│       ├── not-found.tsx
│       └── page.tsx
├── app/
│   ├── (auth)/
│   │   └── events/
│   │       └── [eventId]/
│   │           ├── invitations/
│   │           │   └── qr/
│   │           │       └── page.tsx
│   │           ├── media/
│   │           │   ├── albums/
│   │           │   │   ├── [albumId]/
│   │           │   │   │   └── page.tsx
│   │           │   │   ├── create/
│   │           │   │   │   └── page.tsx
│   │           │   │   └── page.tsx
│   │           │   ├── moderation/
│   │           │   │   ├── moderation-content.tsx
│   │           │   │   └── page.tsx
│   │           │   ├── upload/
│   │           │   │   └── page.tsx
│   │           │   └── page.tsx
│   │           └── qr-scan/
│   │               └── page.tsx
│   ├── api/
│   │   ├── cron/
│   │   │   └── sync-templates/
│   │   │       └── route.ts
│   │   ├── db/
│   │   │   ├── functions/
│   │   │   │   └── route.ts
│   │   │   └── setup/
│   │   │       └── route.ts
│   │   ├── events/
│   │   │   └── qr-code/
│   │   │       └── route.ts
│   │   ├── extract-colors/
│   │   │   └── route.ts
│   │   ├── galleries/
│   │   │   └── events/
│   │   │       └── route.ts
│   │   ├── invitations/
│   │   │   ├── bulk-create/
│   │   │   │   └── route.ts
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   └── validate/
│   │   │       └── route.ts
│   │   ├── templates/
│   │   │   ├── [templateId]/
│   │   │   │   └── html/
│   │   │   │       └── route.ts
│   │   │   └── sync/
│   │   │       └── route.ts
│   │   └── test-email/
│   │       └── route.ts
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts
│   │   ├── error/
│   │   │   └── page.tsx
│   │   ├── qr-scan/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── resend-verification/
│   │   │   └── page.tsx
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   ├── test-layout/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── dashboard/
│   │   ├── analytics/
│   │   │   └── page.tsx
│   │   └── page.tsx
│   ├── dev/
│   │   └── setup/
│   │       └── route.ts
│   ├── e/
│   │   └── [customUrl]/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── events/
│   │   ├── [eventId]/
│   │   │   ├── gallery/
│   │   │   │   ├── moderation/
│   │   │   │   │   ├── moderation-content.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── event-gallery-content.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── upload/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── create/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── gallery/
│   │   └── [eventId]/
│   │       └── page.tsx
│   ├── invitation/
│   │   ├── [token]/
│   │   │   ├── page.tsx
│   │   │   └── rsvp-form.tsx
│   │   └── page.tsx
│   ├── invite/
│   │   └── [token]/
│   │       ├── upload/
│   │       │   └── page.tsx
│   │       └── page.tsx
│   ├── legal/
│   │   ├── cookies/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── lib/
│   │   ├── photos-client.ts
│   │   ├── photos.server.ts
│   │   ├── photos.ts
│   │   └── security-settings-server.ts
│   ├── marketing/
│   │   ├── about/
│   │   │   └── page.tsx
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── pricing/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx
│   ├── protected/
│   │   ├── admin/
│   │   │   ├── audit-logs/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── audit-log-columns.tsx
│   │   │   │   └── audit-log-viewer.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   └── page.tsx
│   │   │   ├── newsletter/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── photos/
│   │   │   │   └── page.tsx
│   │   │   ├── roles/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   └── page.tsx
│   │   │   ├── users/
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── ai/
│   │   │   ├── enhancements/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── facial-recognition/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── product-placements/
│   │   │   │   ├── .page.tsx.swp
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── smart-tagging/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── studio/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── metadata.ts
│   │   ├── analytics/
│   │   │   ├── engagement/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── events/
│   │   │       ├── loading.tsx
│   │   │       └── page.tsx
│   │   ├── attendees/
│   │   │   └── invitations/
│   │   │       ├── components/
│   │   │       │   └── invitations-table.tsx
│   │   │       ├── create/
│   │   │       │   ├── layout.tsx
│   │   │       │   └── page.tsx
│   │   │       ├── columns.tsx
│   │   │       └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── overview/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── [id]/
│   │   │   │   ├── attendees/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── edit/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── gallery/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── qr/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   ├── .page.tsx.swp
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── page_tsx.swp
│   │   │   ├── manage/
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── map-client-wrapper.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── stats-map-wrapper.tsx
│   │   │   ├── migrations/
│   │   │   │   ├── README.md
│   │   │   │   └── add_event_fields.sql
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   ├── albums/
│   │   │   │   └── page.tsx
│   │   │   ├── all/
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── [galleryId]/
│   │   │   │   │   ├── settings/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── page-metadata.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── moderate/
│   │   │   │   └── page.tsx
│   │   │   ├── upload/
│   │   │   │   ├── page.tsx
│   │   │   │   └── upload-content.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── notifications/
│   │   │   └── page.tsx
│   │   ├── overview/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── settings/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── qr-codes/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── account/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── billing/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── templates/
│   │   │   │   │   ├── change-email.html
│   │   │   │   │   ├── confirm-signup.html
│   │   │   │   │   ├── invite.html
│   │   │   │   │   ├── magic-link.html
│   │   │   │   │   └── reset-password.html
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── subscription/
│   │   │   └── page.tsx
│   │   ├── templates/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── verify/
│   │   └── page.tsx
│   ├── components.css
│   ├── error.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── loading.tsx
│   ├── metadata.ts
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── attendees/
│   │   └── invitation-form.tsx
│   ├── auth/
│   │   ├── auth-debug.tsx
│   │   ├── auth-form.tsx
│   │   ├── auth-guard.tsx
│   │   ├── debug-panel.tsx
│   │   ├── permission-gate.tsx
│   │   ├── resend-verification-form.tsx
│   │   ├── role-guard.tsx
│   │   └── social-auth-buttons.tsx
│   ├── dashboard/
│   │   ├── MediaStatsCard.tsx
│   │   ├── activity-feed.tsx
│   │   ├── analytics-overview.tsx
│   │   ├── contact-stats.tsx
│   │   ├── contact-submissions.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── event-summary.tsx
│   │   ├── header.tsx
│   │   ├── index.ts
│   │   ├── newsletter-stats.tsx
│   │   ├── newsletter-subscribers.tsx
│   │   ├── overview-chart.tsx
│   │   ├── overview.tsx
│   │   ├── quick-actions.tsx
│   │   ├── recent-activity.tsx
│   │   ├── recent-events.tsx
│   │   └── stats.tsx
│   ├── events/
│   │   ├── add-attendee-dialog.tsx
│   │   ├── attendee-management.tsx
│   │   ├── enhanced-event-card.tsx
│   │   ├── event-actions.tsx
│   │   ├── event-card.tsx
│   │   ├── event-details.tsx
│   │   ├── event-filters.tsx
│   │   ├── event-form.tsx
│   │   ├── event-invitation-qr.tsx
│   │   ├── event-list-client.tsx
│   │   ├── event-list.tsx
│   │   ├── event-navigation.tsx
│   │   ├── event-search.tsx
│   │   ├── event-status-selector.tsx
│   │   ├── image-upload.tsx
│   │   ├── qr-code-display.tsx
│   │   ├── qr-scanner.tsx
│   │   └── theme-preview.tsx
│   ├── forms/
│   │   ├── avatar-upload.tsx
│   │   ├── event-customization-form.tsx
│   │   ├── event-form.tsx
│   │   ├── notifications-form.tsx
│   │   ├── preferences-form.tsx
│   │   ├── profile-form.tsx
│   │   ├── security-form.tsx
│   │   └── subscription-form.tsx
│   ├── gallery/
│   │   ├── EventGallery.tsx
│   │   ├── GalleryHeader.tsx
│   │   ├── GalleryLayout.tsx
│   │   ├── GallerySidebar.tsx
│   │   ├── MasonryGrid.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── MediaLightbox.tsx
│   │   ├── MediaModeration.tsx
│   │   ├── MediaUpload.tsx
│   │   ├── MediaViewer.tsx
│   │   ├── README.md
│   │   ├── gallery-event-card.tsx
│   │   ├── gallery-grid.tsx
│   │   ├── gallery-settings-form.tsx
│   │   ├── gallery-tabs.tsx
│   │   ├── guest-upload-dropzone.tsx
│   │   ├── index.ts
│   │   ├── mock-data.ts
│   │   ├── optimized-image.tsx
│   │   ├── photo-lightbox.tsx
│   │   ├── upload-dropzone.tsx
│   │   └── upload-with-tags.tsx
│   ├── invitations/
│   │   └── create-invitation-form.tsx
│   ├── layout/
│   │   ├── dashboard-layout.tsx
│   │   └── main-nav.tsx
│   ├── maps/
│   │   ├── EventMap.tsx
│   │   ├── EventsMapSection.tsx
│   │   └── mock-data.ts
│   ├── marketing/
│   │   ├── contact-form.tsx
│   │   └── newsletter-form.tsx
│   ├── media/
│   │   ├── AlbumCreationForm.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── MediaModerationGrid.tsx
│   │   ├── MediaUploader.tsx
│   │   ├── MediaViewer.tsx
│   │   └── upload-media-button.tsx
│   ├── nav/
│   │   ├── logo.tsx
│   │   ├── main-nav.tsx
│   │   ├── nav-item.tsx
│   │   ├── side-nav.tsx
│   │   └── user-nav.tsx
│   ├── notifications/
│   │   ├── create-template.tsx
│   │   ├── full-preview.tsx
│   │   ├── notification-item.tsx
│   │   ├── notifications-content.tsx
│   │   ├── template-editor.tsx
│   │   └── template-preview.tsx
│   ├── onboarding/
│   │   ├── steps/
│   │   │   ├── completion.tsx
│   │   │   ├── event-setup.tsx
│   │   │   └── profile-setup.tsx
│   │   └── onboarding-flow.tsx
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── toast-provider.tsx
│   │   └── tooltip-provider.tsx
│   ├── settings/
│   │   └── system-status.tsx
│   ├── ui/
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── calendar.tsx
│   │   ├── card.tsx
│   │   ├── chart.tsx
│   │   ├── charts.tsx
│   │   ├── checkbox.tsx
│   │   ├── collapsible.tsx
│   │   ├── command.tsx
│   │   ├── data-table.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── empty-state.tsx
│   │   ├── form.tsx
│   │   ├── icons.tsx
│   │   ├── index.ts
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── newsletter-form.tsx
│   │   ├── popover.tsx
│   │   ├── progress.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── sidebar.tsx
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── spinner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   └── use-toast.ts
│   ├── app-sidebar.tsx
│   ├── area_chart_interactive.tsx
│   ├── cookie-consent.tsx
│   ├── debug-info.tsx
│   ├── error-boundary.tsx
│   ├── query-provider.tsx
│   ├── shell.tsx
│   └── theme-provider.tsx
├── hooks/
│   ├── __tests__/
│   │   └── use-permissions.test.ts
│   ├── use-analytics.ts
│   ├── use-auth.ts
│   ├── use-debounced-auth.ts
│   ├── use-events.ts
│   ├── use-permissions.ts
│   ├── use-profile.ts
│   ├── use-toast.ts
│   ├── use-update-profile.ts
│   └── use-user.ts
├── lib/
│   ├── ai/
│   │   ├── color-extraction.ts
│   │   └── photo-enhancement.ts
│   ├── auth/
│   │   └── utils.ts
│   ├── email/
│   │   ├── index.ts
│   │   └── sendgrid.ts
│   ├── realtime/
│   │   └── event-collaboration.ts
│   ├── supabase/
│   │   ├── __tests__/
│   │   │   ├── auth-store.test.ts
│   │   │   └── events.test.ts
│   │   ├── auth-store.ts
│   │   ├── auth-utils.ts
│   │   ├── client.ts
│   │   ├── debug-queries.ts
│   │   ├── events.server.ts
│   │   ├── events.ts
│   │   ├── galleries.server.ts
│   │   ├── galleries.ts
│   │   ├── invitations.ts
│   │   ├── media.server.ts
│   │   ├── media.ts
│   │   ├── photos.server.ts
│   │   ├── photos.ts
│   │   ├── run-migration.js
│   │   ├── search.ts
│   │   ├── server.ts
│   │   ├── templates.ts
│   │   ├── test-utils.ts
│   │   ├── verify-schema.html
│   │   └── verify-schema.js
│   ├── utils/
│   │   └── codeGenerator.ts
│   ├── analytics.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── event-customization-server.ts
│   ├── event-customization.ts
│   ├── formatters.ts
│   ├── index.ts
│   ├── qr-code.ts
│   ├── security-settings.ts
│   ├── sendgrid.ts
│   ├── user-sessions.ts
│   └── utils.ts
├── scripts/
│   └── mobile-menu.js
├── store/
│   ├── events-store.ts
│   ├── index.ts
│   ├── media-store.ts
│   └── photos-store.ts
├── styles/
│   └── layout.css
├── types/
│   ├── auth.ts
│   ├── events.ts
│   ├── gallery.ts
│   ├── invitations.ts
│   ├── media.ts
│   ├── notifications.ts
│   ├── search.ts
│   └── supabase.ts
├── .DS_Store
├── middleware.test.ts
└── middleware.ts

171 directories, 424 files

```

## File Type Breakdown
- ts: 88 file(s)
- tsx: 317 file(s)
- js: 3 file(s)
- md: 2 file(s)
- css: 3 file(s)

## Ignored Patterns
- node_modules
- .git
- .next
- dist
- coverage
- .vercel
- .env*
- *.log
