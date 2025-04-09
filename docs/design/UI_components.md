# UI Components Documentation

## Cloud Burst Component Library
📅 *Updated: April 9, 2025*
📊 *Version: 0.8.9*

## 📌 Situational Abstract

Cloud Burst's component library has fully matured as we approach our April 15, 2025 launch date. Our components have evolved from basic implementations to feature-rich, role-aware UI elements that adapt to user permissions and device capabilities.

The component library now features a comprehensive dashboard foundation with Activity Feed and Quick Actions components, a robust form validation system using Zod and React Hook Form, and an enhanced navigation structure with role-based access control. Recent implementations of the guest reservation system, camera integration, and gallery permission controls have proven the effectiveness of our direct style approach with explicit viewport detection, which has become the standard for all layout components.

Our current focus is on finalizing the last components and ensuring consistent mobile optimization across all features. The component library maintains excellent performance within memory constraints while providing a consistent, accessible user experience across devices.

## 🔥 Mobile-First Component Implementation

### Official Approach: Direct Style With Viewport Detection

After thorough testing and implementation across multiple features, we've established that **direct inline styles with explicit viewport detection** is the definitive required approach for all layout components. This pattern has consistently delivered reliable results across all devices and is now mandatory for all layout-related components.

```tsx
// REQUIRED: Mobile-first component with direct styles and explicit viewport detection
import { useState, useEffect } from 'react';

export function ResponsiveComponent() {
  // Mobile detection - REQUIRED for all responsive components
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div style={{ 
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      padding: isMobile ? '16px' : '24px',
      gap: isMobile ? '16px' : '24px'
    }}>
      <h2 style={{
        fontSize: isMobile ? '20px' : '24px',
        fontWeight: 'bold',
        marginBottom: isMobile ? '12px' : '16px'
      }}>Component Title</h2>
      
      {/* Content with conditional layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: isMobile ? '16px' : '24px',
        width: '100%'
      }}>
        {/* Cards or items */}
      </div>
    </div>
  );
}
```

### Implementation Requirements

All components that control layout or require responsive behavior **MUST**:

1. **Implement the standard viewport detection** using the pattern above
2. **Apply conditional styles** based on the `isMobile` state
3. **Use explicit dimensions** with `width: '100%'` for container elements
4. **Set appropriate touch targets** for mobile (minimum 44px × 44px)
5. **Use responsive spacing values**: `gap: isMobile ? '16px' : '24px'`
6. **Apply touch-friendly sizing**: `height: isMobile ? '48px' : '40px'`
7. **Test on multiple device sizes** before deployment

### Recent Mobile Implementation Successes

We've successfully applied our mobile approach across several key components:

#### 1. Camera Capture Component

The camera integration required specialized mobile handling for optimal user experience:

```tsx
// Camera capture with mobile optimization
function CameraCapture() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div style={{
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      {/* Camera preview */}
      <div style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'black'
      }}>
        <div ref={videoRef} style={{ width: '100%', height: '100%' }} />
        
        {/* Mobile-optimized capture button */}
        <button
          onClick={capturePhoto}
          style={{
            position: 'absolute',
            bottom: isMobile ? '20px' : '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: isMobile ? '60px' : '50px',  // Larger on mobile
            height: isMobile ? '60px' : '50px', // Larger on mobile
            borderRadius: '50%',
            backgroundColor: 'white',
            border: '3px solid var(--primary)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <CameraIcon size={isMobile ? 28 : 24} />
        </button>
      </div>
      
      {/* Camera controls - responsive layout */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '12px' : '16px',
        width: '100%'
      }}>
        {/* Device selection and other controls */}
      </div>
    </div>
  );
}
```

#### 2. Guest Registration Form

The guest reservation system required touch-optimized form components:

```tsx
// Guest registration form with mobile optimization
function GuestReservationForm() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div style={{
      width: '100%',
      maxWidth: '500px',
      margin: '0 auto',
      padding: isMobile ? '16px' : '24px',
      backgroundColor: 'var(--card)',
      borderRadius: '8px',
      boxShadow: 'var(--shadow-md)'
    }}>
      <h2 style={{
        fontSize: isMobile ? '18px' : '20px',
        fontWeight: 'bold',
        marginBottom: '16px'
      }}>
        Register for Gallery Access
      </h2>
      
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '16px' : '20px'
          }}
        >
          {/* Form fields with responsive styling */}
          <button
            type="submit"
            style={{
              height: isMobile ? '48px' : '40px',
              width: '100%',
              backgroundColor: 'var(--primary)',
              color: 'white',
              borderRadius: '6px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: 'medium'
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Register"}
          </button>
        </form>
      </Form>
    </div>
  );
}
```

