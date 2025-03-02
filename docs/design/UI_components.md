# UI Components Documentation (Beta)

## Cloud Burst Component Library
📅 *Updated: March 1, 2025*

## 📚 Core Components [Beta Implementation]

### 🎯 Navigation Components

#### NavigationMenu
```typescript
// Usage: Main navigation [Implemented]
import { NavigationMenu } from "@/components/ui/navigation-menu"

// Variants:
- ✅ Default: Main header navigation
- ✅ Mobile: Condensed for small screens
- ✅ Dashboard: Admin navigation
- 🟡 Role-based: Dynamic items

// Props:
type NavigationMenuProps = {
  items: NavItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
  role?: UserRole // New
}
```

#### DashboardNav [New]
```typescript
// Usage: Dashboard navigation [Implemented]
import { DashboardNav } from "@/components/nav/dashboard-nav"

// Features:
- ✅ Role-based items
- ✅ Collapsible sections
- ✅ Active state
- 🟡 Notifications

// Props:
type DashboardNavProps = {
  user: User
  profile: Profile
  collapsed?: boolean
}
```

#### Menubar
```typescript
// Usage: Context-specific menus [Beta Priority]
import { Menubar } from "@/components/ui/menubar"

// Implementations:
- 🟡 Photo editing tools
- ⏸️ Dashboard actions [Post-Beta]
- ⏸️ Content filters [Post-Beta]

// Props:
type MenubarProps = {
  items: MenuItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
}
```

#### Sheet
```typescript
// Usage: Mobile navigation & sidebars [Beta Tested]
import { Sheet } from "@/components/ui/sheet"

// Common uses:
- ✅ Mobile menu
- 🟡 Quick settings
- ⏸️ Filter panels [Post-Beta]

// Props:
type SheetProps = {
  side?: "left" | "right" | "top" | "bottom"
  className?: string
  children: React.ReactNode
}
```

### 🖼️ Layout Components [Beta Priority]

#### AspectRatio
```typescript
// Usage: Image & video containers [Beta Tested]
import { AspectRatio } from "@/components/ui/aspect-ratio"

// Common ratios:
- ✅ 16:9 (Video content)
- ✅ 1:1 (Profile photos)
- 🟡 4:3 (Gallery images)

// Props:
type AspectRatioProps = {
  ratio?: number
  className?: string
  children: React.ReactNode
}
```

#### Card
```typescript
// Usage: Content containers [Beta Tested]
import { Card } from "@/components/ui/card"

// Variants:
- ✅ Default: Basic content card
- 🟡 Interactive: Hover effects
- ⏸️ Featured: Highlighted content [Post-Beta]

// Props:
type CardProps = {
  variant?: "default" | "interactive" | "featured"
  className?: string
  children: React.ReactNode
}
```

#### Dialog
```typescript
// Usage: Modal windows [Beta Priority]
import { Dialog } from "@/components/ui/dialog"

// Implementations:
- ✅ Settings forms
- 🟡 Confirmations
- ⏸️ Image preview [Post-Beta]

// Props:
type DialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}
```

### 📝 Form Components [Beta Priority]

#### Form
```typescript
// Usage: Data input & settings [Beta Tested]
import { Form } from "@/components/ui/form"

// Implementations:
- ✅ Authentication forms
- ✅ Profile settings
- 🟡 User preferences
- ⏸️ Notification settings [Post-Beta]

// Validation:
- ✅ React Hook Form
- ✅ Zod schemas
- 🟡 Custom validation

// Props:
type FormProps = {
  onSubmit: (data: any) => Promise<void>
  className?: string
  children: React.ReactNode
}
```

#### PreferencesForm
```typescript
// Usage: User preferences [Beta Priority]
import { PreferencesForm } from "@/components/forms/preferences-form"

// Features:
- ✅ Theme selection
- ✅ Language preferences
- 🟡 Display settings
- ⏸️ Interface customization [Post-Beta]
- ⏸️ Download quality [Post-Beta]
- ⏸️ View preferences [Post-Beta]
```

#### NotificationsForm
```typescript
// Usage: Notification settings [Implemented]
import { NotificationsForm } from "@/components/forms/notifications-form"

// Features:
- ✅ Email template selection
- ✅ Template preview
- ✅ Template synchronization
- 🟡 Delivery preferences
- 🟡 Analytics integration
- ⏸️ Push notifications [Post-Beta]
- ⏸️ SMS configuration [Post-Beta]

// Props:
type NotificationsFormProps = {
  user: User
  templates: Template[]
  onSave: (preferences: NotificationPreferences) => Promise<void>
  isLoading?: boolean
}
```

#### Input
```typescript
// Usage: Text input
import { Input } from "@/components/ui/input"

// Variants:
- Text
- Email
- Password
- Search

// Props:
type InputProps = {
  type?: "text" | "email" | "password" | "search"
  className?: string
  error?: string
  disabled?: boolean
}
```

#### Select
```typescript
// Usage: Option selection
import { Select } from "@/components/ui/select"

// Features:
- Searchable
- Multi-select
- Grouped options

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
// Usage: Actions
import { Button } from "@/components/ui/button"

// Variants:
- default: Primary actions
- secondary: Alternative actions
- ghost: Subtle actions
- destructive: Delete/remove
- outline: Bordered style
- link: Text-like button

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
// Usage: Image galleries
import { Carousel } from "@/components/ui/carousel"

// Features:
- Auto-play
- Touch support
- Custom navigation

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
// Usage: Content organization
import { Tabs } from "@/components/ui/tabs"

// Implementations:
- Dashboard views
- Settings panels
- Gallery layouts

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
// Usage: Settings navigation
import { Tabs } from "@/components/ui/tabs"

// Implementations:
- Profile settings
- Preferences
- Notifications
- Security
```

