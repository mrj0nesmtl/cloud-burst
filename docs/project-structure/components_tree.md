# components Directory Structure
Generated: 2025-04-22T17:18:27.105Z

## Overview
This directory contains 211 component(s).



## Directory Tree
```
./src/components/
├── activity/
│   ├── ActivityGrid.tsx
│   ├── ActivityOverview.tsx
│   └── OverviewChart.tsx
├── admin/
│   ├── admin-tabs.tsx
│   ├── staff-invitation-form.tsx
│   ├── staff-list-item.tsx
│   └── staff-management.tsx
├── attendees/
│   └── invitation-form.tsx
├── auth/
│   ├── auth-debug.tsx
│   ├── auth-form.tsx
│   ├── auth-guard.tsx
│   ├── debug-panel.tsx
│   ├── permission-gate.tsx
│   ├── resend-verification-form.tsx
│   ├── role-guard.tsx
│   └── social-auth-buttons.tsx
├── camera/
│   ├── camera-capture.tsx
│   └── index.tsx
├── charts/
│   └── OverviewChart.tsx
├── dashboard/
│   ├── MediaStatsCard.tsx
│   ├── RsvpDashboard.tsx
│   ├── activity-feed.tsx
│   ├── analytics-overview.tsx
│   ├── contact-stats.tsx
│   ├── contact-submissions.tsx
│   ├── dashboard-stats.tsx
│   ├── event-summary.tsx
│   ├── header.tsx
│   ├── index.ts
│   ├── newsletter-stats.tsx
│   ├── newsletter-subscribers.tsx
│   ├── overview-chart.tsx
│   ├── overview.tsx
│   ├── quick-actions.tsx
│   ├── recent-activity.tsx
│   ├── recent-events.tsx
│   └── stats.tsx
├── events/
│   ├── add-attendee-dialog.tsx
│   ├── attendee-management.tsx
│   ├── enhanced-event-card.tsx
│   ├── event-actions.tsx
│   ├── event-card.tsx
│   ├── event-details.tsx
│   ├── event-filters.tsx
│   ├── event-form.tsx
│   ├── event-invitation-qr.tsx
│   ├── event-invitations-panel.tsx
│   ├── event-list-client.tsx
│   ├── event-list.tsx
│   ├── event-navigation.tsx
│   ├── event-search.tsx
│   ├── event-status-selector.tsx
│   ├── image-upload.tsx
│   ├── qr-code-display.tsx
│   ├── qr-scanner.tsx
│   ├── rsvp-dashboard.tsx
│   ├── rsvp-tab-trigger.tsx
│   └── theme-preview.tsx
├── forms/
│   ├── avatar-upload.tsx
│   ├── event-customization-form.tsx
│   ├── event-form.tsx
│   ├── notifications-form.tsx
│   ├── preferences-form.tsx
│   ├── profile-form.tsx
│   ├── security-form.tsx
│   └── subscription-form.tsx
├── gallery/
│   ├── EventGallery.tsx
│   ├── GalleryHeader.tsx
│   ├── GalleryLayout.tsx
│   ├── GallerySidebar.tsx
│   ├── MasonryGrid.tsx
│   ├── MediaCard.tsx
│   ├── MediaGrid.tsx
│   ├── MediaLightbox.tsx
│   ├── MediaModeration.tsx
│   ├── MediaUpload.tsx
│   ├── MediaViewer.tsx
│   ├── README.md
│   ├── consistent-grid.tsx
│   ├── gallery-event-card.tsx
│   ├── gallery-grid.tsx
│   ├── gallery-settings-form.tsx
│   ├── gallery-tabs.tsx
│   ├── guest-auth-check.tsx
│   ├── guest-reservation-form.tsx
│   ├── guest-upload-dropzone.tsx
│   ├── index.ts
│   ├── media-uploader.tsx
│   ├── mock-data.ts
│   ├── optimized-image.tsx
│   ├── photo-lightbox.tsx
│   ├── upload-button.tsx
│   ├── upload-dropzone.tsx
│   └── upload-with-tags.tsx
├── guest/
│   ├── GuestDashboard.tsx
│   ├── GuestNavigation.tsx
│   ├── GuestProfileForm.tsx
│   ├── PhotoUploader.tsx
│   ├── bottom-nav.tsx
│   ├── camera-test.tsx
│   ├── index.ts
│   ├── profile-setup-form.tsx
│   └── token-error.tsx
├── invitation/
│   ├── SimpleScan.tsx
│   ├── qr-scanner.tsx
│   └── scanner-overlay.tsx
├── invitations/
│   ├── create-invitation-form.tsx
│   └── magic-link-auth.tsx
├── layout/
│   ├── base-layout.tsx
│   ├── dashboard-layout.tsx
│   ├── dashboard-page-layout.tsx
│   ├── guest-header.tsx
│   ├── header-suppressor.tsx
│   ├── index.ts
│   ├── main-nav.tsx
│   ├── protected-layout.tsx
│   └── sidebar-context.tsx
├── maps/
│   ├── EventMap.tsx
│   ├── EventsMapSection.tsx
│   └── mock-data.ts
├── marketing/
│   ├── contact-form.tsx
│   └── newsletter-form.tsx
├── media/
│   ├── AlbumCreationForm.tsx
│   ├── EnhancedModerationCard.tsx
│   ├── MediaActionHandler.tsx
│   ├── MediaCard.tsx
│   ├── MediaDetailsDialog.tsx
│   ├── MediaEditDialog.tsx
│   ├── MediaGrid.tsx
│   ├── MediaModerationGrid.tsx
│   ├── MediaUploader.tsx
│   ├── MediaViewer.tsx
│   ├── ModerationCard.tsx
│   ├── camera-capture.tsx
│   ├── camera-test.tsx
│   ├── index.ts
│   └── upload-media-button.tsx
├── moderation/
│   ├── BatchActionControls.tsx
│   ├── BatchSelectionProvider.tsx
│   └── ModerationStats.tsx
├── nav/
│   ├── logo.tsx
│   ├── main-nav.tsx
│   ├── nav-item.tsx
│   ├── side-nav.tsx
│   └── user-nav.tsx
├── notifications/
│   ├── create-template.tsx
│   ├── full-preview.tsx
│   ├── notification-item.tsx
│   ├── notifications-content.tsx
│   ├── template-editor.tsx
│   └── template-preview.tsx
├── onboarding/
│   ├── steps/
│   │   ├── completion.tsx
│   │   ├── event-setup.tsx
│   │   └── profile-setup.tsx
│   └── onboarding-flow.tsx
├── providers/
│   ├── query-provider.tsx
│   ├── toast-provider.tsx
│   └── tooltip-provider.tsx
├── rsvp/
│   └── rsvp-form.tsx
├── settings/
│   └── system-status.tsx
├── ui/
│   ├── contact/
│   │   └── page.tsx
│   ├── accordion.tsx
│   ├── alert-dialog.tsx
│   ├── alert.tsx
│   ├── aspect-ratio.tsx
│   ├── avatar.tsx
│   ├── badge.tsx
│   ├── button.tsx
│   ├── calendar.tsx
│   ├── card.tsx
│   ├── chart.tsx
│   ├── charts.tsx
│   ├── checkbox.tsx
│   ├── collapsible.tsx
│   ├── command.tsx
│   ├── data-table.tsx
│   ├── dialog.tsx
│   ├── dropdown-menu.tsx
│   ├── empty-state.tsx
│   ├── form.tsx
│   ├── icons.tsx
│   ├── image-placeholder.tsx
│   ├── index.ts
│   ├── input.tsx
│   ├── label.tsx
│   ├── loading-spinner.tsx
│   ├── mobile-nav.tsx
│   ├── mode-toggle.tsx
│   ├── navigation-menu.tsx
│   ├── newsletter-form.tsx
│   ├── popover.tsx
│   ├── progress.tsx
│   ├── radio-group.tsx
│   ├── scroll-area.tsx
│   ├── select.tsx
│   ├── separator.tsx
│   ├── sheet.tsx
│   ├── sidebar.tsx
│   ├── site-footer.tsx
│   ├── site-header.tsx
│   ├── skeleton.tsx
│   ├── slider.tsx
│   ├── sonner.tsx
│   ├── spinner.tsx
│   ├── staff-role-badge.tsx
│   ├── switch.tsx
│   ├── table.tsx
│   ├── tabs.tsx
│   ├── textarea.tsx
│   ├── toast.tsx
│   ├── toaster.tsx
│   ├── tooltip.tsx
│   └── use-toast.ts
├── app-sidebar.tsx
├── area_chart_interactive.tsx
├── cookie-consent.tsx
├── debug-info.tsx
├── error-boundary.tsx
├── query-provider.tsx
├── shell.tsx
├── theme-provider.tsx
└── theme-toggle.tsx

28 directories, 222 files

```

## File Type Breakdown
- ts: 9 file(s)
- tsx: 212 file(s)
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
