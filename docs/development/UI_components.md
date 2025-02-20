# UI Components Documentation

## 🎨 Cloud Burst Component Library
📅 *Updated: Feb 2024*

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
```

#### Menubar
```typescript
// Usage: Context-specific menus
import { Menubar } from "@/components/ui/menubar"

// Implementations:
- Photo editing tools
- Dashboard actions
- Content filters
```

#### Sheet
```typescript
// Usage: Mobile navigation & sidebars
import { Sheet } from "@/components/ui/sheet"

// Common uses:
- Mobile menu
- Quick settings
- Filter panels
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
```

#### Card
```typescript
// Usage: Content containers
import { Card } from "@/components/ui/card"

// Variants:
- Default: Basic content card
- Interactive: Hover effects
- Featured: Highlighted content
```

#### Dialog
```typescript
// Usage: Modal windows
import { Dialog } from "@/components/ui/dialog"

// Implementations:
- Image preview
- Settings forms
- Confirmations
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
```

#### Select
```typescript
// Usage: Option selection
import { Select } from "@/components/ui/select"

// Features:
- Searchable
- Multi-select
- Grouped options
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
- outline: Bordered style (New)
- link: Text-like button (New)
```

#### Carousel
```typescript
// Usage: Image galleries
import { Carousel } from "@/components/ui/carousel"

// Features:
- Auto-play
- Touch support
- Custom navigation
```

#### Tabs
```typescript
// Usage: Content organization
import { Tabs } from "@/components/ui/tabs"

// Implementations:
- Dashboard views
- Settings panels
- Gallery layouts
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
```

#### Toast
```typescript
// Usage: Temporary notifications
import { Toast } from "@/components/ui/toast"

// Types:
- Success messages
- Error notifications
- Process updates
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
