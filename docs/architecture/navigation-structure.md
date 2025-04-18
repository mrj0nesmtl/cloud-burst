# Navigation Structure

> **Version:** 0.9.0  
> **Last Updated:** April 20, 2025  
> **Status:** Active - Being Reorganized in Session 43

## Overview

This document outlines the navigation structure of Cloud Burst, including all routes, sidebar configuration, and role-based access controls. It serves as the definitive reference for the application's information architecture.

## Top-Level Routes

```
├── /                               # Public home page
├── /about                          # About page
├── /pricing                        # Pricing page
├── /contact                        # Contact page
├── /auth/                          # Authentication routes
│   ├── /signin                     # Sign in page
│   ├── /signup                     # Sign up page
│   ├── /reset-password             # Password reset page
│   └── /callback                   # OAuth callback
├── /invitation/[token]             # Public invitation page
│   └── /rsvp                       # RSVP form
├── /upload                         # Public upload page (with token)
├── /gallery/[token]                # Public gallery access (with token)
├── /protected/                     # Protected routes (require auth)
│   ├── /dashboard                  # Main dashboard
│   ├── /events/                    # Event management
│   │   ├── /                       # Event listing
│   │   ├── /create                 # Create event
│   │   └── /[eventId]/             # Event details
│   │       ├── /details            # Basic details tab
│   │       ├── /attendees          # Attendee management tab
│   │       ├── /gallery            # Gallery tab
│   │       ├── /qr                 # QR codes tab
│   │       ├── /invitations        # Invitations tab
│   │       └── /settings           # Event settings tab
│   ├── /gallery/                   # Gallery management
│   │   ├── /                       # All media
│   │   ├── /events                 # Events with galleries
│   │   ├── /moderate               # Moderation queue
│   │   └── /albums                 # Album management
│   ├── /analytics/                 # Analytics section
│   │   ├── /engagement             # Engagement metrics
│   │   └── /events                 # Event-specific analytics
│   ├── /settings/                  # User settings
│   │   ├── /profile                # Profile settings
│   │   ├── /account                # Account settings
│   │   ├── /team                   # Team management
│   │   ├── /billing                # Subscription & billing
│   │   └── /notifications          # Notification preferences
│   └── /admin/                     # Admin-only section
│       ├── /dashboard              # Admin dashboard
│       ├── /users                  # User management
│       ├── /events                 # Event oversight
│       ├── /analytics              # Platform analytics
│       └── /settings               # System settings
└── /guest/                         # Guest routes (token access)
    ├── /dashboard                  # Guest dashboard
    ├── /upload                     # Guest upload interface
    ├── /gallery                    # Guest gallery view
    └── /profile                    # Guest profile management
```

## Sidebar Navigation

The sidebar navigation is defined in `src/components/dashboard/nav-items.tsx` and is structured as follows:

### Organizer Sidebar

```tsx
export const organizerNavItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/protected/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    matchPattern: "/protected/dashboard",
  },
  {
    type: "section",
    title: "Event Management",
  },
  {
    title: "My Events",
    href: "/protected/events",
    icon: <Calendar className="h-5 w-5" />,
    matchPattern: "/protected/events",
    badge: {
      content: "New",
      variant: "success",
    },
  },
  {
    title: "Gallery",
    href: "/protected/gallery",
    icon: <Image className="h-5 w-5" />,
    matchPattern: "/protected/gallery",
    children: [
      {
        title: "All Media",
        href: "/protected/gallery",
        matchPattern: "/protected/gallery$",
      },
      {
        title: "Events",
        href: "/protected/gallery/events",
        matchPattern: "/protected/gallery/events",
      },
      {
        title: "Moderate",
        href: "/protected/gallery/moderate",
        matchPattern: "/protected/gallery/moderate",
        badge: {
          content: "10",
          variant: "warning",
        },
      },
      {
        title: "Albums",
        href: "/protected/gallery/albums",
        matchPattern: "/protected/gallery/albums",
      },
    ],
  },
  {
    type: "section",
    title: "Analytics",
  },
  {
    title: "Engagement Metrics",
    href: "/protected/analytics/engagement",
    icon: <BarChart3 className="h-5 w-5" />,
    matchPattern: "/protected/analytics/engagement",
  },
  {
    title: "Event Analytics",
    href: "/protected/analytics/events",
    icon: <LineChart className="h-5 w-5" />,
    matchPattern: "/protected/analytics/events",
    badge: {
      content: "Soon",
      variant: "outline",
    },
    disabled: true,
  },
  {
    type: "section",
    title: "AI Features",
  },
  {
    title: "Facial Recognition",
    href: "/protected/ai/facial-recognition",
    icon: <User className="h-5 w-5" />,
    matchPattern: "/protected/ai/facial-recognition",
    badge: {
      content: "Beta",
      variant: "beta",
    },
  },
  {
    title: "Smart Tagging",
    href: "/protected/ai/tagging",
    icon: <Tags className="h-5 w-5" />,
    matchPattern: "/protected/ai/tagging",
    badge: {
      content: "Soon",
      variant: "outline",
    },
    disabled: true,
  },
  {
    type: "section",
    title: "Settings",
  },
  {
    title: "Profile",
    href: "/protected/settings/profile",
    icon: <UserCircle className="h-5 w-5" />,
    matchPattern: "/protected/settings/profile",
  },
  {
    title: "Team",
    href: "/protected/settings/team",
    icon: <Users className="h-5 w-5" />,
    matchPattern: "/protected/settings/team",
  },
  {
    title: "Billing",
    href: "/protected/settings/billing",
    icon: <CreditCard className="h-5 w-5" />,
    matchPattern: "/protected/settings/billing",
  },
];
```

### Admin Sidebar

