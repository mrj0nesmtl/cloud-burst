# src Directory Structure
Generated: 2025-02-23T19:16:31.850Z

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
│   │   │   ├── components/
│   │   │   │   ├── audit-log-columns.tsx
│   │   │   │   └── audit-log-viewer.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── events/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── metadata.ts
│   ├── page.tsx
│   └── version-sync.plan
├── components/
│   ├── auth/
│   │   ├── auth-debug.tsx
│   │   ├── auth-form.tsx
│   │   ├── debug-panel.tsx
│   │   └── social-auth-buttons.tsx
│   ├── forms/
│   │   ├── avatar-upload.tsx
│   │   ├── notifications-form.tsx
│   │   ├── preferences-form.tsx
│   │   └── profile-form.tsx
│   ├── nav/
│   │   ├── main-nav.tsx
│   │   └── user-nav.tsx
│   ├── providers/
│   │   └── toast-provider.tsx
│   ├── ui/
│   │   ├── contact/
│   │   │   └── page.tsx
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
│   ├── use-analytics.ts
│   ├── use-permissions.ts
│   ├── use-profile.ts
│   ├── use-toast.ts
│   └── use-update-profile.ts
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── debug-queries.ts
│   └── utils.ts
├── types/
│   ├── auth.ts
│   └── supabase.ts
├── .DS_Store
└── middleware.ts

32 directories, 86 files

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