#### 3. Gallery Permission Controls

The gallery permission system required responsive controls:

```tsx
// Gallery permission controls with mobile optimization
function GalleryPermissionControl() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);
  
  return (
    <div style={{
      width: '100%',
      padding: isMobile ? '12px' : '16px',
      borderRadius: '8px',
      backgroundColor: 'var(--card)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        gap: isMobile ? '12px' : '0'
      }}>
        <div>
          <h3 style={{ 
            fontSize: isMobile ? '16px' : '18px',
            fontWeight: 'bold'
          }}>
            Gallery Access
          </h3>
          <p style={{ 
            fontSize: isMobile ? '13px' : '14px',
            color: 'var(--muted-foreground)' 
          }}>
            Control who can access this gallery
          </p>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          width: isMobile ? '100%' : 'auto'
        }}>
          {/* Access control toggles */}
        </div>
      </div>
    </div>
  );
}
```

### UI Component vs. Layout Component Guidelines

**Layout Components** (use direct style approach with viewport detection):
- Page containers
- Grid/flex layouts
- Card collections
- Section dividers
- Content wrappers
- Responsive forms
- Media containers
- Permission controls

**UI Components** (can use Tailwind classes):
- Buttons
- Form inputs
- Icons
- Badges
- Individual cards
- Toggles
- Labels
- Static text elements

### Touch-Friendly Mobile Components

All interactive elements on mobile must:

- Have minimum touch target size of 44px × 44px
- Include sufficient spacing between touchable elements (16px minimum)
- Provide appropriate touch feedback (hover/active states)
- Ensure text remains readable without zooming
- Use larger font sizes on mobile: `fontSize: isMobile ? '16px' : '14px'`
- Include clear error states positioned for mobile visibility

```tsx
// Touch-friendly button example
<button style={{
  height: isMobile ? '48px' : '40px',
  minWidth: isMobile ? '48px' : '40px',
  padding: '0 16px',
  borderRadius: '8px',
  backgroundColor: 'var(--primary)',
  color: 'white',
  fontWeight: 'bold',
  fontSize: isMobile ? '16px' : '14px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px'
}}>
  <Icon size={isMobile ? 24 : 20} />
  <span>Action</span>
</button>
```

For more detailed implementation guidelines, see:
- `docs/design/consistent-layout.md` - Standard layout approach
- `docs/design/layout-troubleshooting.md` - Common issues and solutions
- `docs/design/style.md` - Responsive design patterns

## 📚 Core Components [Implemented]

### 🎯 Navigation Components

#### NavigationMenu
```typescript
// Usage: Main navigation [Implemented]
import { NavigationMenu } from "@/components/ui/navigation-menu"

// Variants:
- ✅ Default: Main header navigation
- ✅ Mobile: Condensed for small screens
- ✅ Dashboard: Admin navigation
- ✅ Role-based: Dynamic items based on user role

// Props:
type NavigationMenuProps = {
  items: NavItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
  role?: UserRole
}
```

#### DashboardNav [Implemented]
```typescript
// Usage: Dashboard navigation [Implemented]
import { DashboardNav } from "@/components/nav/dashboard-nav"

// Features:
- ✅ Role-based items
- ✅ Collapsible sections
- ✅ Active state
- ✅ Section links
- ✅ Icon support

// Props:
type DashboardNavProps = {
  user: User
  profile: Profile
  collapsed?: boolean
}
```

#### SideNav [Implemented]
```typescript
// Usage: Sidebar navigation with sections [Implemented]
import { SideNav } from "@/components/layout/side-nav"

// Features:
- ✅ Section organization
- ✅ Role-based visibility
- ✅ Active state indicators
- ✅ Nested navigation

// Props:
type SideNavProps = {
  items: SideNavItem[]
  className?: string
  user: User
}
```

