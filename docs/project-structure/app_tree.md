# app Directory Structure
Generated: 2025-03-03T18:02:32.950Z

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
│   └── templates/
│       ├── [templateId]/
│       │   └── html/
│       │       └── route.ts
│       └── sync/
│           └── route.ts
├── auth/
│   ├── callback/
│   │   └── route.ts
│   ├── register/
│   │   └── page.tsx
│   ├── signin/
│   │   └── page.tsx
│   └── layout.tsx
├── dashboard/
│   └── page.tsx
├── dev/
│   └── setup/
│       └── route.ts
├── events/
│   ├── [id]/
│   │   ├── gallery/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── not-found.tsx
│   ├── layout.tsx
│   └── page.tsx
├── legal/
│   ├── cookies/
│   │   └── page.tsx
│   ├── privacy/
│   │   └── page.tsx
│   ├── terms/
│   │   └── page.tsx
│   └── layout.tsx
├── marketing/
│   ├── about/
│   │   └── page.tsx
│   ├── contact/
│   │   └── page.tsx
│   ├── pricing/
│   │   └── page.tsx
│   ├── layout.tsx
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
│   ├── dashboard/
│   │   ├── overview/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── events/
│   │   ├── [id]/
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
│   │   ├── layout.tsx
│   │   ├── loading.tsx
│   │   └── page.tsx
│   ├── profile/
│   │   ├── settings/
│   │   │   ├── loading.tsx
│   │   │   └── page.tsx
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
│   │   ├── loading.tsx
│   │   └── page.tsx
│   └── layout.tsx
├── globals.css
├── layout.tsx
├── metadata.ts
├── not-found.tsx
└── page.tsx

55 directories, 82 files

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
