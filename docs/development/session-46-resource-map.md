# Session 46 Resource Map: Moderation Interface & UX Enhancements

> **Version:** 0.9.7  
> **Date:** April 29, 2025  
> **Focus:** Implementation of Moderation Interface & UX Refinements

## Project Structure Overview

### Core Moderation Components
```
src/
  components/
    moderation/
      ModerationCard.tsx          # Individual media card with moderation controls
      ModerationGrid.tsx          # Grid layout for displaying media items
      BatchSelectionProvider.tsx  # Context for managing batch selections
      BatchActionControls.tsx     # UI controls for batch operations
      ModerationStats.tsx         # Display of moderation statistics
      ModerationFilters.tsx       # Filtering controls for moderation view
    gallery/
      MediaCard.tsx               # Base media card component
      MediaGrid.tsx               # Base grid layout for media display
    ui/
      Button.tsx                  # Used for moderation actions
      Dialog.tsx                  # For confirmation dialogs
      Checkbox.tsx                # For batch selection
```

### API Endpoints
```
src/
  app/
    api/
      gallery/
        media/
          approve/
            route.ts              # Endpoint for approving media
          reject/
            route.ts              # Endpoint for rejecting media
          reset/
            route.ts              # Endpoint for resetting moderation status
          delete/
            route.ts              # Endpoint for deleting media
```

### UI Pages
```
src/
  app/
    protected/
      gallery/
        moderate/
          page.tsx                # Main moderation interface
          layout.tsx              # Layout wrapper for moderation page
    events/
      [eventId]/
        gallery/
          moderation/
            page.tsx              # Event-specific moderation page
```

### Database Migrations
```
supabase/
  migrations/
    20251429_media_moderation.sql # Migration for moderation status tracking
```

### Theme and Navigation Components
```
src/
  components/
    layout/
      ThemeProvider.tsx           # Theme context provider
      ThemeToggle.tsx             # Theme toggle button component
    nav/
      Navigation.tsx              # Main navigation component
      PublicNavigation.tsx        # Navigation for unauthenticated users
```

### Guest Access Components
```
src/
  components/
    guest/
      AddToHomeScreen.tsx         # Prompt for "Add to Home Screen"
      TokenValidator.tsx          # Component for validating guest tokens
  app/
    guest-access/
      page.tsx                    # Simplified guest access page
```

## Relevant Documentation

### Internal Documentation
1. **Architecture Guidelines**
   - `docs/architecture/ux/theme-implementation.md`
   - `docs/architecture/ux/navigation-patterns.md`

2. **Feature Documentation**
   - `docs/features/moderation-flow.md`
   - `docs/features/guest-access.md`

3. **Database Documentation**
   - `docs/project-structure/database-schema.md`
   - `docs/project-structure/rls-policies.md`

4. **User Flows**
   - `docs/user-flows/moderation-journey.md`
   - `docs/user-flows/guest-experience.md`

### External Documentation

1. **Next.js Documentation**
   - [App Router](https://nextjs.org/docs/app)
   - [API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

2. **Supabase Documentation**
   - [Supabase Auth](https://supabase.com/docs/guides/auth)
   - [Postgres Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
   - [Storage](https://supabase.com/docs/guides/storage)

3. **UI Component Libraries**
   - [Shadcn/ui Components](https://ui.shadcn.com/docs/components)
   - [Tailwind CSS](https://tailwindcss.com/docs)

4. **State Management**
   - [Zustand Documentation](https://github.com/pmndrs/zustand)
   - [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)

## Backup References

Several backup implementations exist that can be referenced during development:

```
backup-routes.bak/
  events-eventId-route/
    gallery/
      moderation/                 # Backup of moderation components
```

```
src/
  _backup/
    [eventId].bak/
      gallery/
        moderation/               # Additional backup implementations
```

## Testing Resources

### Component Testing
- Unit tests for moderation components: `src/components/moderation/__tests__/`
- Integration tests for moderation flow: `src/hooks/__tests__/useModerationActions.test.ts`

### API Testing
- Endpoint testing: `src/app/api/gallery/media/__tests__/`
- Database function tests: `src/lib/supabase/__tests__/`

### E2E Testing
- Moderation flow E2E tests: `cypress/e2e/moderation.cy.ts`
- Theme toggle E2E tests: `cypress/e2e/theme.cy.ts`
- Guest access flow tests: `cypress/e2e/guest-access.cy.ts`

## Performance Considerations

1. **Image Loading**
   - Use progressive loading for gallery images
   - Implement proper image sizing and formats (WebP)
   - Consider lazy loading for off-screen content

2. **Database Queries**
   - Optimize moderation status queries with proper indexes
   - Implement pagination for large galleries
   - Use efficient batch operations for moderation actions

3. **UI Performance**
   - Implement virtualized scrolling for large galleries
   - Optimize re-renders with proper React patterns
   - Use code splitting for moderation components

## Accessibility Guidelines

1. **Keyboard Navigation**
   - Ensure all moderation controls are keyboard accessible
   - Implement logical tabbing order
   - Add keyboard shortcuts for common moderation actions

2. **Screen Readers**
   - Add proper ARIA attributes to moderation components
   - Ensure status changes are announced to screen readers
   - Provide text alternatives for visual indicators

3. **Color and Contrast**
   - Ensure sufficient color contrast for status indicators
   - Don't rely solely on color for conveying status
   - Test with color blindness simulators

## Deployment Checklist

1. **Pre-Deployment Verification**
   - Run database migrations in staging environment
   - Test all moderation features with real data
   - Verify theme implementation across browsers

2. **Monitoring Setup**
   - Add performance monitoring for moderation API endpoints
   - Set up error tracking for moderation operations
   - Implement logging for all moderation actions

3. **Post-Deployment Validation**
   - Verify moderation functionality in production
   - Check theme implementation across devices
   - Validate guest access flows work as expected 