#### BreadcrumbNav [Implemented]
```typescript
// Usage: Breadcrumb navigation [Implemented]
import { BreadcrumbNav } from "@/components/layout/breadcrumb-nav"

// Features:
- ✅ Dynamic segments based on route
- ✅ Link generation
- ✅ Current page indicator

// Props:
type BreadcrumbNavProps = {
  segments: BreadcrumbSegment[]
  className?: string
}
```

#### MainNav [Implemented]
```typescript
// Usage: Main navigation with role-based items [Implemented]
import { MainNav } from "@/components/layout/main-nav"

// Features:
- ✅ Role-based items
- ✅ Active state
- ✅ Responsive design
- ✅ Conditional rendering

// Props:
type MainNavProps = {
  className?: string
}
```

#### UserNav [Implemented]
```typescript
// Usage: User navigation dropdown [Implemented]
import { UserNav } from "@/components/layout/user-nav"

// Features:
- ✅ User profile info
- ✅ Dropdown menu
- ✅ Role-based actions
- ✅ Sign out option

// Props:
type UserNavProps = {
  user: User
  profile?: Profile
}
```

#### Menubar
```typescript
// Usage: Context-specific menus [Implemented]
import { Menubar } from "@/components/ui/menubar"

// Implementations:
- ✅ Dashboard actions
- ✅ Event management options
- 🟢 Photo editing tools
- 🟢 Content filters

// Props:
type MenubarProps = {
  items: MenuItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
}
```

#### Sheet
```typescript
// Usage: Mobile navigation & sidebars [Implemented]
import { Sheet } from "@/components/ui/sheet"

// Common uses:
- ✅ Mobile menu
- ✅ Quick settings
- ✅ Filter panels
- 🟢 Detail views

// Props:
type SheetProps = {
  side?: "left" | "right" | "top" | "bottom"
  className?: string
  children: React.ReactNode
}
```

### 🖼️ Layout Components [Implemented]

#### DashboardLayout
```typescript
// Usage: Dashboard layout wrapper [Implemented]
import { DashboardLayout } from "@/components/layout/dashboard-layout"

// Features:
- ✅ Sidebar integration
- ✅ Header placement
- ✅ Main content area
- ✅ Responsive adjustments

// Props:
type DashboardLayoutProps = {
  children: React.ReactNode
}
```

#### AspectRatio
```typescript
// Usage: Image & video containers [Implemented]
import { AspectRatio } from "@/components/ui/aspect-ratio"

// Common ratios:
- ✅ 16:9 (Video content)
- ✅ 1:1 (Profile photos)
- ✅ 4:3 (Gallery images)
- ✅ Custom ratios

// Props:
type AspectRatioProps = {
  ratio?: number
  className?: string
  children: React.ReactNode
}
```

#### Card
```typescript
// Usage: Content containers [Implemented]
import { Card } from "@/components/ui/card"

// Variants:
- ✅ Default: Basic content card
- ✅ Interactive: Hover effects
- ✅ Featured: Highlighted content
- ✅ Dashboard: Stats and metrics

// Props:
type CardProps = {
  variant?: "default" | "interactive" | "featured" | "dashboard"
  className?: string
  children: React.ReactNode
}
```

#### Dialog
```typescript
// Usage: Modal windows [Implemented]
import { Dialog } from "@/components/ui/dialog"

// Implementations:
- ✅ Settings forms
- ✅ Confirmations
- ✅ Photo preview
- 🟢 Advanced options

// Props:
type DialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}
```

### 📝 Form Components [Implemented]

#### Form
```typescript
// Usage: Data input & settings [Implemented]
import { Form } from "@/components/ui/form"

// Implementations:
- ✅ Authentication forms
- ✅ Profile settings
- ✅ User preferences
- ✅ Event creation
- ✅ Notification settings

// Validation:
- ✅ React Hook Form
- ✅ Zod schemas
- ✅ Custom validation
- ✅ Cross-field validation
- ✅ Error state management

// Props:
type FormProps = {
  onSubmit: (data: any) => Promise<void>
  className?: string
  children: React.ReactNode
}
```