```tsx
export const adminNavItems: NavigationItem[] = [
  {
    title: "Admin Dashboard",
    href: "/protected/admin/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    matchPattern: "/protected/admin/dashboard",
  },
  {
    title: "User Management",
    href: "/protected/admin/users",
    icon: <Users className="h-5 w-5" />,
    matchPattern: "/protected/admin/users",
  },
  {
    title: "Event Oversight",
    href: "/protected/admin/events",
    icon: <CalendarDays className="h-5 w-5" />,
    matchPattern: "/protected/admin/events",
  },
  {
    title: "Platform Analytics",
    href: "/protected/admin/analytics",
    icon: <AreaChart className="h-5 w-5" />,
    matchPattern: "/protected/admin/analytics",
  },
  {
    title: "System Settings",
    href: "/protected/admin/settings",
    icon: <Settings className="h-5 w-5" />,
    matchPattern: "/protected/admin/settings",
  },
];
```

### Guest Sidebar

```tsx
export const guestNavItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/guest/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    matchPattern: "/guest/dashboard",
  },
  {
    title: "Gallery",
    href: "/guest/gallery",
    icon: <Image className="h-5 w-5" />,
    matchPattern: "/guest/gallery",
  },
  {
    title: "Upload Photos",
    href: "/guest/upload",
    icon: <Upload className="h-5 w-5" />,
    matchPattern: "/guest/upload",
  },
  {
    title: "My Profile",
    href: "/guest/profile",
    icon: <UserCircle className="h-5 w-5" />,
    matchPattern: "/guest/profile",
  },
];
```

## Mobile Navigation

For mobile devices, a simplified bottom navigation is shown:

### Organizer Mobile Nav

```tsx
export const organizerMobileNavItems: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/protected/dashboard",
    icon: <LayoutDashboard className="h-5 w-5" />,
    matchPattern: "/protected/dashboard",
  },
  {
    title: "Events",
    href: "/protected/events",
    icon: <Calendar className="h-5 w-5" />,
    matchPattern: "/protected/events",
  },
  {
    title: "Gallery",
    href: "/protected/gallery",
    icon: <Image className="h-5 w-5" />,
    matchPattern: "/protected/gallery",
  },
  {
    title: "Profile",
    href: "/protected/settings/profile",
    icon: <UserCircle className="h-5 w-5" />,
    matchPattern: "/protected/settings/profile",
  },
];
```

### Guest Mobile Nav

```tsx
export const guestMobileNavItems: NavigationItem[] = [
  {
    title: "Home",
    href: "/guest/dashboard",
    icon: <Home className="h-5 w-5" />,
    matchPattern: "/guest/dashboard",
  },
  {
    title: "Gallery",
    href: "/guest/gallery",
    icon: <Image className="h-5 w-5" />,
    matchPattern: "/guest/gallery",
  },
  {
    title: "Upload",
    href: "/guest/upload",
    icon: <Upload className="h-5 w-5" />,
    matchPattern: "/guest/upload",
  },
  {
    title: "Profile",
    href: "/guest/profile",
    icon: <UserCircle className="h-5 w-5" />,
    matchPattern: "/guest/profile",
  },
];
```

## Role-Based Access Control

Navigation items are filtered based on user roles:

```tsx
export function filterNavItemsByRole(
  items: NavigationItem[],
  role: UserRole
): NavigationItem[] {
  return items.filter((item) => {
    // Skip section headers
    if (item.type === "section") return true;
    
    // Check item permission
    if (item.requiredRole && !hasRequiredRole(role, item.requiredRole)) {
      return false;
    }
    
    // Check item capability
    if (item.requiredCapability && !hasCapability(role, item.requiredCapability)) {
      return false;
    }
    
    // Filter children recursively if present
    if (item.children) {
      item.children = filterNavItemsByRole(item.children, role);
      // Hide parent if all children are filtered out
      if (item.children.length === 0) return false;
    }
    
    return true;
  });
}
```

## Navigation Types

The navigation structure is strongly typed for better maintainability:

```typescript
export type NavigationItemType = "link" | "section" | "dropdown";
export type BadgeVariant = "default" | "success" | "warning" | "danger" | "outline" | "beta";

export interface NavigationBadge {
  content: string;
  variant: BadgeVariant;
}

export interface NavigationItem {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  type?: NavigationItemType;
  matchPattern?: string;
  children?: NavigationItem[];
  disabled?: boolean;
  badge?: NavigationBadge;
  requiredRole?: UserRole;
  requiredCapability?: UserCapability;
}
```

## Planned Reorganization

In Session 43, the navigation structure will be reorganized to improve user experience:

1. **Simplified Hierarchy**: Reduce nesting depth to improve discoverability
2. **Task-Based Organization**: Group items by user tasks rather than technical categories
3. **Enhanced Visual Cues**: Improve visual distinction between sections
4. **Reduced Clutter**: Hide low-usage features in secondary menus
5. **Contextual Actions**: Move more actions to context-specific locations

### Proposed New Structure (Draft)

```
├── Dashboard                       # Main dashboard with key metrics
├── Events                          # Event management
│   ├── Current Events              # Active events
│   ├── Past Events                 # Archived events
│   └── Create Event                # Event creation
├── Media Management                # Combined media section
│   ├── All Media                   # All photos and videos
│   ├── Approval Queue              # Needs moderation (with count)
│   └── Albums                      # Organized collections
├── Guests                          # Guest management
│   ├── Invitations                 # Invitation management
│   ├── RSVPs                       # RSVP tracking
│   └── Access Management           # Gallery access controls
├── Analytics                       # Analytics section
├── AI Tools                        # AI features combined section
└── Settings                        # User and account settings
```

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Role-Based Access Control](./role-based-access-control.md)
- [Dashboard Component Standards](../development/dashboard-components.md) 