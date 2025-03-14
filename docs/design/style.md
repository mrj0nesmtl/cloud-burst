# 📝 Style Guide

## Cloud Burst Design System
📅 *Updated: March 14, 2025*
📊 *Version: 0.7.7*

## 📌 Situational Abstract

The Cloud Burst design system continues to evolve as we recover from recent technical setbacks and implement enhanced features. Since the project's inception in February 2025, we've established a comprehensive set of design standards, code conventions, and documentation practices that guide our development process.

Our design system now provides clear guidelines for colors, typography, spacing, and component styling, creating a unified visual language that enhances user experience. The recent authentication system repair and dashboard implementation have reinforced our commitment to strict TypeScript standards and component architecture, improving code quality and maintainability. Our focus on responsive design ensures that components work seamlessly across devices, particularly important for the dashboard and event management features.

As we approach our revised April 15, 2025 launch date, the design system is approximately 85% complete, with current refinements focused on implementing the comprehensive dashboard functionality for event organizers while maintaining our established accessibility standards and performance requirements. The system effectively balances aesthetic considerations with technical implementation needs, ensuring consistent user experiences across all platform features.

## 🎨 Design Standards
1. **Colors**
   ```typescript
   primary: "hsl(var(--primary))"
   secondary: "hsl(var(--secondary))"
   accent: "hsl(var(--accent))"
   background: "hsl(var(--background))"
   foreground: "hsl(var(--foreground))"
   muted: "hsl(var(--muted))"
   muted-foreground: "hsl(var(--muted-foreground))"
   card: "hsl(var(--card))"
   card-foreground: "hsl(var(--card-foreground))"
   border: "hsl(var(--border))"
   input: "hsl(var(--input))"
   ring: "hsl(var(--ring))"
   destructive: "hsl(var(--destructive))"
   destructive-foreground: "hsl(var(--destructive-foreground))"
   success: "hsl(var(--success))"
   success-foreground: "hsl(var(--success-foreground))"
   warning: "hsl(var(--warning))"
   warning-foreground: "hsl(var(--warning-foreground))"
   info: "hsl(var(--info))"
   info-foreground: "hsl(var(--info-foreground))"
   ```

2. **Typography**
   ```typescript
   fontSans: "'Inter', sans-serif"
   fontMono: "'Fira Code', monospace"
   fontHeading: "'Inter', sans-serif"
   
   // Font weights
   fontWeight: {
     light: 300,
     normal: 400,
     medium: 500,
     semibold: 600,
     bold: 700,
   }
   
   // Line heights
   lineHeight: {
     tight: 1.2,
     normal: 1.5,
     relaxed: 1.75,
   }

   // Font sizes
   fontSize: {
     xs: ['0.75rem', { lineHeight: '1rem' }],
     sm: ['0.875rem', { lineHeight: '1.25rem' }],
     base: ['1rem', { lineHeight: '1.5rem' }],
     lg: ['1.125rem', { lineHeight: '1.75rem' }],
     xl: ['1.25rem', { lineHeight: '1.75rem' }],
     '2xl': ['1.5rem', { lineHeight: '2rem' }],
     '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
     '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
     '5xl': ['3rem', { lineHeight: '1' }],
     '6xl': ['3.75rem', { lineHeight: '1' }],
   }
   ```

3. **Spacing**
   ```typescript
   space: {
     px: "1px",
     0.5: "0.125rem",
     1: "0.25rem",
     1.5: "0.375rem",
     2: "0.5rem",
     2.5: "0.625rem",
     3: "0.75rem",
     3.5: "0.875rem",
     4: "1rem",
     5: "1.25rem",
     6: "1.5rem",
     7: "1.75rem",
     8: "2rem",
     9: "2.25rem",
     10: "2.5rem",
     11: "2.75rem",
     12: "3rem",
     14: "3.5rem",
     16: "4rem",
     20: "5rem",
     24: "6rem",
     28: "7rem",
     32: "8rem",
     36: "9rem",
     40: "10rem",
     44: "11rem",
     48: "12rem",
     52: "13rem",
     56: "14rem",
     60: "15rem",
     64: "16rem",
     72: "18rem",
     80: "20rem",
     96: "24rem",
   }
   ```

4. **Shadows**
   ```typescript
   shadows: {
     sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
     DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
     md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
     lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
     xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
     "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
     inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.05)",
     none: "none",
   }
   ```

5. **Border Radius**
   ```typescript
   borderRadius: {
     none: "0",
     sm: "0.125rem",
     DEFAULT: "0.25rem",
     md: "0.375rem",
     lg: "0.5rem",
     xl: "0.75rem",
     "2xl": "1rem",
     "3xl": "1.5rem",
     full: "9999px",
   }
   ```

6. **Animation**
   ```typescript
   animation: {
     none: 'none',
     spin: 'spin 1s linear infinite',
     ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
     pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
     bounce: 'bounce 1s infinite',
     fadeIn: 'fadeIn 0.3s ease-in-out',
     slideIn: 'slideIn 0.3s ease-in-out',
     expandIn: 'expandIn 0.2s ease-out',
   }
   ```