#### PreferencesForm
```typescript
// Usage: User preferences [Implemented]
import { PreferencesForm } from "@/components/forms/preferences-form"

// Features:
- ✅ Theme selection
- ✅ Language preferences
- ✅ Display settings
- 🟢 Interface customization
- 🟢 Download quality
- 🟢 View preferences

// Props:
type PreferencesFormProps = {
  user: User
  preferences: UserPreferences
  onSave: (preferences: UserPreferences) => Promise<void>
  isLoading?: boolean
}
```

#### NotificationsForm
```typescript
// Usage: Notification settings [Implemented]
import { NotificationsForm } from "@/components/forms/notifications-form"

// Features:
- ✅ Email template selection
- ✅ Template preview
- ✅ Template synchronization
- ✅ Delivery preferences
- ✅ Analytics integration
- 🟢 Push notifications
- 🟢 SMS configuration

// Props:
type NotificationsFormProps = {
  user: User
  templates: Template[]
  onSave: (preferences: NotificationPreferences) => Promise<void>
  isLoading?: boolean
}
```

#### EventForm
```typescript
// Usage: Event creation and editing [Implemented]
import { EventForm } from "@/components/forms/event-form"

// Features:
- ✅ Basic information tab
- ✅ Advanced settings tab
- ✅ Form validation
- ✅ Image upload
- ✅ Date/time selection
- ✅ Location input
- ✅ Visibility options

// Props:
type EventFormProps = {
  initialData?: Event
  onSubmit: (data: EventFormData) => Promise<void>
  isLoading?: boolean
}
```

#### Input
```typescript
// Usage: Text input [Implemented]
import { Input } from "@/components/ui/input"

// Variants:
- ✅ Text
- ✅ Email
- ✅ Password
- ✅ Search
- ✅ Number
- ✅ Date

// Props:
type InputProps = {
  type?: "text" | "email" | "password" | "search" | "number" | "date"
  className?: string
  error?: string
  disabled?: boolean
}
```

#### Select
```typescript
// Usage: Option selection [Implemented]
import { Select } from "@/components/ui/select"

// Features:
- ✅ Searchable
- ✅ Multi-select
- ✅ Grouped options
- ✅ Custom rendering

// Props:
type SelectProps = {
  options: SelectOption[]
  multiple?: boolean
  searchable?: boolean
  className?: string
}
```

### 🎛️ Interactive Components

#### Button
```typescript
// Usage: Actions [Implemented]
import { Button } from "@/components/ui/button"

// Variants:
- ✅ default: Primary actions
- ✅ secondary: Alternative actions
- ✅ ghost: Subtle actions
- ✅ destructive: Delete/remove
- ✅ outline: Bordered style
- ✅ link: Text-like button

// Props:
type ButtonProps = {
  variant?: "default" | "secondary" | "ghost" | "destructive" | "outline" | "link"
  size?: "sm" | "md" | "lg"
  loading?: boolean
  disabled?: boolean
  className?: string
  children: React.ReactNode
}
```

#### Carousel
```typescript
// Usage: Image galleries [Implemented]
import { Carousel } from "@/components/ui/carousel"

// Features:
- ✅ Auto-play
- ✅ Touch support
- ✅ Custom navigation
- ✅ Responsive sizing
- ✅ Image optimization

// Props:
type CarouselProps = {
  items: CarouselItem[]
  autoPlay?: boolean
  interval?: number
  className?: string
}
```

#### Tabs
```typescript
// Usage: Content organization [Implemented]
import { Tabs } from "@/components/ui/tabs"

// Implementations:
- ✅ Dashboard views
- ✅ Settings panels
- ✅ Gallery layouts
- ✅ Event detail tabs
- ✅ Form organization

// Props:
type TabsProps = {
  items: TabItem[]
  defaultValue?: string
  className?: string
  onChange?: (value: string) => void
}
```

### 🎛️ Settings Components

#### SettingsTabs
```typescript
// Usage: Settings navigation [Implemented]
import { Tabs } from "@/components/ui/tabs"

// Implementations:
- ✅ Profile settings
- ✅ Preferences
- ✅ Notifications
- ✅ Security
- 🟢 Subscription
```

#### SettingsCard
```typescript
// Usage: Settings container [Implemented]
import { Card } from "@/components/ui/card"

// Variants:
- ✅ default: Basic settings
- ✅ interactive: With actions
- ✅ form: Contains form elements
```

