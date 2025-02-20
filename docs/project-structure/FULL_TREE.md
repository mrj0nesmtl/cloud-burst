# full Directory Structure

```
.
├── CHANGELOG.md
├── LICENSE
├── README.md
├── cloud-burst.code-workspace
├── components.json
├── docs
│   ├── README.md
│   ├── architecture
│   │   ├── application_design_document.md
│   │   └── system_architecture_flowchart.md
│   ├── archive
│   │   └── 2024-02-20
│   │       └── development
│   │           └── auth-debug-pre-reset.md
│   ├── auth-cleanup.md
│   ├── deployment
│   │   └── REPLIT_DEPLOYMENT.md
│   ├── design
│   │   └── website_overview.md
│   ├── development
│   │   ├── STATUS_NOTES.md
│   │   ├── UI_components.md
│   │   ├── VERSION_CONTROL.md
│   │   ├── auth-debug.md
│   │   ├── prompt_archive
│   │   │   ├── additional_notes.md
│   │   │   ├── session 3.md
│   │   │   ├── session_1_prompt.md
│   │   │   ├── session_4.md
│   │   │   ├── session_5.md
│   │   │   ├── session_6.md
│   │   │   ├── session_7.md
│   │   │   ├── session_8.md
│   │   │   └── session_9.md
│   │   ├── session_10.md
│   │   ├── session_11_checklist.md
│   │   └── session_11_kickoff.md
│   ├── planning
│   │   ├── business_proposition.md
│   │   ├── ca-en-merchant-fees-15-oct-2024.pdf
│   │   ├── payment_subscription_design_document.md
│   │   ├── pitch_deck_draft.md
│   │   ├── project_budget_overview.md
│   │   ├── request_for_product_RFP.md
│   │   ├── roadmap.md
│   │   └── statement_or_work.md
│   ├── project-structure
│   │   ├── DOCS_TREE.md
│   │   ├── FULL_TREE.md
│   │   ├── README.md
│   │   ├── SRC_TREE.md
│   │   ├── cursor_tree.md
│   │   ├── github_tree.md
│   │   └── public_tree.md
│   └── user-flows
│       ├── invited_user_flow_design_document.md
│       ├── photo_upload_sequence_diagram.md
│       ├── user_flow_chart.md
│       └── user_flow_overview.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── public
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
│   ├── images
│   │   └── pexels-themo1-bg.jpg
│   ├── manifest.json
│   ├── next.svg
│   ├── pexels-themo-bg.jpg
│   ├── qrcode_paypal.png
│   ├── robots.txt
│   ├── site.webmanifest
│   ├── sitemap.xml
│   ├── vercel.svg
│   └── window.svg
├── replit.nix
├── scripts
│   ├── generate-favicons.sh
│   ├── generate-structure.js
│   └── types
│       └── tree-cli.d.ts
├── src
│   ├── app
│   │   ├── auth
│   │   │   ├── callback
│   │   │   │   └── route.ts
│   │   │   ├── layout.tsx
│   │   │   ├── register
│   │   │   │   └── page.tsx
│   │   │   └── signin
│   │   │       └── page.tsx
│   │   ├── auth-test
│   │   │   └── page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── legal
│   │   │   ├── cookies
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── privacy
│   │   │   │   └── page.tsx
│   │   │   └── terms
│   │   │       └── page.tsx
│   │   ├── marketing
│   │   │   ├── about
│   │   │   │   └── page.tsx
│   │   │   ├── contact
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── pricing
│   │   │       └── page.tsx
│   │   ├── page.tsx
│   │   └── protected
│   │       ├── admin
│   │       │   ├── components
│   │       │   │   ├── audit-log-columns.tsx
│   │       │   │   └── audit-log-viewer.tsx
│   │       │   ├── layout.tsx
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── dashboard
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── events
│   │       │   ├── loading.tsx
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       ├── profile
│   │       │   └── page.tsx
│   │       └── settings
│   │           ├── loading.tsx
│   │           └── page.tsx
│   ├── components
│   │   ├── auth
│   │   │   ├── auth-debug.tsx
│   │   │   ├── auth-form.tsx
│   │   │   ├── debug-panel.tsx
│   │   │   └── social-auth-buttons.tsx
│   │   ├── cookie-consent.tsx
│   │   ├── error-boundary.tsx
│   │   ├── forms
│   │   │   ├── avatar-upload.tsx
│   │   │   ├── notifications-form.tsx
│   │   │   ├── preferences-form.tsx
│   │   │   └── profile-form.tsx
│   │   ├── nav
│   │   │   ├── main-nav.tsx
│   │   │   └── user-nav.tsx
│   │   ├── providers
│   │   │   └── toast-provider.tsx
│   │   ├── theme-provider.tsx
│   │   └── ui
│   │       ├── alert.tsx
│   │       ├── aspect-ratio.tsx
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── checkbox.tsx
│   │       ├── contact
│   │       │   └── page.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── loading-spinner.tsx
│   │       ├── mobile-nav.tsx
│   │       ├── mode-toggle.tsx
│   │       ├── navigation-menu.tsx
│   │       ├── newsletter-form.tsx
│   │       ├── radio-group.tsx
│   │       ├── scroll-area.tsx
│   │       ├── select.tsx
│   │       ├── separator.tsx
│   │       ├── sheet.tsx
│   │       ├── site-footer.tsx
│   │       ├── site-header.tsx
│   │       ├── skeleton.tsx
│   │       ├── switch.tsx
│   │       ├── textarea.tsx
│   │       ├── toast.tsx
│   │       └── toaster.tsx
│   ├── contexts
│   ├── hooks
│   │   ├── use-analytics.ts
│   │   ├── use-permissions.ts
│   │   ├── use-profile.ts
│   │   ├── use-toast.ts
│   │   └── use-update-profile.ts
│   ├── lib
│   │   ├── auth
│   │   ├── supabase
│   │   │   ├── client.ts
│   │   │   └── debug-queries.ts
│   │   └── utils.ts
│   ├── middleware.ts
│   └── types
│       ├── auth.ts
│       └── supabase.ts
├── supabase-exports
│   ├── supabase-auth-schema-bxvbovzqzjfomnqidzzx (1).png
│   └── supabase-public-schema-bxvbovzqzjfomnqidzzx.png
├── tailwind.config.ts
└── tsconfig.json

53 directories, 165 files

```