## 💻 Code Style
1. **TypeScript**
   - ✅ Strict mode enabled
   - ✅ Interface over type when appropriate
   - ✅ Explicit return types for functions
   - ✅ Proper error handling with typed errors
   - ✅ Comprehensive comments using TSDoc format
   - ✅ Consistent naming conventions
   - ✅ Proper use of generics
   - ✅ Null checking and undefined handling
   - ✅ Zod schemas for runtime validation
   - ✅ Type-safe event handling
   - ✅ Strong typing for API responses

2. **React**
   - ✅ Functional components with proper typing
   - ✅ Custom hooks for reusable logic
   - ✅ Proper prop types with defaults
   - ✅ Error boundaries for component isolation
   - ✅ Performance optimization (memoization, etc.)
   - ✅ Controlled components for forms
   - ✅ Proper key usage in lists
   - ✅ Context API for state sharing
   - ✅ React Hook Form for form management
   - ✅ Server components where appropriate
   - ✅ Role-based component rendering

3. **CSS/Tailwind**
   - ✅ Utility-first approach with Tailwind
   - ✅ Component classes for reusable patterns
   - ✅ Responsive design with mobile-first approach
   - ✅ Dark mode support with proper contrast
   - ✅ Accessibility classes for focus states
   - ✅ Consistent spacing using theme values
   - ✅ Animation and transition standards
   - ✅ CSS variables for theme customization
   - ✅ Group modifiers for interactive states
   - ✅ Container queries for advanced responsiveness
   - ✅ Semantic color usage with variables

4. **File Structure**
   - ✅ Consistent file naming (kebab-case for files)
   - ✅ Logical directory organization
   - ✅ Index files for clean imports
   - ✅ Co-location of related files
   - ✅ Separation of concerns
   - ✅ Feature-based organization
   - ✅ Shared utilities in common locations
   - ✅ Environment-specific configuration
   - ✅ Route group organization in app directory
   - ✅ Component directory structure (ui, layout, features)
   - ✅ Parallel route organization

## 📚 Documentation
1. **Markdown**
   - ✅ Clear headings with hierarchy
   - ✅ Code blocks with language specification
   - ✅ Examples with context
   - ✅ Links to related documentation
   - ✅ Images with descriptive alt text
   - ✅ Tables for structured data
   - ✅ Lists for sequential information
   - ✅ Blockquotes for important notes
   - ✅ Task lists for status tracking
   - ✅ Diagrams using Mermaid
   - ✅ Version metadata and update dates

2. **Comments**
   - ✅ TSDoc format for functions and classes
   - ✅ Clear descriptions of purpose
   - ✅ Parameter documentation with types
   - ✅ Return type documentation
   - ✅ Examples of usage
   - ✅ Edge case notes
   - ✅ Deprecation notices when applicable
   - ✅ Links to related code
   - ✅ Auth/permission requirements
   - ✅ Performance considerations
   - ✅ Security implications

3. **API Documentation**
   - ✅ Endpoint descriptions
   - ✅ Request and response formats
   - ✅ Authentication requirements
   - ✅ Error codes and handling
   - ✅ Rate limiting information
   - ✅ Example requests and responses
   - ✅ Versioning information
   - ✅ Deprecation notices
   - ✅ Permission requirements
   - ✅ Data validation rules
   - ✅ Rate limit documentation

## 📊 Dashboard Design

1. **Dashboard Layout**
   ```typescript
   // Main layout structure
   <DashboardLayout>
     <SideNav />
     <main className="flex-1 p-6 overflow-y-auto">
       <DashboardHeader />
       <div className="grid gap-6 mt-6">
         {children}
       </div>
     </main>
   </DashboardLayout>
   ```

2. **Dashboard Components**
   ```typescript
   // Component styling
   <Card className="p-6 shadow-md">
     <CardHeader>
       <CardTitle>Dashboard Component</CardTitle>
     </CardHeader>
     <CardContent>
       {/* Component content */}
     </CardContent>
     <CardFooter>
       {/* Component actions */}
     </CardFooter>
   </Card>
   ```

3. **Dashboard Grid**
   ```typescript
   // Main grid layout
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
     <DashboardCard />
     <DashboardCard />
     <DashboardCard className="md:col-span-2" />
   </div>
   ```

4. **Dashboard Statistics**
   ```typescript
   // Stats card styling
   <Card className="bg-primary/5">
     <CardContent className="p-6">
       <div className="flex items-center justify-between">
         <div>
           <p className="text-sm font-medium text-muted-foreground">Total Events</p>
           <h3 className="text-2xl font-bold">256</h3>
         </div>
         <div className="p-3 bg-primary/10 rounded-full">
           <CalendarIcon className="h-6 w-6 text-primary" />
         </div>
       </div>
     </CardContent>
   </Card>
   ```

## 📧 Email Template Styling
1. **HTML Email Standards**
   ```html
   <!-- Table-based layout -->
   <table cellpadding="0" cellspacing="0" border="0" width="100%">
     <tr>
       <td style="padding: 20px; font-family: sans-serif;">
         Content
       </td>
     </tr>
   </table>
   ```