### 📊 Data Display

#### Table
```typescript
// Usage: Data presentation [Implemented]
import { Table } from "@/components/ui/table"

// Features:
- ✅ Sortable columns
- ✅ Pagination
- ✅ Row selection
- ✅ Row actions
- ✅ Custom cell rendering
- ✅ Responsive behavior

// Props:
type TableProps = {
  data: any[]
  columns: TableColumn[]
  pagination?: PaginationOptions
  sorting?: SortingOptions
  selection?: SelectionOptions
  className?: string
}
```

#### Calendar
```typescript
// Usage: Date selection [Implemented]
import { Calendar } from "@/components/ui/calendar"

// Features:
- ✅ Date range
- ✅ Event display
- ✅ Time selection
- ✅ Month/week/day views
- ✅ Recurring events

// Props:
type CalendarProps = {
  events?: CalendarEvent[]
  view?: "month" | "week" | "day"
  onDateSelect?: (date: Date) => void
  className?: string
}
```

### 🔔 Feedback Components

#### Alert
```typescript
// Usage: User notifications [Implemented]
import { Alert } from "@/components/ui/alert"

// Variants:
- ✅ default: Information
- ✅ success: Confirmation
- ✅ warning: Caution
- ✅ destructive: Error

// Props:
type AlertProps = {
  variant?: "default" | "success" | "warning" | "destructive"
  title?: string
  description?: string
  className?: string
}
```

#### Toast
```typescript
// Usage: Temporary notifications [Implemented]
import { Toast } from "@/components/ui/toast"

// Types:
- ✅ Success messages
- ✅ Error notifications
- ✅ Process updates
- ✅ Warning alerts
- ✅ Information notices

// Props:
type ToastProps = {
  variant?: "default" | "success" | "error" | "warning" | "info" | "loading"
  title: string
  description?: string
  duration?: number
}
```

### 📊 Dashboard Components [Enhanced]

#### ActivityFeed
```typescript
// Usage: Recent activity tracking [Implemented]
import { ActivityFeed } from "@/components/dashboard/activity-feed"

// Features:
- ✅ Timeline display
- ✅ Activity categorization
- ✅ Timestamp formatting
- ✅ User attribution
- ✅ Action links
- ✅ Infinite scrolling

// Props:
type ActivityFeedProps = {
  activities: Activity[]
  isLoading?: boolean
  loadMore?: () => Promise<void>
  hasMore?: boolean
}
```

#### QuickActions
```typescript
// Usage: Dashboard shortcuts [Implemented]
import { QuickActions } from "@/components/dashboard/quick-actions"

// Features:
- ✅ Role-based actions
- ✅ Icon buttons
- ✅ Action descriptions
- ✅ Permission checking
- ✅ Link generation

// Props:
type QuickActionsProps = {
  user: User
  className?: string
  maxItems?: number
}
```

#### DashboardStats
```typescript
// Usage: Key metrics overview [Implemented]
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

// Features:
- ✅ Metric cards
- ✅ Visual indicators
- ✅ Trend comparison
- ✅ Role-based visibility
- ✅ Responsive layout

// Props:
type DashboardStatsProps = {
  stats: StatItem[]
  isLoading?: boolean
  className?: string
}
```

#### RecentEvents
```typescript
// Usage: Recent events list [Implemented]
import { RecentEvents } from "@/components/dashboard/recent-events"

// Features:
- ✅ Event previews
- ✅ Action buttons
- ✅ Status indicators
- ✅ Date formatting
- ✅ Link to details

// Props:
type RecentEventsProps = {
  events: Event[]
  isLoading?: boolean
  maxItems?: number
  className?: string
}
```

#### DashboardHeader
```typescript
// Usage: Dashboard top bar [Implemented]
import { DashboardHeader } from "@/components/dashboard/header"

// Features:
- ✅ User profile
- ✅ Quick actions
- ✅ Notifications
- ✅ Search
- ✅ Menu toggle

// Props:
type DashboardHeaderProps = {
  user: User
  profile: Profile
  notifications?: Notification[]
}
```

