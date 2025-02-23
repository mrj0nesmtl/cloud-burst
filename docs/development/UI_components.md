# UI Components Documentation

## 🎨 Cloud Burst Component Library
📅 *Updated: Feb 23, 2025*

## 📚 Core Components

### 🎯 Navigation Components

#### NavigationMenu
```typescript
// Usage: Main navigation
import { NavigationMenu } from "@/components/ui/navigation-menu"

// Variants:
- Default: Main header navigation
- Mobile: Condensed for small screens
- Dashboard: Admin navigation

// Props:
type NavigationMenuProps = {
  items: NavItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
}
```

#### Menubar
```typescript
// Usage: Context-specific menus
import { Menubar } from "@/components/ui/menubar"

// Implementations:
- Photo editing tools
- Dashboard actions
- Content filters

// Props:
type MenubarProps = {
  items: MenuItem[]
  className?: string
  orientation?: "horizontal" | "vertical"
}
```

#### Sheet
```typescript
// Usage: Mobile navigation & sidebars
import { Sheet } from "@/components/ui/sheet"

// Common uses:
- Mobile menu
- Quick settings
- Filter panels

// Props:
type SheetProps = {
  side?: "left" | "right" | "top" | "bottom"
  className?: string
  children: React.ReactNode
}
```

### 🖼️ Layout Components

#### AspectRatio
```typescript
// Usage: Image & video containers
import { AspectRatio } from "@/components/ui/aspect-ratio"

// Common ratios:
- 16:9 (Video content)
- 1:1 (Profile photos)
- 4:3 (Gallery images)

// Props:
type AspectRatioProps = {
  ratio?: number
  className?: string
  children: React.ReactNode
}
```

#### Card
```typescript
// Usage: Content containers
import { Card } from "@/components/ui/card"

// Variants:
- Default: Basic content card
- Interactive: Hover effects
- Featured: Highlighted content

// Props:
type CardProps = {
  variant?: "default" | "interactive" | "featured"
  className?: string
  children: React.ReactNode
}
```

#### Dialog
```typescript
// Usage: Modal windows
import { Dialog } from "@/components/ui/dialog"

// Implementations:
- Image preview
- Settings forms
- Confirmations

// Props:
type DialogProps = {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
  children: React.ReactNode
}
```

### 📝 Form Components

#### Form
```typescript
// Usage: Data input & settings forms
import { Form } from "@/components/ui/form"

// Implementations:
- Profile settings
- User preferences
- Notification settings
- Authentication forms

// Validation:
- React Hook Form
- Zod schemas
- Custom validation

// Props:
type FormProps = {
  onSubmit: (data: any) => Promise<void>
  className?: string
  children: React.ReactNode
}
```

#### PreferencesForm
```typescript
// Usage: User preferences management
import { PreferencesForm } from "@/components/forms/preferences-form"

// Features:
- Theme selection
- Language preferences
- Display settings
- Interface customization
- Download quality
- View preferences
```

#### NotificationsForm
```typescript
// Usage: Notification settings
import { NotificationsForm } from "@/components/forms/notifications-form"

// Features:
- Email preferences
- Push notifications
- Event alerts
- Digest frequency
- Quiet hours
- Marketing opt-in
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

### 🔐 Authentication Components

#### AuthForm
```typescript
// Usage: User authentication
import { AuthForm } from "@/components/auth/auth-form"

// Implementations:
- Login
- Registration
- Password recovery
- Social auth
```
