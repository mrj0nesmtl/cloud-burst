# src Directory Structure
Generated: 2025-03-11T06:00:32.322Z

```
./src/
├── app/
│   ├── api/
│   │   ├── cron/
│   │   │   └── sync-templates/
│   │   │       └── route.ts
│   │   ├── db/
│   │   │   ├── functions/
│   │   │   │   └── route.ts
│   │   │   └── setup/
│   │   │       └── route.ts
│   │   ├── extract-colors/
│   │   │   └── route.ts
│   │   └── templates/
│   │       ├── [templateId]/
│   │       │   └── html/
│   │       │       └── route.ts
│   │       └── sync/
│   │           └── route.ts
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts
│   │   ├── register/
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
│   │   ├── [id]/
│   │   │   ├── gallery/
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
│   │   ├── attendees/
│   │   │   └── invitations/
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
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── overview/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── settings/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── qr-codes/
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
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── templates/
│   │   │   └── page.tsx
│   │   └── layout.tsx
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
│   │   ├── role-guard.tsx
│   │   └── social-auth-buttons.tsx
│   ├── dashboard/
│   │   ├── activity-feed.tsx
│   │   ├── analytics-overview.tsx
│   │   ├── contact-stats.tsx
│   │   ├── contact-submissions.tsx
│   │   ├── dashboard-stats.tsx
│   │   ├── event-summary.tsx
│   │   ├── newsletter-stats.tsx
│   │   ├── newsletter-subscribers.tsx
│   │   ├── quick-actions.tsx
│   │   ├── recent-activity.tsx
│   │   └── recent-events.tsx
│   ├── events/
│   │   ├── add-attendee-dialog.tsx
│   │   ├── attendee-management.tsx
│   │   ├── enhanced-event-card.tsx
│   │   ├── event-actions.tsx
│   │   ├── event-card.tsx
│   │   ├── event-details.tsx
│   │   ├── event-filters.tsx
│   │   ├── event-form.tsx
│   │   ├── event-list-client.tsx
│   │   ├── event-list.tsx
│   │   ├── event-search.tsx
│   │   ├── event-status-selector.tsx
│   │   ├── image-upload.tsx
│   │   └── qr-code-display.tsx
│   ├── forms/
│   │   ├── avatar-upload.tsx
│   │   ├── event-customization-form.tsx
│   │   ├── event-form.tsx
│   │   ├── notifications-form.tsx
│   │   ├── preferences-form.tsx
│   │   ├── profile-form.tsx
│   │   └── security-form.tsx
│   ├── gallery/
│   │   ├── gallery-grid.tsx
│   │   ├── index.ts
│   │   ├── optimized-image.tsx
│   │   ├── photo-lightbox.tsx
│   │   ├── upload-dropzone.tsx
│   │   └── upload-with-tags.tsx
│   ├── layout/
│   │   ├── dashboard-layout.tsx
│   │   └── main-nav.tsx
│   ├── marketing/
│   │   ├── contact-form.tsx
│   │   └── newsletter-form.tsx
│   ├── nav/
│   │   ├── logo.tsx
│   │   ├── main-nav.tsx
│   │   ├── side-nav.tsx
│   │   └── user-nav.tsx
│   ├── notifications/
│   │   ├── create-template.tsx
│   │   ├── full-preview.tsx
│   │   ├── notification-item.tsx
│   │   ├── notifications-content.tsx
│   │   ├── template-editor.tsx
│   │   └── template-preview.tsx
│   ├── providers/
│   │   ├── query-provider.tsx
│   │   ├── toast-provider.tsx
│   │   └── tooltip-provider.tsx
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
│   │   ├── charts.tsx
│   │   ├── checkbox.tsx
│   │   ├── command.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
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
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   ├── skeleton.tsx
│   │   ├── slider.tsx
│   │   ├── sonner.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   ├── toaster.tsx
│   │   ├── tooltip.tsx
│   │   └── use-toast.ts
│   ├── cookie-consent.tsx
│   ├── debug-info.tsx
│   ├── error-boundary.tsx
│   ├── query-provider.tsx
│   └── theme-provider.tsx
├── hooks/
│   ├── __tests__/
│   │   └── use-permissions.test.ts
│   ├── use-analytics.ts
│   ├── use-auth.ts
│   ├── use-permissions.ts
│   ├── use-profile.ts
│   ├── use-toast.ts
│   └── use-update-profile.ts
├── lib/
│   ├── ai/
│   │   ├── color-extraction.ts
│   │   └── photo-enhancement.ts
│   ├── realtime/
│   │   └── event-collaboration.ts
│   ├── supabase/
│   │   ├── __tests__/
│   │   │   ├── auth-store.test.ts
│   │   │   └── events.test.ts
│   │   ├── auth-store.ts
│   │   ├── client.ts
│   │   ├── debug-queries.ts
│   │   ├── events.ts
│   │   ├── photos.ts
│   │   ├── run-migration.js
│   │   ├── search.ts
│   │   ├── server.ts
│   │   ├── templates.ts
│   │   ├── test-utils.ts
│   │   ├── verify-schema.html
│   │   └── verify-schema.js
│   ├── analytics.ts
│   ├── event-customization-server.ts
│   ├── event-customization.ts
│   ├── qr-code.ts
│   ├── security-settings.ts
│   ├── user-sessions.ts
│   └── utils.ts
├── scripts/
│   └── mobile-menu.js
├── store/
│   ├── events-store.ts
│   ├── index.ts
│   └── photos-store.ts
├── styles/
│   └── layout.css
├── types/
│   ├── auth.ts
│   ├── events.ts
│   ├── notifications.ts
│   ├── search.ts
│   └── supabase.ts
├── .DS_Store
├── middleware.test.ts
└── middleware.ts

97 directories, 263 files

```

## File Types
- *.ts
- *.tsx
- *.js
- *.jsx
- *.json
- *.md
- *.mdx
- *.css
- *.scss
- *.yaml
- *.yml

## Ignored Patterns
- node_modules
- .git
- .next
- dist
- coverage
- .vercel
- .env*
- *.log