#### DashboardShell
```typescript
// Usage: Dashboard layout wrapper [Implemented]
import { DashboardShell } from "@/components/dashboard/shell"

// Features:
- ✅ Responsive layout
- ✅ Sidebar integration
- ✅ Header placement
- ✅ Loading states
- ✅ Error boundaries

// Props:
type DashboardShellProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
}
```

### 🔒 Permission Components [Implemented]

#### PermissionGate
```typescript
// Usage: Conditional rendering based on permissions [Implemented]
import { PermissionGate } from "@/components/auth/permission-gate"

// Features:
- ✅ Action-based permissions
- ✅ Resource-based permissions
- ✅ Ownership verification
- ✅ Fallback content
- ✅ Section-based permissions

// Props:
type PermissionGateProps = {
  action: "create" | "read" | "update" | "delete" | "manage" | "access"
  resource: "event" | "photo" | "attendee" | "user" | "admin" | "analytics"
  ownerId?: string
  children: ReactNode
  fallback?: ReactNode
}
```

#### RoleGate
```typescript
// Usage: Role-based UI elements [Implemented]
import { RoleGate } from "@/components/auth/permission-gate"

// Features:
- ✅ Role-based rendering
- ✅ Multiple role support
- ✅ Fallback content
- ✅ Component-level access control

// Props:
type RoleGateProps = {
  roles: string | string[]
  children: ReactNode
  fallback?: ReactNode
}
```

#### SubscriptionGate
```typescript
// Usage: Paid features [Implemented]
import { SubscriptionGate } from "@/components/auth/permission-gate"

// Features:
- ✅ Subscription tier verification
- ✅ Fallback content
- ✅ Upgrade prompts

// Props:
type SubscriptionGateProps = {
  children: ReactNode
  fallback?: ReactNode
}
```

### 📅 Event Components [Enhanced]

#### EventCard
```typescript
// Usage: Event summary display [Implemented]
import { EventCard } from "@/components/events/event-card"

// Features:
- ✅ Event details preview
- ✅ Action buttons
- ✅ Status indicators
- ✅ Date formatting
- ✅ Image preview
- ✅ Responsive layout

// Props:
type EventCardProps = {
  event: Event
  actions?: boolean
  onClick?: (event: Event) => void
  className?: string
}
```

#### EventList
```typescript
// Usage: Events overview [Implemented]
import { EventList } from "@/components/events/event-list"

// Features:
- ✅ Event cards
- ✅ Pagination
- ✅ Filtering
- ✅ Sorting
- ✅ Empty state
- ✅ Loading state

// Props:
type EventListProps = {
  events: Event[]
  isLoading?: boolean
  pagination?: PaginationOptions
  onPageChange?: (page: number) => void
  className?: string
}
```

#### EventFilters
```typescript
// Usage: Event filtering and sorting [In Progress]
import { EventFilters } from "@/components/events/event-filters"

// Features:
- 🟢 Date range
- 🟢 Status filters
- 🟢 Search input
- 🟢 Sort options
- 🟢 Filter persistence

// Props:
type EventFiltersProps = {
  filters: EventFilters
  onFilterChange: (filters: EventFilters) => void
  className?: string
}
```

#### EventActions
```typescript
// Usage: Event management actions [Implemented]
import { EventActions } from "@/components/events/event-actions"

// Features:
- ✅ Permission-based actions
- ✅ Edit button
- ✅ Delete button with confirmation
- ✅ QR code button
- ✅ Share button
- ✅ View gallery button

// Props:
type EventActionsProps = {
  eventId: string
  organizerId: string
}
```

#### AttendeeManagement
```typescript
// Usage: Event attendee management [In Progress]
import { AttendeeManagement } from "@/components/events/attendee-management"

// Features:
- ✅ Attendee list
- ✅ Add attendee
- ✅ Remove attendee
- ✅ Edit attendee
- 🟢 Import/export
- 🟢 Role assignment
- 🟢 Bulk actions

// Props:
type AttendeeManagementProps = {
  eventId: string
  initialAttendees: Attendee[]
  organizerId: string
}
```

#### QRCodeDisplay
```typescript
// Usage: Event QR code display [Implemented]
import { QRCodeDisplay } from "@/components/events/qr-code-display"

// Features:
- ✅ QR code generation
- ✅ Download option
- ✅ Share option
- ✅ Customization
- ✅ Event details

// Props:
type QRCodeDisplayProps = {
  eventId: string
  eventCode: string
  eventName: string
}
```

