# Cloud Burst Project Structure Documentation

Generated on: 2025-04-02T19:36:28.033Z


## Core Project
- [full](full_tree.md)
- [src](src_tree.md)
- [docs](docs_tree.md)
- [public](public_tree.md)
- [github](github_tree.md)
- [cursor](cursor_tree.md)


## App Routes
- [app](app_tree.md)
- [protected](protected_tree.md)
- [gallery](gallery_tree.md)
- [events](events_tree.md)
- [dashboard](dashboard_tree.md)
- [auth](auth_tree.md)
- [events](events_tree.md)
- [scan](scan_tree.md)
- [invitation](invitation_tree.md)
- [invitation](invitation_tree.md)


## Protected Routes
- [protected](protected_tree.md)
- [gallery](gallery_tree.md)
- [events](events_tree.md)
- [dashboard](dashboard_tree.md)


## Components
- [components](components_tree.md)
- [gallery](gallery_tree.md)
- [events](events_tree.md)
- [ui](ui_tree.md)
- [auth](auth_tree.md)
- [dashboard](dashboard_tree.md)
- [invitation](invitation_tree.md)
- [camera](camera_tree.md)


## Utilities & Configuration
- [lib](lib_tree.md)
- [supabase](supabase_tree.md)
- [utils](utils_tree.md)
- [store](store_tree.md)
- [types](types_tree.md)
- [styles](styles_tree.md)
- [hooks](hooks_tree.md)


## Documentation
- [development](development_tree.md)
- [architecture](architecture_tree.md)
- [planning](planning_tree.md)


## QR/Camera Features
- [scan](scan_tree.md)
- [invitation](invitation_tree.md)
- [invitation](invitation_tree.md)
- [camera](camera_tree.md)
- [utils](utils_tree.md)
- [hooks](hooks_tree.md)


## Important Project Paths
- `src/app`: Next.js 14 App Router pages and routes
- `src/app/protected`: Authenticated routes requiring login
- `src/components/gallery`: Gallery system components
- `src/components/events`: Event management components
- `src/lib/supabase`: Supabase integration and data access
- `src/store`: Zustand state management
- `src/hooks`: Custom React hooks
- `src/hooks/useCamera.ts`: Camera access hook
- `src/hooks/useQrScanner.ts`: QR code scanning hook
- `src/lib/utils/qr-utils.ts`: QR code utilities
- `src/components/invitation/qr-scanner.tsx`: QR scanner component
- `src/app/scan`: QR code scanning page

## File Type Coverage
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

## Generation Script
```bash
npm run generate:structure
```

## Navigation Tips
- Browse components by functional area (gallery, events, auth)
- Explore protected routes to understand user workflows
- Review utility libraries in the lib section
- Examine QR and camera features in the dedicated section
