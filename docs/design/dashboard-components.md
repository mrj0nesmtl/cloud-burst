# Dashboard Component Standards

> **Version:** 0.8.0  
> **Last Updated:** April 20, 2025  
> **Status:** Active

## Overview

This document outlines the standards and best practices for dashboard components in the Cloud Burst application. These guidelines ensure consistency, accessibility, and performance across all dashboard interfaces.

## Component Architecture

### Layout Structure

All dashboard pages follow this structure:

```tsx
// Standard dashboard page layout
export default function DashboardPage() {
  return (
    <div className="p-6 w-full space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Page Title</h1>
        <div className="flex items-center gap-3">
          {/* Action buttons */}
        </div>
      </div>
      
      {/* Main content */}
      <div className="space-y-6">
        {/* Content sections */}
      </div>
    </div>
  );
}
```

### Component Hierarchy

Dashboard components follow Atomic Design principles:

1. **Atoms**: Basic UI elements (buttons, inputs, icons)
2. **Molecules**: Simple component combinations (search bars, stat cards)
3. **Organisms**: Complex components (data tables, media grids)
4. **Templates**: Page layouts without content
5. **Pages**: Complete interfaces with content

## Core Dashboard Components

### Page Header

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold">{title}</h1>
    {description && (
      <p className="text-muted-foreground mt-1">{description}</p>
    )}
  </div>
  <div className="flex items-center gap-3">
    {/* Action buttons */}
    {actions}
  </div>