### 🖼️ Gallery Components [Enhanced]

#### GalleryGrid
```typescript
// Usage: Photo gallery display [Implemented]
import { GalleryGrid } from "@/components/gallery/gallery-grid"

// Features:
- ✅ Responsive grid
- ✅ Lazy loading
- ✅ Click to view
- ✅ Selection mode
- ✅ Masonry layout
- 🟢 Filtering options

// Props:
type GalleryGridProps = {
  photos: Photo[]
  selectable?: boolean
  onSelect?: (photo: Photo) => void
  emptyMessage?: string
  layout?: "grid" | "masonry"
}
```

#### UploadDropzone
```typescript
// Usage: Photo upload [Implemented]
import { UploadDropzone } from "@/components/gallery/upload-dropzone"

// Features:
- ✅ Drag and drop
- ✅ File selection
- ✅ Upload progress
- ✅ Error handling
- ✅ File validation
- ✅ MIME type checking
- ✅ Size limits

// Props:
type UploadDropzoneProps = {
  eventId: string
  onUploadComplete?: () => void
  maxFiles?: number
  maxSize?: number
  acceptedTypes?: string[]
}
```

#### PhotoLightbox
```typescript
// Usage: Enhanced photo viewing [In Progress]
import { PhotoLightbox } from "@/components/gallery/photo-lightbox"

// Features:
- 🟢 Full-screen view
- 🟢 Navigation controls
- 🟢 Download option
- 🟢 Share option
- 🟢 Information display
- 🟢 Zoom controls
- 🟢 Slideshow mode

// Props:
type PhotoLightboxProps = {
  photos: Photo[]
  initialIndex?: number
  onClose: () => void
  onDownload?: (photo: Photo) => void
  onShare?: (photo: Photo) => void
}
```

#### ModerationQueue
```typescript
// Usage: Photo moderation [In Progress]
import { ModerationQueue } from "@/components/gallery/moderation-queue"

// Features:
- 🟢 Approval workflow
- 🟢 Rejection with reason
- 🟢 Batch actions
- 🟢 Preview mode
- 🟢 Filter by status

// Props:
type ModerationQueueProps = {
  photos: Photo[]
  onApprove: (photoIds: string[]) => Promise<void>
  onReject: (photoIds: string[], reason?: string) => Promise<void>
  isLoading?: boolean
}
```

#### AlbumCard
```typescript
// Usage: Album summary [In Progress]
import { AlbumCard } from "@/components/gallery/album-card"

// Features:
- 🟢 Cover image
- 🟢 Album details
- 🟢 Photo count
- 🟢 Action buttons
- 🟢 Permission-based actions

// Props:
type AlbumCardProps = {
  album: Album
  onClick?: (album: Album) => void
  actions?: boolean
  className?: string
}
```

### 👥 Attendee Components [Planned]

#### InvitationForm
```typescript
// Usage: Send invitations [Planned]
import { InvitationForm } from "@/components/attendees/invitation-form"

// Features:
- 🟢 Email input
- 🟢 Batch invitation
- 🟢 Template selection
- 🟢 Role assignment
- 🟢 Custom message

// Props:
type InvitationFormProps = {
  eventId: string
  onInvite: (data: InvitationFormData) => Promise<void>
  isLoading?: boolean
}
```

#### AttendeeList
```typescript
// Usage: List and manage attendees [Planned]
import { AttendeeList } from "@/components/attendees/attendee-list"

// Features:
- 🟢 Attendee details
- 🟢 Role display
- 🟢 Action buttons
- 🟢 Filtering options
- 🟢 Status indicators

// Props:
type AttendeeListProps = {
  attendees: Attendee[]
  onEdit?: (attendee: Attendee) => void
  onRemove?: (attendeeId: string) => Promise<void>
  isLoading?: boolean
}
```

#### QRGenerator
```typescript
// Usage: QR code generation [Planned]
import { QRGenerator } from "@/components/attendees/qr-generator"

// Features:
- 🟢 Multiple QR codes
- 🟢 Bulk printing
- 🟢 Custom styling
- 🟢 Download options
- 🟢 Event details

// Props:
type QRGeneratorProps = {
  eventId: string
  className?: string
}
```

