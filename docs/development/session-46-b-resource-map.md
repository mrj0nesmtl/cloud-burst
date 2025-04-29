# Session 46-B Resource Map: Gallery Media Proxy Bug

> **Version:** 0.9.8  
> **Date:** April 30, 2025  
> **Focus:** Resources for diagnosing and fixing the gallery media proxy bug

## Key Files & Components

### Gallery & Media Components
```
src/
  components/
    gallery/
      GalleryGrid.tsx           # Main gallery grid component
      MediaCard.tsx             # Individual media card (image display)
      GalleryPage.tsx           # Gallery page container
    moderation/
      ModerationCard.tsx        # For comparison with working proxy usage
  app/
    protected/
      gallery/
        events/
          [eventId]/
            page.tsx            # Event gallery page (bug location)
  lib/
    utils/
      media-proxy.ts            # getProxiedMediaUrl utility
    supabase/
      photos-client.ts          # Data fetching for gallery images
```

### API & Proxy
```
src/
  app/
    api/
      media-proxy/
        route.ts                # Media proxy API endpoint
```

### Type Definitions
```
src/
  types/
    media.ts                   # Media type definitions
    supabase.ts                # Supabase-generated types
```

## Relevant Documentation
- `docs/features/gallery.md`                # Gallery feature documentation
- `docs/architecture/media-proxy.md`        # Media proxy architecture
- `docs/project-structure/database-schema.md` # Database schema for media
- `docs/development/session-46-b-narrative.md` # Session narrative
- `docs/development/session-46-b-checklist.md` # Session checklist

## Testing & Debugging
- Console logs and network tab for 400 errors
- Compare image requests on working vs. broken pages
- E2E tests: `cypress/e2e/gallery.cy.ts`
- Unit tests: `src/components/gallery/__tests__/`

## Reference Implementations
- Working proxy usage in moderation and other pages
- Utility: `getProxiedMediaUrl` usage patterns

## Next Steps
- Use this map to guide diagnosis and refactor
- Ensure all gallery image requests are routed through the proxy 