#### SettingsCard
```typescript
// Usage: Settings container
import { Card } from "@/components/ui/card"

// Variants:
- default: Basic settings
- interactive: With actions
- form: Contains form elements
```

### 📊 Data Display

#### Table
```typescript
// Usage: Data presentation
import { Table } from "@/components/ui/table"

// Features:
- Sortable columns
- Pagination
- Row selection
```

#### Calendar
```typescript
// Usage: Date selection
import { Calendar } from "@/components/ui/calendar"

// Features:
- Date range
- Event display
- Time selection
```

### 🔔 Feedback Components

#### Alert
```typescript
// Usage: User notifications
import { Alert } from "@/components/ui/alert"

// Variants:
- default: Information
- success: Confirmation
- warning: Caution
- destructive: Error

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
// Usage: Temporary notifications
import { Toast } from "@/components/ui/toast"

// Types:
- Success messages
- Error notifications
- Process updates

// Props:
type ToastProps = {
  variant?: "default" | "success" | "error" | "loading"
  title: string
  description?: string
  duration?: number
}
```

### 📊 Dashboard Components [New Section]

#### DashboardHeader
```typescript
// Usage: Dashboard top bar [Active]
import { DashboardHeader } from "@/components/dashboard/header"

// Features:
- ✅ User profile
- ✅ Quick actions
- 🟡 Notifications
- 🟡 Search

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
- 🟡 Loading states

// Props:
type DashboardShellProps = {
  children: React.ReactNode
  sidebar?: React.ReactNode
  header?: React.ReactNode
}
```

## 🎨 Theme Configuration

### Color Tokens
```typescript
// Primary colors
primary: "hsl(var(--primary))"
secondary: "hsl(var(--secondary))"
accent: "hsl(var(--accent))"

// Status colors
success: "hsl(var(--success))"
warning: "hsl(var(--warning))"
error: "hsl(var(--error))"
```

### Typography
```typescript
// Font families
fontSans: "'Inter', sans-serif"
fontMono: "'Fira Code', monospace"

// Font sizes
textXs: "0.75rem"
textSm: "0.875rem"
textBase: "1rem"
textLg: "1.125rem"
textXl: "1.25rem"
```

## 🎯 Usage Guidelines

### Component Best Practices
1. **Accessibility First**
   - Use semantic HTML
   - Include ARIA labels
   - Maintain focus management

2. **Responsive Design**
   - Mobile-first approach
   - Breakpoint considerations
   - Touch targets

3. **Performance**
   - Lazy loading
   - Code splitting
   - Bundle optimization

### Error Handling
```typescript
// Component error boundary
import { ErrorBoundary } from "@/components/ui/error-boundary"

// Usage
<ErrorBoundary fallback={<ErrorComponent />}>
  <Component />
</ErrorBoundary>
```

### Settings Components Best Practices
1. **Form Organization**
   - Group related settings
   - Use clear labels
   - Provide descriptions
   - Show validation feedback

2. **State Management**
   - Use controlled components
   - Implement proper loading states
   - Handle errors gracefully
   - Show success feedback

3. **Accessibility**
   - Maintain keyboard navigation
   - Use ARIA labels
   - Provide error messages
   - Support screen readers

## 📱 Responsive Patterns

### Breakpoints
```typescript
// Default breakpoints
sm: "640px"
md: "768px"
lg: "1024px"
xl: "1280px"
"2xl": "1536px"
```

### Media Queries
```typescript
// Tailwind classes
sm: "@media (min-width: 640px)"
md: "@media (min-width: 768px)"
lg: "@media (min-width: 1024px)"
```

## 🔒 Security Considerations

1. **Input Sanitization**
   - XSS prevention
   - Data validation
   - Escape HTML

2. **Form Security**
   - CSRF protection
   - Rate limiting
   - Validation schemas

## 📚 Documentation Standards

### Component Documentation
```typescript
/**
 * @component Button
 * @description Primary action component
 * 
 * @param {string} variant - Button style variant
 * @param {string} size - Button size
 * @param {ReactNode} children - Button content
 * 
 * @example
 * <Button variant="default" size="lg">
 *   Click me
 * </Button>
 */
```

### Story Documentation
```typescript
// Storybook example
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
}
```

## 🔄 Version Control

### Component Updates
- Semantic versioning
- Changelog maintenance
- Migration guides
- Breaking changes

### Testing Requirements
- Unit tests
- Integration tests
- Visual regression
- Accessibility tests

### 💳 Payment Components

#### PayPalQRCode
```typescript
// Usage: Payment processing
import { PayPalQRCode } from "@/components/payment/paypal-qr"

// Features:
- Dynamic QR generation
- Amount configuration
- Status tracking
- Success/failure handling
```

### 🔐 Authentication Components [Updated]

#### AuthForm
```typescript
// Usage: Enhanced authentication [Implemented]
import { AuthForm } from "@/components/auth/auth-form"

// Features:
- ✅ Email/Password
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states
- 🟡 Social auth

// Props:
type AuthFormProps = {
  type: "signin" | "signup" | "reset"
  onSubmit: (data: AuthFormData) => Promise<void>
  error?: string
}
```

### 📧 Email Template Components [New]

#### TemplateList
```typescript
// Usage: Email template management [Implemented]
import { TemplateList } from "@/components/notifications/template-list"

// Features:
- ✅ Template listing
- ✅ Status indicators
- ✅ Sync status
- ✅ Template selection
- 🟡 Filtering options

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
- 🟡 Syntax highlighting
- 🟡 Variable validation

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
- 🟡 Sample data selection

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
- 🟡 Analytics display

// Props:
type NotificationsContentProps = {
  user: User
}
```
