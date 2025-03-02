# full Directory Structure
Generated: 2025-03-02T04:54:00.278Z

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
│   │   ├── security.md
│   │   └── system_architecture_flowchart.md
│   ├── deployment/
│   │   ├── BUILD_CONFIGURATION.md
│   │   ├── ENVIRONMENT_SETUP.md
│   │   ├── README.md
│   │   ├── REPLIT_DEPLOYMENT.md
│   │   └── quick_start.md
│   ├── design/
│   │   ├── UI_components.md
│   │   ├── dashboard_components.md
│   │   ├── style.md
│   │   └── website_overview.md
│   ├── development/
│   │   ├── prompt_archive/
│   │   │   ├── additional_notes.md
│   │   │   ├── auth-debug.md
│   │   │   ├── session 3.md
│   │   │   ├── session_10.md
│   │   │   ├── session_11_checklist.md
│   │   │   ├── session_11_kickoff.md
│   │   │   ├── session_12_checklist.md
│   │   │   ├── session_12_kickoff.md
│   │   │   ├── session_13_checklist.md
│   │   │   ├── session_13_context.md
│   │   │   ├── session_13_kickoff.md
│   │   │   ├── session_14_checklist.md
│   │   │   ├── session_14_kickoff.md
│   │   │   ├── session_15_checklist.md
│   │   │   ├── session_15_kickoff.md
│   │   │   ├── session_1_prompt.md
│   │   │   ├── session_4.md
│   │   │   ├── session_5.md
│   │   │   ├── session_6.md
│   │   │   ├── session_7.md
│   │   │   ├── session_8.md
│   │   │   └── session_9.md
│   │   ├── .DS_Store
│   │   ├── STATUS_NOTES.md
│   │   ├── VERSION_CONTROL.md
│   │   ├── contributing.md
│   │   ├── session_16_checklist.md
│   │   ├── session_16_kickoff.md
│   │   └── version-sync.plan
│   ├── planning/
│   │   ├── auth-cleanup.md
│   │   ├── business_proposition.md
│   │   ├── ca-en-merchant-fees-15-oct-2024.pdf
│   │   ├── payment_subscription_design_document.md
│   │   ├── pitch_deck_draft.md
│   │   ├── project_budget_overview.md
│   │   ├── request_for_product_RFP.md
│   │   ├── roadmap.md
│   │   └── statement_of_work.md
│   ├── project-structure/
│   │   ├── README.md
│   │   ├── app_tree.md
│   │   ├── architecture_tree.md
│   │   ├── components_tree.md
│   │   ├── cursor_tree.md
│   │   ├── development_tree.md
│   │   ├── docs_tree.md
│   │   ├── full_tree.md
│   │   ├── github_tree.md
│   │   ├── hooks_tree.md
│   │   ├── lib_tree.md
│   │   ├── planning_tree.md
│   │   ├── public_tree.md
│   │   ├── src_tree.md
│   │   └── types_tree.md
│   ├── user-flows/
│   │   ├── invited_user_flow_design_document.md
│   │   ├── photo_upload_sequence_diagram.md
│   │   ├── role_based_access.md
│   │   ├── user_flow_chart.md
│   │   └── user_flow_overview.md
│   ├── .DS_Store
│   └── README.md
├── public/
│   ├── images/
│   │   ├── fallback-hero.jpg
│   │   └── pexels-themo1-bg.jpg
│   ├── .DS_Store
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── cloud-lightning.png
│   ├── cloud-lightning.svg
│   ├── cloudburst_event.MP4
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── file.svg
│   ├── globe.svg
│   ├── hero_bg.mp4
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
│   ├── .DS_Store
│   ├── generate-favicons.sh*
│   └── generate-structure.mjs
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── cron/
│   │   │   │   └── sync-templates/
│   │   │   │       └── route.ts
│   │   │   ├── db/
│   │   │   │   ├── functions/
│   │   │   │   │   └── route.ts
│   │   │   │   └── setup/
│   │   │   │       └── route.ts
│   │   │   └── templates/
│   │   │       ├── [templateId]/
│   │   │       │   └── html/
│   │   │       │       └── route.ts
│   │   │       └── sync/
│   │   │           └── route.ts
│   │   ├── auth/
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   ├── signin/
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── dev/
│   │   │   └── setup/
│   │   │       └── route.ts
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
│   │   │   │   ├── audit-logs/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── components/
│   │   │   │   │   ├── audit-log-columns.tsx
│   │   │   │   │   └── audit-log-viewer.tsx
│   │   │   │   ├── contacts/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── events/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── newsletter/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── photos/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── roles/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── users/
│   │   │   │   │   ├── [id]/
│   │   │   │   │   │   └── page.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── overview/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── events/
│   │   │   │   ├── [id]/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── create/
│   │   │   │   │   ├── .page.tsx.swp
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── page_tsx.swp
│   │   │   │   ├── manage/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── profile/
│   │   │   │   ├── settings/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── settings/
│   │   │   │   ├── account/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── billing/
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── notifications/
│   │   │   │   │   ├── templates/
│   │   │   │   │   │   ├── change-email.html
│   │   │   │   │   │   ├── confirm-signup.html
│   │   │   │   │   │   ├── invite.html
│   │   │   │   │   │   ├── magic-link.html
│   │   │   │   │   │   └── reset-password.html
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── metadata.ts
│   │   └── page.tsx
│   ├── components/
│   │   ├── auth/
│   │   │   ├── auth-debug.tsx
│   │   │   ├── auth-form.tsx
│   │   │   ├── auth-guard.tsx
│   │   │   ├── debug-panel.tsx
│   │   │   ├── role-guard.tsx
│   │   │   └── social-auth-buttons.tsx
│   │   ├── dashboard/
│   │   │   ├── analytics-overview.tsx
│   │   │   ├── contact-stats.tsx
│   │   │   ├── contact-submissions.tsx
│   │   │   ├── newsletter-stats.tsx
│   │   │   ├── newsletter-subscribers.tsx
│   │   │   └── recent-activity.tsx
│   │   ├── events/
│   │   │   └── event-actions.tsx
│   │   ├── forms/
│   │   │   ├── avatar-upload.tsx
│   │   │   ├── event-customization-form.tsx
│   │   │   ├── event-form.tsx
│   │   │   ├── notifications-form.tsx
│   │   │   ├── preferences-form.tsx
│   │   │   ├── profile-form.tsx
│   │   │   └── security-form.tsx
│   │   ├── layout/
│   │   │   └── dashboard-layout.tsx
│   │   ├── marketing/
│   │   │   ├── contact-form.tsx
│   │   │   └── newsletter-form.tsx
│   │   ├── nav/
│   │   │   ├── main-nav.tsx
│   │   │   ├── side-nav.tsx
│   │   │   └── user-nav.tsx
│   │   ├── notifications/
│   │   │   ├── create-template.tsx
│   │   │   ├── full-preview.tsx
│   │   │   ├── notifications-content.tsx
│   │   │   ├── template-editor.tsx
│   │   │   └── template-preview.tsx
│   │   ├── providers/
│   │   │   ├── query-provider.tsx
│   │   │   ├── react-query-devtools.tsx
│   │   │   └── toast-provider.tsx
│   │   ├── ui/
│   │   │   ├── contact/
│   │   │   │   └── page.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── alert.tsx
│   │   │   ├── aspect-ratio.tsx
│   │   │   ├── avatar.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── checkbox.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── form.tsx
│   │   │   ├── icons.tsx
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
│   │   │   ├── slider.tsx
│   │   │   ├── sonner.tsx
│   │   │   ├── switch.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── textarea.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── toaster.tsx
│   │   │   └── use-toast.ts
│   │   ├── cookie-consent.tsx
│   │   ├── error-boundary.tsx
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   ├── __tests__/
│   │   │   └── use-permissions.test.ts
│   │   ├── use-analytics.ts
│   │   ├── use-auth.ts
│   │   ├── use-permissions.ts
│   │   ├── use-profile.ts
│   │   ├── use-toast.ts
│   │   └── use-update-profile.ts
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── __tests__/
│   │   │   │   └── auth-store.test.ts
│   │   │   ├── migrations/
│   │   │   │   ├── 01_forms_and_newsletter.sql
│   │   │   │   └── 02_analytics_functions.sql
│   │   │   ├── auth-store.ts
│   │   │   ├── client.ts
│   │   │   ├── debug-queries.ts
│   │   │   ├── templates.ts
│   │   │   └── test-utils.ts
│   │   ├── event-customization-server.ts
│   │   ├── event-customization.ts
│   │   ├── security-settings.ts
│   │   ├── user-sessions.ts
│   │   └── utils.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── supabase.ts
│   ├── .DS_Store
│   ├── middleware.test.ts
│   └── middleware.ts
├── supabase-exports/
│   ├── .DS_Store
│   ├── Policy Overview for Public Schema.csv
│   ├── profiles_rows.csv
│   ├── supabase-auth-schema-bxvbovzqzjfomnqidzzx (1).png
│   ├── supabase-public-schema-bxvbovzqzjfomnqidzzx.png
│   └── table_structures_and_relationships.csv
├── .DS_Store
├── .gitignore
├── .replit
├── CHANGELOG.md
├── LICENSE
├── README.md
├── cloud-burst.code-workspace
├── components.json
├── create_template_table.sql
├── eslint.config.mjs
├── event_customization_fix.sql
├── fix_template_table.sql
├── next-env.d.ts
├── next.config.js
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── replit.nix
├── tailwind.config.ts
└── tsconfig.json

91 directories, 316 files

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
