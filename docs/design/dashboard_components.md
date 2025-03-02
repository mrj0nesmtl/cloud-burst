# 📊 Dashboard Components [Beta v0.1.17]
📅 *Updated: March 1, 2025*

## 📌 Overview
Cloud Burst's dashboard components provide a robust interface for system management.

## 🎯 Core Components

### DashboardShell
```typescript
import { DashboardShell } from "@/components/dashboard/shell"

type DashboardShellProps = {
  children: React.ReactNode
  header?: React.ReactNode
  sidebar?: React.ReactNode
}
```

### DashboardHeader
```typescript
import { DashboardHeader } from "@/components/dashboard/header"

type DashboardHeaderProps = {
  user: User
  title: string
  description?: string
  actions?: React.ReactNode
}
```

### DashboardNav
```typescript
import { DashboardNav } from "@/components/dashboard/nav"

type DashboardNavProps = {
  items: NavItem[]
  user: User
}
```

## 🔄 State Management
- Zustand store integration
- TanStack Query usage
- Loading states
- Error handling
- Data caching

## 🎨 Layout System
- Responsive grid
- Sidebar navigation
- Header actions
- Content area
- Card layouts

## 📧 Template Management Components

### TemplateList
```typescript
import { TemplateList } from "@/components/notifications/template-list"

type TemplateListProps = {
  templates: Template[]
  onSelect: (template: Template) => void
  isLoading?: boolean
}
```

### TemplateEditor
```typescript
import { TemplateEditor } from "@/components/notifications/template-editor"

type TemplateEditorProps = {
  template: Template
  onSave: (template: Template) => Promise<void>
  onPreview: (template: Template) => void
  isLoading?: boolean
}
```

### TemplatePreview
```typescript
import { TemplatePreview } from "@/components/notifications/template-preview"

type TemplatePreviewProps = {
  template: Template
  sampleData?: Record<string, any>
  onClose: () => void
}
```

## 📊 Analytics Components
- Usage statistics
- Performance metrics
- User engagement
- Template delivery tracking
- Event participation 