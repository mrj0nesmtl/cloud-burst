# full Directory Structure
Generated: 2025-02-23T19:16:31.826Z

```
./
├── .cursor/
│   └── rules/
│       ├── README.md
│       ├── accessibility.mdc
│       ├── ai-collaboration-guidelines.mdc
│       ├── api.mdc
│       ├── code-style.mdc
│       ├── deployment.mdc
│       ├── documentation-standards.mdc
│       ├── performance-standards.mdc
│       ├── react-components.mdc
│       ├── security.mdc
│       ├── state-management.mdc
│       ├── testing.mdc
│       └── typescript.mdc
├── .github/
│   ├── workflows/
│   │   └── versioning.yml
│   └── dependabot.yml
├── docs/
│   ├── architecture/
│   │   ├── application_design_document.md
│   │   └── system_architecture_flowchart.md
│   ├── deployment/
│   │   └── replit_deployment.md
│   ├── design/
│   │   └── website_overview.md
│   ├── development/
│   │   ├── prompt_archive/
│   │   │   ├── additional_notes.md
│   │   │   ├── auth-debug.md
│   │   │   ├── session 3.md
│   │   │   ├── session_10.md
│   │   │   ├── session_11_checklist.md
│   │   │   ├── session_11_kickoff.md
│   │   │   ├── session_1_prompt.md
│   │   │   ├── session_4.md
│   │   │   ├── session_5.md
│   │   │   ├── session_6.md
│   │   │   ├── session_7.md
│   │   │   ├── session_8.md
│   │   │   └── session_9.md
│   │   ├── STATUS_NOTES.md
│   │   ├── UI_components.md
│   │   ├── VERSION_CONTROL.md
│   │   ├── session_12_checklist.md
│   │   └── session_12_kickoff.md
│   ├── planning/
│   │   ├── business_proposition.md
│   │   ├── ca-en-merchant-fees-15-oct-2024.pdf
│   │   ├── payment_subscription_design_document.md
│   │   ├── pitch_deck_draft.md
│   │   ├── project_budget_overview.md
│   │   ├── request_for_product_RFP.md
│   │   ├── roadmap.md
│   │   └── statement_or_work.md
│   ├── project-structure/
│   │   └── README.md
│   ├── user-flows/
│   │   ├── invited_user_flow_design_document.md
│   │   ├── photo_upload_sequence_diagram.md
│   │   ├── user_flow_chart.md
│   │   └── user_flow_overview.md
│   ├── README.md
│   └── auth-cleanup.md
├── public/
│   ├── images/
│   │   └── pexels-themo1-bg.jpg
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── cloud-lightning.png
│   ├── cloud-lightning.svg
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── manifest.json
│   ├── next.svg
│   ├── pexels-themo-bg.jpg
│   ├── qrcode_paypal.png
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── sitemap.xml
│   ├── vercel.svg
│   └── window.svg
├── scripts/
│   ├── types/
│   │   └── tree-cli.d.ts
│   ├── generate-favicons.sh*
│   └── generate-structure.js
├── src/
│   ├── app/
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── legal/
│   │   │   ├── cookies/
│   │   │   │   └── page.tsx
│   │   │   ├── privacy/
│   │   │   │   └── page.tsx
│   │   │   ├── terms/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── marketing/
│   │   │   ├── about/
│   │   │   │   └── page.tsx
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── pricing/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── protected/
│   │   │   ├── admin/
│   │   │   │   ├── components/
│   │   │   │   │   ├── audit-log-columns.tsx
│   │   │   │   │   └── audit-log-viewer.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── metadata.ts
│   │   ├── page.tsx
│   │   └── version-sync.plan
│   ├── components/
│   │   ├── auth/
│   │   │   ├── auth-debug.tsx
│   │   │   ├── auth-form.tsx
│   │   │   ├── debug-panel.tsx
│   │   │   └── social-auth-buttons.tsx
│   │   ├── forms/
│   │   │   ├── avatar-upload.tsx
│   │   │   ├── notifications-form.tsx
│   │   │   ├── preferences-form.tsx
│   │   │   └── profile-form.tsx
│   │   ├── nav/
│   │   │   ├── main-nav.tsx
│   │   │   └── user-nav.tsx
│   │   ├── providers/
│   │   │   └── toast-provider.tsx
│   │   ├── ui/
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── loading-spinner.tsx
│   │   │   ├── mobile-nav.tsx
│   │   │   ├── mode-toggle.tsx
│   │   │   ├── navigation-menu.tsx
│   │   │   ├── newsletter-form.tsx
│   │   │   ├── radio-group.tsx
│   │   │   ├── scroll-area.tsx
│   │   │   ├── select.tsx
│   │   │   ├── separator.tsx
│   │   │   ├── sheet.tsx
│   │   │   ├── site-footer.tsx
│   │   │   ├── site-header.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   └── toaster.tsx
│   │   ├── cookie-consent.tsx
│   │   ├── error-boundary.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   ├── use-analytics.ts
│   │   ├── use-permissions.ts
│   │   ├── use-profile.ts
│   │   ├── use-toast.ts
│   │   └── use-update-profile.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── debug-queries.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── supabase.ts
│   ├── .DS_Store
│   └── middleware.ts
├── supabase-exports/
│   ├── .DS_Store
│   ├── supabase-auth-schema-bxvbovzqzjfomnqidzzx (1).png
│   └── supabase-public-schema-bxvbovzqzjfomnqidzzx.png
├── .DS_Store
├── .gitignore
├── .replit
├── CHANGELOG.md
├── LICENSE
├── README.md
├── cloud-burst.code-workspace
├── components.json
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── postcss.config.mjs
├── replit.nix
├── tailwind.config.js
├── tailwind.config.ts
└── tsconfig.json

51 directories, 183 files

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
