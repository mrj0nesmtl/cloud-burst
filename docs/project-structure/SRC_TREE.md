# src Directory Structure
Generated: 2025-02-28T01:00:25.736Z

```
./src/
├── app/
│   ├── auth/
│   │   ├── callback/
│   │   │   └── route.ts
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── signin/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── dev/
│   │   └── setup/
│   │       └── route.ts
│   ├── legal/
│   │   ├── cookies/
│   │   │   └── page.tsx
│   │   ├── privacy/
│   │   │   └── page.tsx
│   │   ├── terms/
│   │   │   └── page.tsx
│   │   └── layout.tsx
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
│   │   │   ├── events/
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
│   │   ├── dashboard/
│   │   │   ├── overview/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── [id]/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── manage/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   ├── settings/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── account/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── billing/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── notifications/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── metadata.ts
│   └── page.tsx
├── components/
│   ├── auth/
│   │   ├── auth-debug.tsx
│   │   ├── auth-form.tsx
│   │   ├── auth-guard.tsx
│   │   ├── debug-panel.tsx
│   │   ├── role-guard.tsx
│   │   └── social-auth-buttons.tsx
│   ├── forms/
│   │   ├── avatar-upload.tsx
│   │   ├── notifications-form.tsx
│   │   ├── preferences-form.tsx
│   │   └── profile-form.tsx
│   ├── nav/
│   │   ├── main-nav.tsx
│   │   ├── side-nav.tsx
│   │   └── user-nav.tsx
│   ├── providers/
│   │   └── toast-provider.tsx
│   ├── ui/
│   │   ├── contact/
│   │   │   └── page.tsx
│   │   ├── accordion.tsx
│   │   ├── alert.tsx
│   │   ├── aspect-ratio.tsx
│   │   ├── avatar.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── loading-spinner.tsx
│   │   ├── mobile-nav.tsx
│   │   ├── mode-toggle.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── newsletter-form.tsx
│   │   ├── radio-group.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── site-footer.tsx
│   │   ├── site-header.tsx
│   │   ├── skeleton.tsx
│   │   ├── switch.tsx
│   │   ├── textarea.tsx
│   │   ├── toast.tsx
│   │   └── toaster.tsx
│   ├── cookie-consent.tsx
│   ├── error-boundary.tsx
│   └── theme-provider.tsx
├── hooks/
│   ├── __tests__/
│   │   └── use-permissions.test.ts
│   ├── use-analytics.ts
│   ├── use-permissions.ts
│   ├── use-profile.ts
│   ├── use-toast.ts
│   └── use-update-profile.ts
├── lib/
│   ├── supabase/
│   │   ├── __tests__/
│   │   │   └── auth-store.test.ts
│   │   ├── auth-store.ts
│   │   ├── client.ts
│   │   ├── debug-queries.ts
│   │   └── test-utils.ts
│   └── utils.ts
├── types/
│   ├── auth.ts
│   └── supabase.ts
├── .DS_Store
├── middleware.test.ts
└── middleware.ts

51 directories, 121 files

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
