# src Directory Structure
Generated: 2025-04-27T22:17:10.315Z

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
│   │   ├── analytics/
│   │   │   └── rsvp/
│   │   │       └── route.ts
│   │   ├── auth/
│   │   │   └── magic-link/
│   │   │       └── route.ts
│   │   ├── cron/
│   │   │   └── sync-templates/
│   │   │       └── route.ts
│   │   ├── db/
│   │   │   ├── functions/
│   │   │   │   └── route.ts
│   │   │   └── setup/
│   │   │       └── route.ts
│   │   ├── debug/
│   │   │   └── route.ts
│   │   ├── diagnose/
│   │   │   └── schema/
│   │   │       └── route.ts
│   │   ├── events/
│   │   │   ├── qr-code/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── extract-colors/
│   │   │   └── route.ts
│   │   ├── galleries/
│   │   │   └── events/
│   │   │       └── route.ts
│   │   ├── gallery/
│   │   │   └── check-access/
│   │   │       └── route.ts
│   │   ├── guest/
│   │   │   ├── media/
│   │   │   │   ├── [mediaId]/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── route.ts.bak
│   │   │   │   ├── test-url/
│   │   │   │   │   └── route.ts
│   │   │   │   ├── update/
│   │   │   │   │   └── route.ts
│   │   │   │   └── update-all/
│   │   │   │       └── route.ts
│   │   │   ├── profile/
│   │   │   │   └── update/
│   │   │   │       └── route.ts
│   │   │   └── upload/
│   │   │       ├── confirm/
│   │   │       │   └── route.ts
│   │   │       ├── init/
│   │   │       │   └── route.ts
│   │   │       └── route.ts
│   │   ├── guests/
│   │   │   ├── avatar/
│   │   │   │   └── route.ts
│   │   │   └── reserve/
│   │   │       └── route.ts
│   │   ├── image-proxy/
│   │   │   └── route.ts
│   │   ├── invitation/
│   │   │   └── lookup/
│   │   │       └── route.ts
│   │   ├── invitations/
│   │   │   ├── [token]/
│   │   │   │   └── validate/
│   │   │   │       └── route.ts
│   │   │   ├── accept/
│   │   │   │   └── route.ts
│   │   │   ├── bulk-create/
│   │   │   │   └── route.ts
│   │   │   ├── create/
│   │   │   │   └── route.ts
│   │   │   ├── resend/
│   │   │   │   └── route.ts
│   │   │   ├── send/
│   │   │   │   └── route.ts
│   │   │   ├── staff/
│   │   │   │   └── route.ts
│   │   │   ├── stats/
│   │   │   │   └── route.ts
│   │   │   ├── validate/
│   │   │   │   └── route.ts
│   │   │   ├── verify/
│   │   │   │   └── route.ts
│   │   │   └── route.ts
│   │   ├── media-proxy/
│   │   │   └── route.ts
│   │   ├── rpc/
│   │   │   └── get-invitation-stats/
│   │   │       └── route.ts
│   │   ├── rsvp/
│   │   │   ├── status/
│   │   │   │   └── route.ts
│   │   │   └── submit/
│   │   │       └── route.ts
│   │   ├── templates/
│   │   │   ├── [templateId]/
│   │   │   │   └── html/
│   │   │   │       └── route.ts
│   │   │   ├── invitees-template/
│   │   │   │   └── route.ts
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
│   ├── confirm/
│   │   └── page.tsx
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
│   ├── event/
│   │   └── [slug]/
│   │       ├── confirmed/
│   │       │   └── page.tsx
│   │       └── declined/
│   │           └── page.tsx
│   ├── events/
│   │   ├── [eventId]/
│   │   │   ├── gallery/
│   │   │   │   ├── moderation/
│   │   │   │   │   ├── moderation-content.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── event-gallery-content.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── staff/
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
│   ├── guest/
│   │   ├── camera/
│   │   │   ├── CapturePreview.tsx
│   │   │   └── page.tsx
│   │   ├── camera-setup/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── gallery/
│   │   │   ├── GalleryGrid.tsx
│   │   │   └── page.tsx
│   │   ├── media/
│   │   │   └── [mediaId]/
│   │   │       └── page.tsx
│   │   ├── photos/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── upload/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── guest-access/
│   │   └── page.tsx
│   ├── invitation/
│   │   ├── [token]/
│   │   │   ├── camera-test/
│   │   │   │   └── page.tsx
│   │   │   ├── confirmation/
│   │   │   │   ├── accepted/
│   │   │   │   │   ├── add-to-calendar-button.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── share-event-button.tsx
│   │   │   │   └── declined/
│   │   │   │       └── page.tsx
│   │   │   ├── details/
│   │   │   │   └── page.tsx
│   │   │   ├── profile-setup/
│   │   │   │   └── page.tsx
│   │   │   ├── default.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── rsvp-details.tsx
│   │   │   └── rsvp-form.tsx
│   │   ├── expired/
│   │   │   └── page.tsx
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
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── audit-logs/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── components/
│   │   │   │   ├── AdminSidebar.tsx
│   │   │   │   ├── audit-log-columns.tsx
│   │   │   │   └── audit-log-viewer.tsx
│   │   │   ├── contacts/
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── diagnostic/
│   │   │   │   ├── clear-cache/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── guest-consistency/
│   │   │   │   │   └── page.tsx
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
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── ai/
│   │   │   ├── enhancements/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── facial-recognition/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── product-placements/
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
│   │   │   ├── components/
│   │   │   │   └── ActivitySection.tsx
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
│   │   │   │   ├── invitations/
│   │   │   │   │   ├── invitation-form.tsx
│   │   │   │   │   ├── invitation-stats.tsx
│   │   │   │   │   ├── invitations-list.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── qr/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── rsvps/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── staff/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   ├── .page.tsx.swp
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── page_tsx.swp
│   │   │   ├── manage/
│   │   │   │   ├── leaflet-map.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── map-client-wrapper.tsx
│   │   │   │   ├── page.tsx
│   │   │   │   └── stats-map-wrapper.tsx
│   │   │   ├── migrations/
│   │   │   │   ├── README.md
│   │   │   │   └── add_event_fields.sql
│   │   │   ├── new/
│   │   │   │   └── invitations/
│   │   │   │       ├── layout.tsx
│   │   │   │       └── page.tsx
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
│   │   │   │   ├── actions.ts
│   │   │   │   ├── batch-actions.ts
│   │   │   │   ├── moderator-client.tsx
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
│   │   │   ├── [id]/
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── not-found.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── scan/
│   │   └── page.tsx
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
│   ├── activity/
│   │   ├── ActivityGrid.tsx
│   │   ├── ActivityOverview.tsx
│   │   └── OverviewChart.tsx
│   ├── admin/
│   │   ├── admin-tabs.tsx
│   │   ├── staff-invitation-form.tsx
│   │   ├── staff-list-item.tsx
│   │   └── staff-management.tsx
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
│   ├── camera/
│   │   ├── camera-capture.tsx
│   │   └── index.tsx
│   ├── charts/
│   │   └── OverviewChart.tsx
│   ├── dashboard/
│   │   ├── MediaStatsCard.tsx
│   │   ├── RsvpDashboard.tsx
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
│   │   ├── event-invitations-panel.tsx
│   │   ├── event-list-client.tsx
│   │   ├── event-list.tsx
│   │   ├── event-navigation.tsx
│   │   ├── event-search.tsx
│   │   ├── event-status-selector.tsx
│   │   ├── image-upload.tsx
│   │   ├── qr-code-display.tsx
│   │   ├── qr-scanner.tsx
│   │   ├── rsvp-dashboard.tsx
│   │   ├── rsvp-tab-trigger.tsx
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
│   │   ├── consistent-grid.tsx
│   │   ├── gallery-event-card.tsx
│   │   ├── gallery-grid.tsx
│   │   ├── gallery-settings-form.tsx
│   │   ├── gallery-tabs.tsx
│   │   ├── guest-auth-check.tsx
│   │   ├── guest-reservation-form.tsx
│   │   ├── guest-upload-dropzone.tsx
│   │   ├── index.ts
│   │   ├── media-uploader.tsx
│   │   ├── mock-data.ts
│   │   ├── optimized-image.tsx
│   │   ├── photo-lightbox.tsx
│   │   ├── upload-button.tsx
│   │   ├── upload-dropzone.tsx
│   │   └── upload-with-tags.tsx
│   ├── guest/
│   │   ├── GuestDashboard.tsx
│   │   ├── GuestNavBar.tsx
│   │   ├── GuestNavigation.tsx
│   │   ├── GuestProfileForm.tsx
│   │   ├── PhotoUploader.tsx
│   │   ├── bottom-nav.tsx
│   │   ├── camera-test.tsx
│   │   ├── index.ts
│   │   ├── profile-setup-form.tsx
│   │   └── token-error.tsx
│   ├── invitation/
│   │   ├── SimpleScan.tsx
│   │   ├── qr-scanner.tsx
│   │   └── scanner-overlay.tsx
│   ├── invitations/
│   │   ├── create-invitation-form.tsx
│   │   └── magic-link-auth.tsx
│   ├── layout/
│   │   ├── base-layout.tsx
│   │   ├── dashboard-layout.tsx
│   │   ├── dashboard-page-layout.tsx
│   │   ├── guest-header.tsx
│   │   ├── header-suppressor.tsx
│   │   ├── index.ts
│   │   ├── main-nav.tsx
│   │   ├── protected-layout.tsx
│   │   └── sidebar-context.tsx
│   ├── maps/
│   │   ├── EventMap.tsx
│   │   ├── EventsMapSection.tsx
│   │   └── mock-data.ts
│   ├── marketing/
│   │   ├── contact-form.tsx
│   │   └── newsletter-form.tsx
│   ├── media/
│   │   ├── AlbumCreationForm.tsx
│   │   ├── EnhancedModerationCard.tsx
│   │   ├── MediaActionHandler.tsx
│   │   ├── MediaCard.tsx
│   │   ├── MediaDetailsDialog.tsx
│   │   ├── MediaEditDialog.tsx
│   │   ├── MediaGrid.tsx
│   │   ├── MediaModerationGrid.tsx
│   │   ├── MediaUploader.tsx
│   │   ├── MediaViewer.tsx
│   │   ├── ModerationCard.tsx
│   │   ├── camera-capture.tsx
│   │   ├── camera-test.tsx
│   │   ├── index.ts
│   │   └── upload-media-button.tsx
│   ├── moderation/
│   │   ├── BatchActionControls.tsx
│   │   ├── BatchSelectionProvider.tsx
│   │   └── ModerationStats.tsx
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
│   ├── rsvp/
│   │   └── rsvp-form.tsx
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
│   │   ├── image-placeholder.tsx
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
│   │   ├── staff-role-badge.tsx
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
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── contexts/
│   └── token-context.tsx
├── hooks/
│   ├── __tests__/
│   │   └── use-permissions.test.ts
│   ├── use-analytics.ts
│   ├── use-auth.ts
│   ├── use-debounced-auth.ts
│   ├── use-events.ts
│   ├── use-magic-link.ts
│   ├── use-media-query.ts
│   ├── use-permissions.ts
│   ├── use-profile.ts
│   ├── use-toast.ts
│   ├── use-update-profile.ts
│   ├── use-user.ts
│   ├── useCamera.ts
│   ├── useInvitationStats.ts
│   ├── useInvitations.ts
│   ├── useQrScanner.ts
│   └── useSecureAuth.ts
├── lib/
│   ├── ai/
│   │   ├── color-extraction.ts
│   │   └── photo-enhancement.ts
│   ├── auth/
│   │   ├── invitation-middleware.ts
│   │   ├── tokens.ts
│   │   └── utils.ts
│   ├── data/
│   │   └── activity.ts
│   ├── email/
│   │   ├── index.ts
│   │   └── sendgrid.ts
│   ├── realtime/
│   │   └── event-collaboration.ts
│   ├── supabase/
│   │   ├── __tests__/
│   │   │   ├── auth-store.test.ts
│   │   │   └── events.test.ts
│   │   ├── attendees/
│   │   │   └── index.ts
│   │   ├── attendees.server.ts
│   │   ├── attendees.ts
│   │   ├── auth-store.ts
│   │   ├── auth-utils.ts
│   │   ├── client.ts
│   │   ├── dashboard.ts
│   │   ├── debug-queries.ts
│   │   ├── events.server.ts
│   │   ├── events.ts
│   │   ├── galleries.server.ts
│   │   ├── galleries.ts
│   │   ├── guests.ts
│   │   ├── invitations.ts
│   │   ├── media.server.ts
│   │   ├── media.ts
│   │   ├── photos.server.ts
│   │   ├── photos.ts
│   │   ├── run-migration.js
│   │   ├── search.ts
│   │   ├── server-auth.ts
│   │   ├── server.ts
│   │   ├── templates.ts
│   │   ├── test-utils.ts
│   │   ├── verify-schema.html
│   │   └── verify-schema.js
│   ├── tokens/
│   │   ├── invitation-token-server.ts
│   │   └── invitation-token.ts
│   ├── utils/
│   │   ├── codeGenerator.ts
│   │   ├── media-proxy.ts
│   │   └── qr-utils.ts
│   ├── validation/
│   │   └── rsvp.schema.ts
│   ├── validations/
│   │   ├── event.ts
│   │   ├── rsvp-schema.ts
│   │   └── rsvp.ts
│   ├── analytics.ts
│   ├── auth.ts
│   ├── constants.ts
│   ├── event-customization-server.ts
│   ├── event-customization.ts
│   ├── formatters.ts
│   ├── index.ts
│   ├── invitations-client.ts
│   ├── invitations.ts
│   ├── qr-code.ts
│   ├── query-helpers.ts
│   ├── security-settings.ts
│   ├── sendgrid.ts
│   ├── types.ts
│   ├── user-sessions.ts
│   └── utils.ts
├── scripts/
│   ├── apply-rls-policies.sh
│   ├── connect-db.sh*
│   ├── mobile-menu.js
│   └── test-invitation.js
├── store/
│   ├── events-store.ts
│   ├── index.ts
│   ├── media-store.ts
│   └── photos-store.ts
├── styles/
│   └── layout.css
├── types/
│   ├── auth.ts
│   ├── custom.d.ts
│   ├── events.ts
│   ├── gallery.ts
│   ├── invitation-stats.ts
│   ├── invitations.ts
│   ├── jsqr.d.ts
│   ├── media.ts
│   ├── notifications.ts
│   ├── rsvp.ts
│   ├── search.ts
│   └── supabase.ts
├── .DS_Store
├── middleware.test.ts
└── middleware.ts

264 directories, 600 files

```

## File Type Breakdown
- ts: 156 file(s)
- tsx: 422 file(s)
- js: 4 file(s)
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