</div>
```

### Card Components

Standard card wrapper:

```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
  <div className="flex flex-col space-y-1.5 mb-4">
    <h3 className="text-xl font-semibold">{title}</h3>
    {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
  </div>
  <div>
    {children}
  </div>
</div>
```

### Stat Cards

```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
  <div className="flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <h3 className="text-2xl font-bold mt-1">{value}</h3>
      {change && (
        <p className={cn(
          "text-sm font-medium mt-1",
          change > 0 ? "text-green-600" : "text-red-600"
        )}>
          {change > 0 ? "↑" : "↓"} {Math.abs(change)}%
        </p>
      )}
    </div>
    <div className="h-12 w-12 flex items-center justify-center rounded-full bg-primary/10 text-primary">
      {icon}
    </div>
  </div>
</div>
```

### Data Tables

```tsx
<div className="rounded-lg border">
  <div className="flex items-center justify-between p-4">
    <h3 className="font-medium">{title}</h3>
    {filters}
  </div>
  <Table>
    <TableHeader>
      <TableRow>
        {headers.map((header) => (
          <TableHead key={header.key}>{header.label}</TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {data.map((row) => (
        <TableRow key={row.id}>
          {headers.map((header) => (
            <TableCell key={`${row.id}-${header.key}`}>
              {row[header.key]}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
  <div className="p-4 border-t">
    {pagination}
  </div>
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 rounded-lg border border-dashed text-center">
  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
    {icon}
  </div>
  <h3 className="text-lg font-medium mb-1">{title}</h3>
  <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
  {action && (
    <Button>{actionText}</Button>
  )}
</div>
```

### Loading States

Each component should have a dedicated loading state:

```tsx
{isLoading ? (
  <div className="p-6 flex items-center justify-center">
    <LoadingSpinner size="md" />
  </div>
) : (
  // Component content
)}
```

For data tables, use skeleton loaders:

```tsx
<TableRow>
  {Array(5).fill(0).map((_, i) => (
    <TableCell key={i}>
      <Skeleton className="h-6 w-full" />
    </TableCell>
  ))}
</TableRow>
```

## Navigation Components

### Sidebar Navigation

```tsx
<aside className="fixed left-0 top-0 z-20 h-full w-64 border-r bg-background">
  <div className="flex h-16 items-center border-b px-4">
    <Logo />
  </div>
  <div className="px-3 py-4">
    <ul className="space-y-1">
      {items.map((item) => (
        <SidebarItem key={item.path} item={item} />
      ))}
    </ul>
  </div>
</aside>
```

### Section Headers

```tsx
<div className="px-3 py-2">
  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
    {title}
  </h2>
</div>
```

### Breadcrumbs

```tsx
<div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
  {breadcrumbs.map((crumb, index) => (
    <React.Fragment key={crumb.path}>
      {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
      <Link href={crumb.path} className={cn(
        "hover:text-foreground transition-colors",
        index === breadcrumbs.length - 1 && "font-medium text-foreground"
      )}>
        {crumb.label}
      </Link>
    </React.Fragment>
  ))}
</div>
```

## Form Components

### Section Forms

```tsx
<div className="space-y-6">
  <div>
    <h3 className="text-lg font-medium mb-1">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
  <Separator />
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* Form fields */}
      <div className="flex justify-end">
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : "Save Changes"}
        </Button>
      </div>
    </form>
  </Form>
</div>
```

### Input Groups

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
  <FormField
    control={form.control}
    name="firstName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>First Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
  <FormField
    control={form.control}
    name="lastName"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Last Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
</div>
```

## Responsive Design

All dashboard components must implement responsive behavior:

### Responsive Layout

```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
  {/* Stat cards */}
</div>
```

### Responsive Tables

```tsx
// For small screens
<div className="block md:hidden">
  {data.map((item) => (
    <div key={item.id} className="rounded-lg border p-4 mb-4">
      {/* Mobile card view of table row */}
    </div>
  ))}
</div>

// For larger screens
<div className="hidden md:block">
  <Table>
    {/* Table implementation */}
  </Table>
</div>
```

### Mobile Navigation

```tsx
// Mobile toolbar
<div className="fixed bottom-0 left-0 z-50 w-full h-16 border-t bg-background md:hidden">
  <div className="grid h-full grid-cols-4">
    {primaryItems.map((item) => (
      <MobileNavItem key={item.path} item={item} />
    ))}
  </div>
</div>
```

## Performance Considerations

### Component Optimization

- Use `React.memo` for pure components that render frequently
- Implement virtualization for long lists using `react-virtualized` or similar
- Lazy load components that aren't immediately visible

```tsx
// Example of optimized component
const StatCard = React.memo(({ label, value, icon, change }) => {
  return (
    // Component implementation
  );
});
```

### Data Fetching

- Use TanStack Query for data fetching with proper caching
- Implement pagination for large datasets
- Use optimistic updates for better UX

```tsx
// Example of optimized data fetching
const { data, isLoading, error } = useQuery({
  queryKey: ['events', page, pageSize],
  queryFn: () => fetchEvents({ page, pageSize }),
  keepPreviousData: true,
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

## Accessibility Standards

All dashboard components must meet WCAG 2.1 AA standards:

- Use semantic HTML elements
- Implement proper focus management
- Ensure sufficient color contrast
- Provide text alternatives for non-text content
- Support keyboard navigation

## Theme Support

All components must support both light and dark themes:

```tsx
// Example of theme-aware component
<div className={cn(
  "rounded-lg border shadow-sm p-6",
  "bg-card text-card-foreground"
)}>
  {/* Content */}
</div>
```

## Error Handling

### Error States

```tsx
{error ? (
  <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-800 dark:bg-red-900/10 dark:text-red-400 dark:border-red-800/20">
    <div className="flex items-center">
      <AlertTriangle className="h-5 w-5 mr-2" />
      <h3 className="font-medium">Error loading data</h3>
    </div>
    <p className="mt-2 text-sm">{error.message}</p>
    <Button variant="outline" className="mt-4" onClick={retry}>
      Try Again
    </Button>
  </div>
) : (
  // Component content
)}
```

## Examples

### Dashboard Overview

```tsx
export default function DashboardOverview() {
  return (
    <div className="p-6 w-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button>Create Event</Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          label="Total Events" 
          value="24" 
          icon={<Calendar />} 
          change={12} 
        />
        <StatCard 
          label="Total Photos" 
          value="2,845" 
          icon={<Image />} 
          change={8} 
        />
        <StatCard 
          label="Active Guests" 
          value="142" 
          icon={<Users />} 
          change={-3} 
        />
        <StatCard 
          label="Storage Used" 
          value="4.2 GB" 
          icon={<Database />} 
          change={15} 
        />
      </div>
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard
          title="Engagement Overview"
          chart={<EngagementChart data={chartData} />}
        />
        <ActivityFeed activities={recentActivities} />
      </div>
      
      <div className="rounded-lg border">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Recent Events</h3>
          <Link href="/events" className="text-sm text-primary hover:underline">
            View All
          </Link>
        </div>
        <EventsTable events={recentEvents} />
      </div>
    </div>
  );
}
```

## References

- [Shadcn/ui Components](https://ui.shadcn.com/) - Base component library
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Styling framework
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards
- [Next.js App Router](https://nextjs.org/docs/app) - Routing and rendering framework 