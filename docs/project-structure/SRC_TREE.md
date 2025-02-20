# src Directory Structure

```
./src
├── app
│   ├── auth
│   │   ├── callback
│   │   │   └── route.ts
│   │   ├── layout.tsx
│   │   ├── register
│   │   │   └── page.tsx
│   │   └── signin
│   │       └── page.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── legal
│   │   ├── cookies
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── privacy
│   │   │   └── page.tsx
│   │   └── terms
│   │       └── page.tsx
│   ├── marketing
│   │   ├── about
│   │   │   └── page.tsx
│   │   ├── contact
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── pricing
│   │       └── page.tsx
│   ├── page.tsx
│   └── protected
│       ├── admin
│       │   ├── components
│       │   │   ├── audit-log-columns.tsx
│       │   │   └── audit-log-viewer.tsx
│       │   ├── layout.tsx
│       │   ├── loading.tsx
│       │   └── page.tsx
│       ├── dashboard
│       │   ├── loading.tsx
│       │   └── page.tsx
│       ├── events
│       │   ├── loading.tsx
│       │   └── page.tsx
│       ├── layout.tsx
│       ├── profile
│       │   └── page.tsx
│       └── settings
│           ├── loading.tsx
│           └── page.tsx
├── components
│   ├── auth
│   │   ├── auth-debug.tsx
│   │   ├── email-auth-form.tsx
│   │   ├── login-form.tsx
│   │   ├── role-guard.tsx
│   │   └── social-auth-buttons.tsx
│   ├── cookie-consent.tsx
│   ├── error-boundary.tsx
│   ├── nav
│   │   ├── main-nav.tsx
│   │   └── user-nav.tsx
│   ├── providers
│   │   └── toast-provider.tsx
│   ├── theme-provider.tsx
│   └── ui
│       ├── alert.tsx
│       ├── aspect-ratio.tsx
│       ├── avatar.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── checkbox.tsx
│       ├── contact
│       │   └── page.tsx
│       ├── dialog.tsx
│       ├── dropdown-menu.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── loading-spinner.tsx
│       ├── mobile-nav.tsx
│       ├── mode-toggle.tsx
│       ├── navigation-menu.tsx
│       ├── newsletter-form.tsx
│       ├── radio-group.tsx
│       ├── scroll-area.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── site-footer.tsx
│       ├── site-header.tsx
│       ├── skeleton.tsx
│       ├── switch.tsx
│       ├── textarea.tsx
│       ├── toast.tsx
│       └── toaster.tsx
├── contexts
│   └── auth-context.tsx
├── hooks
│   ├── use-analytics.ts
│   ├── use-permissions.ts
│   └── use-toast.ts
├── lib
│   ├── auth
│   │   ├── auth-store.ts
│   │   └── session.ts
│   ├── supabase
│   │   ├── config.ts
│   │   └── server-config.ts
│   └── utils.ts
├── middleware.ts
└── types
    ├── auth.ts
    └── supabase.ts

33 directories, 81 files

```