#### RoleAssignment
```typescript
// Usage: Assign roles to attendees [Planned]
import { RoleAssignment } from "@/components/attendees/role-assignment"

// Features:
- 🟢 Role selection
- 🟢 Batch assignment
- 🟢 Permission preview
- 🟢 Current role display

// Props:
type RoleAssignmentProps = {
  eventId: string
  attendeeIds: string[]
  onAssign: (attendeeIds: string[], role: string) => Promise<void>
  isLoading?: boolean
}
```

### 🔐 Authentication Components [Implemented]

#### AuthForm
```typescript
// Usage: Enhanced authentication [Implemented]
import { AuthForm } from "@/components/auth/auth-form"

// Features:
- ✅ Email/Password
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- ✅ Social auth
- ✅ Password recovery
- ✅ Persistent form data

// Props:
type AuthFormProps = {
  type: "signin" | "signup" | "reset"
  onSubmit: (data: AuthFormData) => Promise<void>
  error?: string
}
```

### 📧 Email Template Components [Implemented]

#### TemplateList
```typescript
// Usage: Email template management [Implemented]
import { TemplateList } from "@/components/notifications/template-list"

// Features:
- ✅ Template listing
- ✅ Status indicators
- ✅ Sync status
- ✅ Template selection
- ✅ Filtering options
- ✅ Search functionality

// Props:
type TemplateListProps = {
  templates: Template[]
  onSelect: (template: Template) => void
  isLoading?: boolean
}
```

#### TemplateEditor
```typescript
// Usage: Email template editing [Implemented]
import { TemplateEditor } from "@/components/notifications/template-editor"

// Features:
- ✅ HTML editing
- ✅ Subject editing
- ✅ Variable insertion
- ✅ Save functionality
- ✅ Syntax highlighting
- ✅ Variable validation
- ✅ Error checking

// Props:
type TemplateEditorProps = {
  template: Template
  onSave: (template: Template) => Promise<void>
  onPreview: (template: Template) => void
  isLoading?: boolean
}
```

#### TemplatePreview
```typescript
// Usage: Email template preview [Implemented]
import { TemplatePreview } from "@/components/notifications/template-preview"

// Features:
- ✅ HTML rendering
- ✅ Variable substitution
- ✅ Mobile/desktop toggle
- ✅ Full-screen mode
- ✅ Sample data selection
- ✅ Test email sending

// Props:
type TemplatePreviewProps = {
  template: Template
  sampleData?: Record<string, any>
  onClose: () => void
  viewMode?: "mobile" | "desktop"
}
```

#### NotificationsContent
```typescript
// Usage: Notifications settings page [Implemented]
import { NotificationsContent } from "@/components/notifications/notifications-content"

// Features:
- ✅ Template management
- ✅ Template synchronization
- ✅ Template preview
- ✅ Template editing
- ✅ Analytics display
- ✅ Test email sending

// Props:
type NotificationsContentProps = {
  user: User
}
```

## 🔄 Implementation Progress

As we approach our April 15, 2025 launch date, our component library has reached a mature state with nearly all components implemented and mobile-optimized. Recent implementations of the guest reservation system, camera integration, and gallery permission controls have proven the effectiveness of our direct style approach with explicit viewport detection.

### Key Achievements:
- ✅ Complete navigation system with role-based rendering
- ✅ Comprehensive form components with Zod validation
- ✅ Robust permission components for conditional UI
- ✅ Enhanced dashboard components with mobile optimization
- ✅ Event management components with RBAC integration
- ✅ Email template system with preview and editing
- ✅ Guest reservation system with mobile-friendly forms
- ✅ Camera integration with touch-optimized controls
- ✅ Gallery permission system with responsive interfaces

### Current Focus (Session 39):
- 🟢 Final testing across all device sizes and browsers
- 🟢 Performance optimization for mobile networks
- 🟢 Touch target size audit across all components
- 🟢 Accessibility compliance verification
- 🟢 Documentation updates for mobile implementation

### Next Steps:
1. Complete final testing and optimization
2. Finalize documentation for all components
3. Create component usage examples for developers
4. Implement performance monitoring for mobile users
5. Prepare for platform launch