2. **Email Typography**
   ```css
   /* Web-safe fonts */
   font-family: Arial, Helvetica, sans-serif;
   font-size: 16px;
   line-height: 1.5;
   color: #333333;
   ```

3. **Email Colors**
   ```css
   /* Brand colors */
   color: #3b82f6; /* primary */
   background-color: #ffffff; /* background */
   border-color: #e5e7eb; /* border */
   ```

4. **Responsive Email**
   ```css
   /* Mobile-first approach */
   @media screen and (max-width: 600px) {
     .email-container {
       width: 100% !important;
     }
     .email-content {
       padding: 10px !important;
     }
     .email-button {
       width: 100% !important;
       text-align: center !important;
     }
   }
   ```

5. **Email Accessibility**
   - ✅ Alt text for all images
   - ✅ Semantic HTML structure
   - ✅ Sufficient color contrast (4.5:1 minimum)
   - ✅ Text alternatives for buttons
   - ✅ Clear hierarchy with headings
   - ✅ Descriptive link text
   - ✅ Proper table structure with headers
   - ✅ Language attribute on HTML tag

## 🖼️ Image Standards

1. **Formats and Optimization**
   - ✅ JPEG for photographs (.jpg)
   - ✅ PNG for graphics with transparency (.png)
   - ✅ SVG for icons and simple graphics (.svg)
   - ✅ WebP for modern browsers with fallbacks (.webp)
   - ✅ Proper compression for web delivery
   - ✅ Responsive image srcsets
   - ✅ Lazy loading implementation
   - ✅ Appropriate dimensions for context
   - ✅ Next.js Image component usage
   - ✅ Blur placeholders for large images
   - ✅ Quality optimization strategies

2. **Naming Conventions**
   ```
   [component]-[variant]-[size].[format]
   example: button-primary-lg.svg
   ```

3. **Asset Organization**
   ```
   /public
     /images
       /ui
         /icons
         /logos
         /backgrounds
       /content
         /events
         /profiles
         /marketing
   ```

## 📱 Responsive Design

1. **Breakpoints**
   ```typescript
   // Default breakpoints
   screens: {
     sm: '640px',
     md: '768px',
     lg: '1024px',
     xl: '1280px',
     '2xl': '1536px',
   }
   ```

2. **Mobile-First Approach**
   ```typescript
   // Mobile-first example
   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
     {/* Content */}
   </div>
   ```

3. **Container Queries**
   ```typescript
   // Container query example
   <div className="@container">
     <div className="@md:grid @md:grid-cols-2 gap-4">
       {/* Content */}
     </div>
   </div>
   ```

4. **Responsive Typography**
   ```typescript
   // Responsive typography
   <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
     Heading Text
   </h1>
   ```

5. **Touch Targets**
   ```typescript
   // Proper touch target sizing
   <button className="h-10 min-w-10 px-4 rounded-md">
     Button Text
   </button>
   ```

## 🎯 Component Best Practices

1. **Accessibility**
   - ✅ Semantic HTML elements
   - ✅ ARIA attributes when necessary
   - ✅ Keyboard navigation support
   - ✅ Focus management
   - ✅ Screen reader announcements
   - ✅ Color contrast compliance
   - ✅ Reduced motion alternatives
   - ✅ Form labeling and validation
   - ✅ Error identification
   - ✅ Focus visible indicators

2. **Performance**
   - ✅ Code splitting
   - ✅ Tree shaking
   - ✅ Component memoization
   - ✅ Lazy loading
   - ✅ Image optimization
   - ✅ Bundle size monitoring
   - ✅ Virtualization for long lists
   - ✅ Efficient re-renders
   - ✅ Reducing layout shifts
   - ✅ Optimized animations

3. **Role-Based UI**
   - ✅ Permission-based component rendering
   - ✅ Role-specific UI elements
   - ✅ Conditional navigation items
   - ✅ Context-aware actions
   - ✅ Ownership verification
   - ✅ Subscription-based feature access

## 🔄 Implementation Progress

As we approach our revised April 15, 2025 launch date, our design system has reached a stable foundation with most standards fully defined and implemented. The recent authentication system repair and dashboard implementation have reinforced our commitment to code quality and design consistency.

### Key Achievements:
- ✅ Comprehensive color system with dark mode support
- ✅ Typography standards with responsive scaling
- ✅ Component styling guidelines with consistent patterns
- ✅ Enhanced dashboard design system
- ✅ Form design standards with validation states
- ✅ Role-based UI patterns
- ✅ Code style enforcement with ESLint and Prettier
- ✅ Documentation standards with consistent formatting

### Current Focus (Session 22):
- 🟢 Implementing design patterns for dashboard sections
- 🟢 Standardizing event management components
- 🟢 Developing attendee management UI patterns
- 🟢 Enhancing gallery component visual language
- 🟢 Finalizing settings section design patterns
- 🟢 Testing responsive layouts across devices

### Next Steps:
1. Complete design patterns for all dashboard sections
2. Standardize component visual language across features
3. Enhance mobile experience for complex workflows
4. Refine animation standards for interactive elements
5. Document all component design patterns
6. Ensure accessibility compliance across all features 